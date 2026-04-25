# Three-Tier DevSecOps Web Application on AWS EKS

A complete DevSecOps implementation deploying a three-tier web application on AWS Elastic Kubernetes Service (EKS) with automated CI/CD pipelines, comprehensive security scanning, and GitOps-based continuous delivery.

**Submitted by:** Salman Khan (22I-1285) · Maryum Tanvir (22I-0751)  
**Course:** Cloud Computing — FAST NUCES Islamabad  
**AWS Region:** `us-east-1` (US East — N. Virginia)

---

## 📋 Project Overview

This project demonstrates a production-ready deployment of a three-tier application using modern DevSecOps practices. The pipeline integrates Infrastructure as Code (Terraform), continuous integration/deployment (Jenkins + ArgoCD), and comprehensive security scanning (Trivy, SonarQube, and OWASP Dependency-Check) on AWS cloud infrastructure.

The application consists of:
- **Frontend**: React.js user interface
- **Backend**: Node.js / Express RESTful API
- **Database**: MongoDB with persistent EBS-backed storage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           AWS Cloud (us-east-1)                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               EKS Cluster  (three-tier-k8s-eks-cluster)  │   │
│  │  Namespace: three-tier                                   │   │
│  │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐   │   │
│  │  │ Frontend  │  │  Backend  │  │ MongoDB + EBS PVC  │   │   │
│  │  │   Pods    │  │   Pods    │  │       Pods         │   │   │
│  │  └─────┬─────┘  └─────┬─────┘  └────────────────────┘   │   │
│  │        └──────────────┴──────────────┐                   │   │
│  │                                      ▼                   │   │
│  │              AWS Application Load Balancer (ALB)         │   │
│  │              (created by AWS Load Balancer Controller)   │   │
│  │                                                          │   │
│  │  ┌──────────────┐   ┌──────────────────────────────┐    │   │
│  │  │    ArgoCD    │   │  AWS LB Controller (kube-sys)│    │   │
│  │  │  (argocd ns) │   └──────────────────────────────┘    │   │
│  │  └──────────────┘                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Jenkins EC2     │  │  Amazon ECR  │  │   S3 Bucket     │  │
│  │  (CI Server)      │  │  frontend    │  │ (Terraform      │  │
│  │  + SonarQube      │  │  backend     │  │  state + lock)  │  │
│  │  :8080 / :9000    │  └──────────────┘  └─────────────────┘  │
│  └───────────────────┘                                          │
│                              ▲                                  │
│        Cloudflare DNS ───────┘  (3devsecops.tech → ALB DNS)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### DevSecOps Pipeline
- **Continuous Integration**: Jenkins pipelines triggered by GitHub webhooks on every push
- **Code Quality**: SonarQube for static code analysis with Quality Gate enforcement
- **Dependency Scanning**: OWASP Dependency-Check with NVD API key integration
- **Container Scanning**: Trivy for both filesystem and Docker image vulnerability scanning
- **Container Registry**: Amazon ECR for private, encrypted Docker image storage

### GitOps Deployment
- **ArgoCD**: Declarative continuous delivery — monitors GitHub and auto-deploys manifest changes
- **5 ArgoCD Applications**: database, backend, frontend, frontend-ingress, backend-ingress
- **Automatic Sync**: New image tags committed by Jenkins automatically trigger ArgoCD deployment

### Infrastructure as Code
- **Terraform**: Jenkins EC2 server fully provisioned with Terraform (7 `.tf` files)
- **eksctl**: EKS cluster created using `eksctl` with `m7i-flex.large` nodes
- **Remote State**: Terraform state stored in S3 (`salman-three-tier-devsecops-project-bucket-s3`)
- **State Locking**: DynamoDB table `lock-files` (partition key: `LockID`) for concurrent-safe state management

### High Availability & Persistence
- **Multi-AZ nodes**: EKS worker nodes distributed across availability zones
- **Persistent Volumes**: MongoDB data backed by EBS volumes via Kubernetes PVC
- **AWS ALB**: Application Load Balancer provisioned automatically by the AWS Load Balancer Controller

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Cloud Platform** | AWS (EKS, EC2, ECR, S3, DynamoDB, IAM, ALB) |
| **Container Orchestration** | Kubernetes (Amazon EKS) |
| **Infrastructure as Code** | Terraform (Jenkins server), eksctl (EKS cluster) |
| **CI/CD** | Jenkins, ArgoCD |
| **Container Runtime** | Docker |
| **Code Quality** | SonarQube |
| **Container Scanning** | Trivy |
| **Dependency Scanning** | OWASP Dependency-Check (NVD API) |
| **Package Manager** | Helm |
| **DNS** | Cloudflare |
| **Version Control** | Git, GitHub |
| **Frontend** | React.js |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |

---

## 📁 Repository Structure

```
Three-Tier-DevSecOps/
├── jenkins-server-terraform/        # Terraform configs for Jenkins EC2 instance
│   ├── 01_provider.tf               # AWS provider configuration
│   ├── 02_backend.tf                # S3 remote backend + DynamoDB locking
│   ├── 03_ec2.tf                    # Jenkins EC2 instance resource
│   ├── 04_ami.tf                    # AMI data source lookup
│   ├── 05_vpc.tf                    # VPC, subnets, security groups
│   ├── 06_iam-role.tf               # IAM role for Jenkins EC2
│   ├── 07_iam-instance-profile.tf   # Instance profile attachment
│   ├── variables.tf                 # Variable definitions
│   └── scripts/                     # User data / install scripts
│
├── kubernetes-manifests/            # Kubernetes deployment manifests (managed by ArgoCD)
│   ├── backend/
│   │   ├── deployment.yaml          # Backend Deployment (image tag updated by Jenkins)
│   │   └── service.yaml
│   ├── frontend/
│   │   ├── deployment.yaml          # Frontend Deployment (image tag updated by Jenkins)
│   │   └── service.yaml
│   ├── database/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml                 # PersistentVolumeClaim for MongoDB (EBS)
│   ├── frontend-ingress/            # Ingress for frontend traffic routing
│   └── backend-ingress/             # Ingress for backend traffic routing
│
├── jenkins-pipeline/                # Jenkinsfiles for CI/CD pipelines
│   ├── jenkinsfile-frontend         # 11-stage frontend CI pipeline
│   └── jenkinsfile-backend          # Backend CI pipeline
│
└── app-code/                        # Application source code
    ├── frontend/
    │   └── notes-frontend/          # React.js frontend source
    │       └── Dockerfile
    └── backend/
        └── Dockerfile               # Backend container image
```

---

## 🚀 Complete Deployment Guide

### Prerequisites

Before starting, ensure you have on your **local machine**:
- [Terraform](https://www.terraform.io/downloads) (v1.0+)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [eksctl](https://eksctl.io/)
- [Helm](https://helm.sh/)
- Git

---

### Step 1: IAM User Setup

**Objective:** Create an IAM user with the permissions needed to provision EKS, EC2, ECR, S3, and DynamoDB resources.

1. Navigate to AWS Console → **IAM → Users → Create User**
2. Enter a username (e.g., `devsecops-user`)
3. Attach **AdministratorAccess** (sufficient for this project; use scoped policies in production)
4. Click **Create User**
5. Open the user → **Security credentials → Create access key**
6. Select **Command Line Interface (CLI)**
7. **Download the CSV file** — it contains your `Access Key ID` and `Secret Access Key`

---

### Step 2: Install & Configure Tools Locally

```bash
# Verify Terraform
terraform --version

# Verify AWS CLI
aws --version

# Configure AWS CLI with downloaded IAM credentials
aws configure
# AWS Access Key ID:     [from CSV]
# AWS Secret Access Key: [from CSV]
# Default region:        us-east-1
# Default output format: json
```

---

### Step 3: Create S3 Bucket & DynamoDB Table (Terraform Backend)

**Via AWS Console:**

**S3 Bucket:**
1. AWS Console → S3 → **Create Bucket**
2. Name: `salman-three-tier-devsecops-project-bucket-s3` (must be globally unique)
3. Region: `us-east-1`
4. Click **Create Bucket**

**DynamoDB Table:**
1. AWS Console → DynamoDB → **Create Table**
2. Table name: `lock-files`
3. Partition key: `LockID` (String)
4. Click **Create Table**

---

### Step 4: Deploy Jenkins EC2 Server with Terraform

```bash
# Clone the repository
git clone https://github.com/povsalman/Three-Tier-DevSecOps.git
cd Three-Tier-DevSecOps/jenkins-server-terraform
```

**1. Update `02_backend.tf`** with your S3 bucket name and region (already set to `salman-three-tier-devsecops-project-bucket-s3` and `us-east-1`).

**2. Create an EC2 Key Pair:**
```bash
aws ec2 create-key-pair \
  --key-name devsecops-project \
  --query "KeyMaterial" \
  --output text > devsecops-project.pem
```

**3. Deploy Jenkins Server:**
```bash
terraform init
terraform validate
terraform plan
terraform apply
```
> Terraform will provision the EC2 instance, VPC, security groups, IAM role, and instance profile.

**4. SSH into the Jenkins Server:**
```bash
# Run from the directory containing devsecops-project.pem
chmod 400 "devsecops-project.pem"
ssh -i "devsecops-project.pem" ubuntu@<JENKINS_EC2_PUBLIC_IP>
```

**5. Configure AWS CLI on Jenkins Server:**
```bash
aws configure
# Enter the same IAM credentials as Step 2
```

---

### Step 5: Install Jenkins Plugins

**Access Jenkins:** `http://<JENKINS_EC2_PUBLIC_IP>:8080`

**Retrieve initial admin password:**
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

1. Paste the password to unlock Jenkins
2. Select **Install Suggested Plugins**
3. After completion, go to **Manage Jenkins → Plugins → Available Plugins** and install:
   - AWS Credentials
   - AWS Steps
   - Docker
   - Eclipse Temurin Installer
   - NodeJS
   - OWASP Dependency-Check
   - SonarQube Scanner
4. Create a Jenkins admin user and complete the setup wizard

---

### Step 6: SonarQube Setup

**Access SonarQube:** `http://<JENKINS_EC2_PUBLIC_IP>:9000`  
**Default credentials:** `admin` / `admin`

1. **Create Frontend Project:** Projects → Create Project → Name: `frontend`
2. **Create Backend Project:** Projects → Create Project → Name: `backend`
3. **Update project keys** in `jenkins-pipeline/jenkinsfile-frontend` and `jenkinsfile-backend` with the project keys shown by SonarQube
4. **Generate a token:** My Account → Security → Tokens → Generate → save the token
5. **Create Webhook:** Administration → Configuration → Webhooks → Create  
   URL: `http://<JENKINS_EC2_IP>:8080/sonarqube-webhook/`

---

### Step 7: Create Amazon ECR Repositories

```bash
# Create frontend repository
aws ecr create-repository --repository-name frontend --region us-east-1

# Create backend repository
aws ecr create-repository --repository-name backend --region us-east-1

# Login Docker to ECR (run on Jenkins server)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

**Update Kubernetes manifests** with the ECR repository URIs:
- `kubernetes-manifests/frontend/deployment.yaml`
- `kubernetes-manifests/backend/deployment.yaml`

**Add Jenkins Credentials** (Manage Jenkins → Credentials → System → Global Credentials):

| Credential ID | Kind | Value |
|---|---|---|
| `aws-key` | Secret text | AWS Access Key ID |
| `GITHUB` | Username with password | GitHub username + Personal Access Token |
| `github` | Secret text | GitHub Personal Access Token |
| `sonar-token` | Secret text | SonarQube token from Step 6 |
| `ECR_REPO_FRONTEND` | Secret text | Frontend ECR repository URL |
| `ECR_REPO_BACKEND` | Secret text | Backend ECR repository URL |
| `ACCOUNT_ID` | Secret text | AWS Account ID |
| `nvd-api-key` | Secret text | Free NVD API key (from nvd.nist.gov) |

---

### Step 8: Configure Jenkins Tools & SonarQube Server

**Manage Jenkins → Tools:**

| Tool | Name |
|---|---|
| JDK | `jdk` (latest) |
| SonarQube Scanner | `sonar-scanner` (latest) |
| NodeJS | `nodejs` (latest) |
| Dependency-Check | `DP-Check` (latest) |
| Docker | `docker` (latest) |

**Manage Jenkins → System → SonarQube installations:**
- Name: `sonar-server`
- Server URL: `http://<JENKINS_EC2_IP>:9000`
- Server authentication token: `sonar-token`

---

### Step 9: Deploy EKS Cluster

```bash
# Create EKS cluster (takes 10–15 minutes)
eksctl create cluster \
  --name three-tier-k8s-eks-cluster \
  --region us-east-1 \
  --node-type m7i-flex.large \
  --nodes-min 2 \
  --nodes-max 2

# Verify cluster is ready
kubectl get nodes
```

**Install AWS Load Balancer Controller:**

```bash
# 1. Download IAM policy
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

# 2. Create IAM policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# 3. Associate OIDC provider
eksctl utils associate-iam-oidc-provider \
  --region=us-east-1 \
  --cluster=three-tier-k8s-eks-cluster \
  --approve

# 4. Create IAM service account
eksctl create iamserviceaccount \
  --cluster=three-tier-k8s-eks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve \
  --region=us-east-1

# 5. Install via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=three-tier-k8s-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# 6. Verify (wait 1–2 minutes)
kubectl get deployment -n kube-system aws-load-balancer-controller
```

---

### Step 10: Configure Jenkins Pipelines

**Creating Frontend Pipeline:**
1. Jenkins → New Item → **Pipeline** → Name: `frontend-pipeline`
2. Configure:
   - GitHub project URL: `https://github.com/povsalman/Three-Tier-DevSecOps`
   - Build Triggers: ✅ GitHub hook trigger for GITScm polling
   - Pipeline definition: **Pipeline script from SCM**
   - SCM: Git, branch: `main`, credentials: `GITHUB`
   - Script Path: `jenkins-pipeline/jenkinsfile-frontend`

**Creating Backend Pipeline:**
Repeat the same steps with name `backend-pipeline` and script path `jenkins-pipeline/jenkinsfile-backend`.

**Pipeline Stages (both pipelines):**

| Stage | Description |
|---|---|
| Cleaning Workspace | Fresh workspace for each build |
| Checkout from Git | Clone from GitHub using `GITHUB` credential |
| Sonarqube Analysis | Static code analysis via SonarQube Scanner |
| Quality Check | Wait for SonarQube Quality Gate result |
| OWASP Dependency-Check Scan | Scan `node_modules` for CVEs using NVD API |
| Trivy File Scan | Filesystem vulnerability scan → `trivyfs.txt` |
| Docker Image Build | Build Docker image tagged with ECR repo name |
| ECR Image Pushing | Tag with `BUILD_NUMBER`, push to Amazon ECR |
| TRIVY Image Scan | Scan final Docker image → `trivyimage.txt` |
| Checkout Code | Re-checkout for manifest update |
| Update Deployment file | `sed` new image tag into `deployment.yaml`, commit & push to GitHub |

**Trigger pipelines** by pushing code to GitHub (webhook must be configured in the GitHub repository settings pointing to `http://<JENKINS_IP>:8080/github-webhook/`).

---

### Step 11: Install ArgoCD & Deploy Applications

```bash
# 1. Create namespaces
kubectl create namespace three-tier
kubectl create namespace argocd

# 2. Create ECR registry secret
kubectl create secret generic ecr-registry-secret \
  --from-file=.dockerconfigjson=${HOME}/.docker/config.json \
  --type=kubernetes.io/dockerconfigjson \
  --namespace three-tier

# 3. Install ArgoCD
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/v2.4.7/manifests/install.yaml

# 4. Verify pods are running
kubectl get pods -n argocd

# 5. Expose ArgoCD server as LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# 6. Get ArgoCD server URL and initial password
sudo apt install jq -y
export ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o json | jq -r '.status.loadBalancer.ingress[0].hostname')
export ARGO_PWD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "ARGOCD_SERVER: $ARGOCD_SERVER"
echo "ARGO_PWD:      $ARGO_PWD"
```

**Access ArgoCD UI:** `https://<ARGOCD_SERVER>`  
Login: `admin` / `<ARGO_PWD>`

**Connect Private Repository:**
Settings → Repositories → Connect Repo → Method: HTTPS  
Enter GitHub repo URL and personal access token.

**Create 5 ArgoCD Applications** (via UI or kubectl apply):

| App Name | Path | Namespace |
|---|---|---|
| `database` | `kubernetes-manifests/database` | `three-tier` |
| `backend` | `kubernetes-manifests/backend` | `three-tier` |
| `frontend` | `kubernetes-manifests/frontend` | `three-tier` |
| `frontend-ingress` | `kubernetes-manifests/frontend-ingress` | `three-tier` |
| `backend-ingress` | `kubernetes-manifests/backend-ingress` | `three-tier` |

All applications: Project `default`, Sync Policy `Automatic`, Cluster `https://kubernetes.default.svc`.

---

### Step 12: DNS Configuration

```bash
# Get Ingress / ALB DNS name
kubectl get ingress -n three-tier
```

In **Cloudflare** (or your DNS provider):
- Create a **CNAME** record pointing your domain (e.g., `3devsecops.tech`) to the ALB DNS name shown above

---

### Step 13: Data Persistence Verification

The MongoDB deployment uses a PersistentVolumeClaim defined in `kubernetes-manifests/database/pvc.yaml`. This PVC is backed by an AWS EBS volume that persists independently of the pod lifecycle.

```bash
# Verify PV and PVC are bound
kubectl get pv -n three-tier
kubectl get pvc -n three-tier
```

---

## 🔄 CI/CD Workflow

```
1. Developer pushes code to GitHub
           │
           ▼
2. GitHub webhook triggers Jenkins pipeline
           │
           ▼
3. Jenkins pipeline runs 11 stages:
   ├── SonarQube Analysis → Quality Gate
   ├── OWASP Dependency-Check (NVD API)
   ├── Trivy Filesystem Scan
   ├── Docker Image Build
   ├── Push image to Amazon ECR (tagged: BUILD_NUMBER)
   ├── Trivy Image Scan
   └── Update kubernetes-manifests/deployment.yaml → git push
           │
           ▼
4. ArgoCD detects manifest change in GitHub
           │
           ▼
5. ArgoCD syncs → rolling update on EKS cluster
           │
           ▼
6. AWS ALB routes external traffic to updated pods
```

---

## 🔒 Security Implementation

| Layer | Tool | What It Scans |
|---|---|---|
| Code quality | SonarQube | Bugs, vulnerabilities, code smells in source code |
| Dependencies | OWASP Dependency-Check | Known CVEs in `node_modules` packages (via NVD API) |
| Filesystem | Trivy | Files and configs in the build context |
| Container images | Trivy | CVEs in the final Docker image layers |
| Registry | Amazon ECR | Private, encrypted-at-rest image storage |
| IAM | AWS IAM | Least-privilege roles for EKS nodes and LB controller |
| Secrets | Jenkins Credentials | All secrets stored as Jenkins credentials, never hardcoded |
| Network | AWS Security Groups | Port-level isolation for Jenkins EC2 |

---

## 🐛 Troubleshooting

**Pods in CrashLoopBackOff:**
```bash
kubectl describe pod <pod-name> -n three-tier
kubectl logs <pod-name> -n three-tier
```

**ArgoCD Sync Failures:**
- Verify repository credentials under Settings → Repositories
- Check manifest YAML syntax
- Review ArgoCD pod logs: `kubectl logs -n argocd <argocd-server-pod>`

**Jenkins Pipeline Failures:**
- Check Console Output for the failed stage
- Verify all 8 credentials are configured correctly
- Ensure SonarQube webhook is configured

**Load Balancer Not Provisioning:**
```bash
# Check ALB controller is running
kubectl get deployment -n kube-system aws-load-balancer-controller
# Check controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

**ECR Push Authentication Failure:**
```bash
# Re-authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

---

## 🧹 Cleanup & Resource Removal

> ⚠️ **Run cleanup after testing is complete to avoid ongoing AWS charges.**

```bash
# Step 1: Delete EKS cluster (wait for full deletion)
eksctl delete cluster \
  --name three-tier-k8s-eks-cluster \
  --region us-east-1 \
  --wait \
  --timeout 30m
```
> **Note:** If the delete fails due to load balancers, manually delete them from **EC2 → Load Balancers** first, then retry.

```bash
# Step 2: Destroy Jenkins EC2 server (from jenkins-server-terraform/)
terraform destroy
```

**Via AWS Console:**
- **Step 3:** Empty and delete the S3 bucket `salman-three-tier-devsecops-project-bucket-s3`
- **Step 4:** Delete the DynamoDB table `lock-files`
- **Step 5:** Delete IAM user, custom IAM policies, and revoke GitHub Personal Access Token

---

## 📚 References

- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [NVD API Key Registration](https://nvd.nist.gov/developers/request-an-api-key)
