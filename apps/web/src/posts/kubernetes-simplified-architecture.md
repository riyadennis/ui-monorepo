Kubernetes is a tool designed to automatically deploy, scale, and maintain software systems that must adapt to dynamic user requirements and evolving technologies. Developed by Google, it enables smooth delivery and maintenance of complex software solutions.

## Understanding Nodes and Clusters

The fundamental infrastructure component in Kubernetes is the Node — a physical or virtual machine running on-premises or in the cloud. Two types exist: master nodes and worker nodes (also called minions). Multiple nodes together form a cluster.

![Kubernetes cluster architecture: a master node with the Kube API Server, Scheduler, Controller Managers and ETCD, connected to worker nodes running the Kubelet, container runtime and Kube proxy.](/k8s.webp)

## Master Node Components

The master node manages scheduling and container execution across worker nodes. Its components comprise the control plane. Key elements include:

- **etcd**: A highly available key-value store maintaining container catalogs and state information
- **Scheduler**: Evaluates container requirements and available node resources to determine optimal placement
- **Controller Managers**: Including node controllers for onboarding new nodes and replication controllers for managing container counts
- **Kube API Server**: Orchestrates communication between components and exposes the Kubernetes API

## Worker Node Components

Worker nodes require:

- **Container Runtime**: Software (typically Docker) for running containers
- **Kubelet**: An agent managing containers and communicating status to the master node
- **Kube Proxy**: Enables inter-worker node communication

## Production Setup Requirements

Establishing a production-ready cluster requires at least two machines and these steps:

- Install container runtime (Docker or containerd)
- Install the kubeadm tool on all machines
- Initialize the master server
- Configure pod networking
- Join worker nodes to the master

For local development, minikube offers a simpler single-node alternative.
