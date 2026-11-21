# Deploy to a single-node k3s cluster on EC2 (learning runbook)

A step-by-step guide to hosting this site + the pbac API on a self-managed
Kubernetes cluster (k3s) on one EC2 instance, with PostgreSQL on Amazon RDS.

This is a **learning exercise** — it's deliberately hand-driven (no Terraform /
Helm charts) so each piece is visible. Everything here is transferable to a real
multi-node cluster or EKS later.

## Architecture

```
Route53 (your domain) ──▶ Elastic IP ──▶ EC2 (k3s, Traefik disabled)
                                           ├─ ingress-nginx + cert-manager (TLS)
                                           ├─ Ingress  → web Service :80
                                           ├─ web      Deployment (nginx: static + /api proxy)
                                           └─ pbac     Deployment → pbac Service :8080
                                                          │
                                                          ▼
                                          Amazon RDS (PostgreSQL)
```

The browser only ever talks to the `web` pod. nginx inside it serves the static
build and proxies `/api/*` to the `pbac` Service — the production equivalent of
the Vite dev proxy. pbac runs its DB migrations on startup against RDS.

## Files

| File | Purpose |
| --- | --- |
| `../apps/web/Dockerfile` | Builds the static site, serves it with nginx |
| `../apps/web/nginx.conf` | Static serving + SPA fallback + `/api` → pbac proxy |
| `k8s/00-namespace.yaml` | `riyadennis` namespace |
| `k8s/pbac.yaml` | pbac Deployment + Service |
| `k8s/web.yaml` | web Deployment + Service |
| `k8s/pbac-secret.example.yaml` | Template for the RDS connection string |
| `k8s/ingress.yaml` | Domain routing + TLS |
| `k8s/clusterissuer.yaml` | Let's Encrypt issuer |

---

## 0. Prerequisites

- An AWS account, and a domain you control (DNS managed anywhere).
- A container registry. This guide uses **Docker Hub** (`riyadennis/...`).
- Local tools: `docker`, `kubectl`, `ssh`, and the `pbac` repo checked out.

## 1. Provision PostgreSQL on RDS

1. RDS → Create database → PostgreSQL, Free tier / `db.t4g.micro`.
2. Set master user `pbac`, a strong password, initial DB name `pbac`.
3. Networking: same VPC you'll launch the EC2 box in. **Not** publicly accessible.
4. After creation, note the **endpoint**. Edit its security group to allow
   inbound TCP **5432 from the EC2 instance's security group** (step 2).

Connection string (used in step 6, note `sslmode=require` for RDS):

```
postgres://pbac:<password>@<rds-endpoint>:5432/pbac?sslmode=require
```

## 2. Launch the EC2 instance

1. Ubuntu 22.04, **t3.small** (2 GB) minimum — `t3.medium` is comfier.
2. Security group inbound: **22** (your IP), **80**, **443** (0.0.0.0/0).
3. Allocate an **Elastic IP** and associate it (so the IP survives reboots).
4. Confirm the instance's SG is allowed inbound on the RDS SG (step 1.4).

## 3. Install k3s (Traefik disabled, we use ingress-nginx)

SSH in, then:

```bash
curl -sfL https://get.k3s.io | sh -s - --disable traefik --write-kubeconfig-mode 644
# sanity check
sudo k3s kubectl get nodes
```

Copy `/etc/rancher/k3s/k3s.yaml` to your laptop (replace the server IP with the
Elastic IP) to use `kubectl` locally, or just run `kubectl` on the box.

## 4. Install ingress-nginx + cert-manager

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
kubectl -n cert-manager rollout status deploy/cert-manager-webhook
```

> On a single node, ingress-nginx's Service is `LoadBalancer`; k3s's ServiceLB
> (klipper) will bind it to the node's ports 80/443, which your SG already allows.

## 5. Build and push the images

**web** (build context is the repo root):

```bash
# from the ui-monorepo root
docker build -t riyadennis/web:latest -f apps/web/Dockerfile .
docker push riyadennis/web:latest
```

**pbac** (from the pbac repo):

```bash
cd ~/go/src/github.com/riyadennis/pbac
docker build -t riyadennis/pbac:latest .
docker push riyadennis/pbac:latest
```

If your Docker Hub repositories are private, create a pull secret and add it to
the Deployments' `imagePullSecrets`:

```bash
kubectl -n riyadennis create secret docker-registry dockerhub \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=riyadennis --docker-password=<DOCKERHUB_TOKEN>
```

## 6. Create the namespace and the DB secret

```bash
kubectl apply -f deploy/k8s/00-namespace.yaml

cp deploy/k8s/pbac-secret.example.yaml deploy/k8s/pbac-secret.yaml
# edit pbac-secret.yaml → paste the real RDS DATABASE_URL (git-ignored)
kubectl apply -f deploy/k8s/pbac-secret.yaml
```

## 7. Deploy the workloads

> **Order matters.** nginx resolves the `pbac` hostname in its `proxy_pass` at
> startup, so the web pod will crash-loop until the `pbac` Service exists. Apply
> `pbac.yaml` first (it creates the Service), then `web.yaml`.

```bash
kubectl apply -f deploy/k8s/pbac.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl -n riyadennis rollout status deploy/pbac
kubectl -n riyadennis rollout status deploy/web
# watch migrations / startup
kubectl -n riyadennis logs deploy/pbac
```

## 8. DNS, TLS, ingress

1. Point an **A record** for your domain at the **Elastic IP**.
2. Edit `deploy/k8s/clusterissuer.yaml` (your email) and `ingress.yaml` (your
   domain), then:

```bash
kubectl apply -f deploy/k8s/clusterissuer.yaml
kubectl apply -f deploy/k8s/ingress.yaml
# cert-manager issues the cert once DNS resolves to the box (HTTP-01 challenge)
kubectl -n riyadennis get certificate -w
```

## 9. Verify

```bash
curl -I https://<your-domain>/            # 200, served by web/nginx
curl    https://<your-domain>/api/policies # JSON from pbac via the /api proxy
```

Then open the site and the pbac playground page.

---

## Security (do this before going public)

pbac is currently an **unauthenticated write API**. Exposed at a public URL it is
an open database for the internet. Before leaving it up, at minimum: put it behind
auth (or make it read-only), and add rate limiting at the ingress. Consider only
exposing the Rego generator publicly and gating the pbac playground.

## Cost & teardown

Rough monthly cost: `t3.small` (~$15) + EBS + Elastic IP + `db.t4g.micro` RDS.
To stop charges: delete the RDS instance (snapshot first if you want), terminate
the EC2 instance, and release the Elastic IP (idle EIPs are billed).

## Where this goes next

- **GitOps**: install Argo CD and point it at `deploy/k8s/` so pushes to `main`
  reconcile the cluster — a natural showcase given your background.
- **CI**: a GitHub Actions workflow to build+push both images on release.
- **Multi-node / EKS**: the manifests are portable; only the cluster install and
  the ingress LoadBalancer provisioning change.
```
