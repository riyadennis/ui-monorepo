#!/usr/bin/env bash
#
# One-time IAM setup so the GitHub Actions workflow (.github/workflows/build-push.yml)
# can push images to ECR Public via OIDC — no long-lived AWS keys in GitHub.
#
# Creates:
#   1. A GitHub OIDC identity provider (token.actions.githubusercontent.com)
#   2. An IAM role (github-actions-ecr) that trusts that provider, scoped to this
#      repo, with permissions to push to ECR Public.
#
# Run once with an AWS identity that can manage IAM (e.g. an admin profile):
#   ./deploy/aws/setup-github-oidc.sh
#
# Safe to re-run: existing resources are detected and reused/updated.
set -euo pipefail

# ---- Config ----------------------------------------------------------------
ACCOUNT_ID="328411615730"
GITHUB_REPO="riyadennis/ui-monorepo"   # owner/repo the role will trust
ROLE_NAME="github-actions-ecr"
OIDC_URL="token.actions.githubusercontent.com"
OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_URL}"
# ---------------------------------------------------------------------------

echo "==> 1/3  Ensuring GitHub OIDC provider exists"
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1; then
  echo "    provider already exists: $OIDC_ARN"
else
  aws iam create-open-id-connect-provider \
    --url "https://${OIDC_URL}" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list \
      "6938fd4d98bab03faadb97b34396831e3780aea1" \
      "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  echo "    created provider: $OIDC_ARN"
fi

echo "==> 2/3  Creating / updating the IAM role trust policy"
# Trust: only GitHub Actions runs from this repo may assume the role.
# Scope is repo:<owner>/<repo>:* (any branch/tag/workflow_dispatch). Tighten to
# e.g. "repo:${GITHUB_REPO}:ref:refs/heads/main" to restrict to the main branch.
TRUST_POLICY=$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "${OIDC_ARN}" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_URL}:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "${OIDC_URL}:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
JSON
)

if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "$ROLE_NAME" \
    --policy-document "$TRUST_POLICY"
  echo "    updated trust policy on existing role: $ROLE_NAME"
else
  aws iam create-role --role-name "$ROLE_NAME" \
    --description "GitHub Actions OIDC role for pushing images to ECR Public" \
    --assume-role-policy-document "$TRUST_POLICY"
  echo "    created role: $ROLE_NAME"
fi

echo "==> 3/3  Attaching ECR Public push permissions"
# GetAuthorizationToken + GetServiceBearerToken are required for `docker login`
# to ECR Public; the rest cover creating repos and pushing image layers.
PERMISSIONS_POLICY=$(cat <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPublicAuth",
      "Effect": "Allow",
      "Action": [
        "ecr-public:GetAuthorizationToken",
        "sts:GetServiceBearerToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRPublicPush",
      "Effect": "Allow",
      "Action": [
        "ecr-public:DescribeRepositories",
        "ecr-public:CreateRepository",
        "ecr-public:BatchCheckLayerAvailability",
        "ecr-public:InitiateLayerUpload",
        "ecr-public:UploadLayerPart",
        "ecr-public:CompleteLayerUpload",
        "ecr-public:PutImage"
      ],
      "Resource": "*"
    }
  ]
}
JSON
)

aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name "ecr-public-push" \
  --policy-document "$PERMISSIONS_POLICY"
echo "    attached inline policy: ecr-public-push"

echo
echo "Done. Role ARN for the workflow:"
echo "  arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
