# Three-Tier DevSecOps Web Application on AWS EKS

A complete DevSecOps implementation deploying a three-tier web application on AWS Elastic Kubernetes Service (EKS) with automated CI/CD pipelines, comprehensive security scanning, and production-grade monitoring.

---

## 📋 Project Overview

This project demonstrates a production-ready deployment of a microservices-based three-tier application leveraging modern DevSecOps practices. The architecture integrates Infrastructure as Code (Terraform), continuous integration/deployment (Jenkins + ArgoCD), security scanning (Trivy + SonarQube), and real-time monitoring (Prometheus + Grafana) on AWS cloud infrastructure.

The application consists of:
- **Frontend**: React-based user interface
- **Backend**: RESTful API services
- **Database**: Persistent data layer with MongoDB

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              EKS Cluster (Kubernetes)                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Frontend │  │ Backend  │  │ Database │            │ │
│  │  │   Pods   │  │   Pods   │  │   Pods   │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │             │                   │ │
│  │  ┌────┴─────────────┴─────────────┴─────┐            │ │
│  │  │        Load Balancer (ALB)           │            │ │
│  │  └──────────────────────────────────────┘            │ │
│  │                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │  Prometheus  │  │   ArgoCD     │                 │ │
│  │  │  & Grafana   │  │   (GitOps)   │                 │ │
│  │  └──────────────┘  └──────────────┘                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Jenkins EC2    │  │      ECR       │  │  S3 Bucket   │  │
│  │  (CI Server)   │  │ (Container     │  │  (Terraform  │  │
│  │                │  │  Registry)     │  │   State)     │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### DevSecOps Pipeline
- **Continuous Integration**: Automated builds with Jenkins on code commits
- **Security Scanning**: 
  - SonarQube for code quality and vulnerability analysis
  - Trivy for container image scanning
  - OWASP Dependency Check for dependency vulnerabilities
- **Automated Testing**: Integration and unit tests in CI pipeline
- **Container Registry**: Amazon ECR for secure image storage

### GitOps Deployment
- **ArgoCD**: Declarative continuous deployment from Git repositories
- **Automated Sync**: Kubernetes manifests automatically deployed on repository changes
- **Rollback Capability**: Easy version control and rollback mechanisms

### Infrastructure Management
- **Terraform**: Complete infrastructure provisioned as code
- **AWS Services**: 
  - EKS for managed Kubernetes
  - VPC with security groups
  - IAM roles and policies
  - S3 for Terraform state
  - DynamoDB for state locking
  - EC2 for Jenkins server

### Monitoring & Observability
- **Prometheus**: Metrics collection from all application components
- **Grafana**: Custom dashboards for visualization and alerting
- **Cluster Monitoring**: Real-time health monitoring of Kubernetes resources

### High Availability & Scalability
- **Multi-AZ Deployment**: Resources distributed across availability zones
- **Auto-scaling**: Horizontal pod autoscaling based on metrics
- **Load Balancing**: AWS Application Load Balancer for traffic distribution
- **Persistent Storage**: Persistent volumes for database data retention

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Cloud Provider** | AWS (EKS, EC2, ECR, S3, DynamoDB) |
| **Container Orchestration** | Kubernetes (Amazon EKS) |
| **Infrastructure as Code** | Terraform |
| **CI/CD** | Jenkins, ArgoCD |
| **Container Runtime** | Docker |
| **Security Scanning** | SonarQube, Trivy, OWASP Dependency-Check |
| **Monitoring** | Prometheus, Grafana |
| **Package Manager** | Helm |
| **Version Control** | Git, GitHub |
| **Frontend** | React.js, Node.js |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |

---

## 📁 Project Structure

```
.
├── jenkins-server-terraform/    # Terraform configs for Jenkins EC2
│   ├── backend.tf
│   ├── main.tf
│   ├── variables.tf
│   └── install.sh
├── eks-terraform/               # Terraform configs for EKS cluster
│   ├── backend.tf
│   ├── main.tf
│   └── variables.tf
├── kubernetes-manifests/        # K8s deployment configs
│   ├── backend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── database/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   └── ingress/
│       └── ingress.yaml
├── jenkins-pipelines/           # Jenkinsfiles for CI/CD
│   ├── frontend-pipeline
│   └── backend-pipeline
├── argocd/                      # ArgoCD application configs
│   ├── application-backend.yaml
│   ├── application-frontend.yaml
│   └── application-database.yaml
├── monitoring/                  # Prometheus & Grafana configs
│   └── grafana-dashboards/
├── frontend/                    # Frontend application code
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── backend/                     # Backend application code
    ├── Dockerfile
    ├── package.json
    └── src/
```

---

## 🚀 Deployment Guide

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform (v1.0+)
- kubectl
- Helm
- Git

### Step 1: Setup AWS Infrastructure

#### 1.1 Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and default region
```

#### 1.2 Create IAM User
Create an IAM user with permissions for:
- EKS (Full Access)
- EC2 (Full Access)
- ECR (Full Access)
- S3 (for Terraform state)
- DynamoDB (for state locking)
- VPC and networking resources

#### 1.3 Setup S3 and DynamoDB for Terraform Backend
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://your-terraform-state-bucket --region us-east-2

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Deploy Jenkins Server

```bash
cd jenkins-server-terraform

# Update backend.tf with your S3 bucket name
# Update variables.tf with your configurations

terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

**Access Jenkins:**
- Get the public IP from Terraform output
- Access at `http://<JENKINS_PUBLIC_IP>:8080`
- Retrieve initial admin password:
```bash
ssh -i your-key.pem ubuntu@<JENKINS_PUBLIC_IP>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 3: Configure Jenkins

#### 3.1 Install Required Plugins
Navigate to: **Manage Jenkins → Plugins → Available Plugins**

Install:
- AWS Credentials
- AWS Steps
- Docker
- Docker Pipeline
- Eclipse Temurin Installer
- NodeJS
- OWASP Dependency-Check
- SonarQube Scanner

#### 3.2 Configure Tools
**Dashboard → Manage Jenkins → Tools**

Configure:
- JDK (Temurin Java 17)
- NodeJS (Latest LTS)
- SonarQube Scanner
- Docker
- OWASP Dependency-Check

#### 3.3 Add Credentials
**Manage Jenkins → Credentials → System → Global Credentials**

Add:
1. **AWS Access Key** (Kind: Secret text, ID: `aws-key`)
2. **GitHub Username & Password** (Kind: Username with password)
3. **GitHub Token** (Kind: Secret text)
4. **SonarQube Token** (Kind: Secret text, ID: `sonar-token`)
5. **ECR Repository URLs** (Kind: Secret text)
6. **AWS Account ID** (Kind: Secret text)

### Step 4: Setup SonarQube

```bash
# Access SonarQube on Jenkins server
http://<JENKINS_IP>:9090

# Default credentials: admin / admin
```

**Configuration Steps:**
1. Create projects for frontend and backend
2. Generate authentication tokens for each project
3. Configure webhooks pointing to Jenkins:
   - URL: `http://<JENKINS_IP>:8080/sonarqube-webhook/`
4. Add tokens to Jenkins credentials

### Step 5: Create ECR Repositories

```bash
# Create frontend repository
aws ecr create-repository \
  --repository-name frontend \
  --region us-east-1

# Create backend repository
aws ecr create-repository \
  --repository-name backend \
  --region us-east-1
```

### Step 6: Deploy EKS Cluster

```bash
cd eks-terraform

# Update backend.tf with your S3 bucket
# Review and update variables.tf

terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

**Configure kubectl:**
```bash
aws eks update-kubeconfig \
  --name three-tier-k8s-eks-cluster \
  --region us-east-1

# Verify cluster access
kubectl get nodes
```

### Step 7: Setup Load Balancer Controller

```bash
# Download IAM policy
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json

# Create IAM policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Create OIDC provider
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --cluster three-tier-k8s-eks-cluster \
  --approve

# Create service account
eksctl create iamserviceaccount \
  --cluster=three-tier-k8s-eks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks

helm install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=three-tier-k8s-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### Step 8: Install Prometheus & Grafana

```bash
# Add Helm repositories
helm repo add stable https://charts.helm.sh/stable
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus stack (includes Grafana)
helm install stable prometheus-community/kube-prometheus-stack \
  -n monitoring

# Verify installation
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```

**Expose Prometheus & Grafana:**
```bash
# Edit Prometheus service
kubectl edit svc stable-kube-prometheus-sta-prometheus -n monitoring
# Change type from ClusterIP to LoadBalancer

# Edit Grafana service
kubectl edit svc stable-grafana -n monitoring
# Change type from ClusterIP to LoadBalancer

# Get external IPs
kubectl get svc -n monitoring
```

**Access Grafana:**
- URL: `http://<GRAFANA_LOADBALANCER_IP>`
- Username: `admin`
- Password: `prom-operator`

**Import Dashboards:**
1. Navigate to Dashboards → Import
2. Import dashboard ID: `3119` (Kubernetes cluster monitoring)
3. Configure Prometheus as data source

### Step 9: Setup ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.4.7/manifests/install.yaml

# Verify installation
kubectl get pods -n argocd

# Expose ArgoCD server
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get LoadBalancer URL
kubectl get svc argocd-server -n argocd
```

**Access ArgoCD:**
```bash
# Get initial admin password
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

- URL: `https://<ARGOCD_LOADBALANCER_DNS>`
- Username: `admin`
- Password: (from above command)

### Step 10: Configure Jenkins Pipelines

#### 10.1 Create ECR Registry Secret in Kubernetes
```bash
kubectl create namespace three-tier

kubectl create secret generic ecr-registry-secret \
  --from-file=.dockerconfigjson=$HOME/.docker/config.json \
  --type=kubernetes.io/dockerconfigjson \
  --namespace three-tier
```

#### 10.2 Create Jenkins Pipelines

**Frontend Pipeline:**
1. New Item → Pipeline → Name: `frontend-pipeline`
2. Configure:
   - GitHub project URL
   - Build Triggers: GitHub hook trigger
   - Pipeline script from SCM (Git)
   - Script Path: `jenkins-pipelines/frontend-pipeline`

**Backend Pipeline:**
1. New Item → Pipeline → Name: `backend-pipeline`
2. Configure similarly to frontend

**Pipeline Stages:**
- Checkout code from GitHub
- Install dependencies
- Run SonarQube analysis
- Run OWASP Dependency Check
- Run Trivy file system scan
- Build Docker image
- Scan Docker image with Trivy
- Push image to Amazon ECR
- Update Kubernetes manifests with new image tag
- Commit changes to Git repository

### Step 11: Deploy Applications with ArgoCD

```bash
# Create ArgoCD applications
kubectl apply -f argocd/application-database.yaml
kubectl apply -f argocd/application-backend.yaml
kubectl apply -f argocd/application-frontend.yaml
kubectl apply -f argocd/application-ingress.yaml
```

**Configure Private Repository in ArgoCD:**
1. Settings → Repositories → Connect Repo
2. Method: HTTPS
3. Repository URL: Your GitHub repo
4. Username: GitHub username
5. Password: GitHub personal access token

**Create Applications in ArgoCD UI:**
1. **Database Application:**
   - Application Name: `database`
   - Project: `default`
   - Sync Policy: `Automatic`
   - Repository URL: Your repo
   - Path: `kubernetes-manifests/database`
   - Cluster: `https://kubernetes.default.svc`
   - Namespace: `three-tier`

2. **Backend Application:**
   - Same configuration, path: `kubernetes-manifests/backend`

3. **Frontend Application:**
   - Same configuration, path: `kubernetes-manifests/frontend`

4. **Ingress:**
   - Same configuration, path: `kubernetes-manifests/ingress`

### Step 12: DNS Configuration

1. Get the Load Balancer DNS name:
```bash
kubectl get ingress -n three-tier
```

2. Configure your domain DNS:
   - Create A record or CNAME pointing to the ALB DNS
   - Example: `app.yourdomain.com` → `<ALB_DNS_NAME>`

### Step 13: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n three-tier

# Check services
kubectl get svc -n three-tier

# Check ingress
kubectl get ingress -n three-tier

# View application logs
kubectl logs -f <pod-name> -n three-tier

# Check ArgoCD sync status
kubectl get applications -n argocd
```

**Access the Application:**
- Frontend: `http://<YOUR_DOMAIN>` or `http://<ALB_DNS>`
- Backend API: `http://<YOUR_DOMAIN>/api`

---

## 🔄 CI/CD Workflow

1. **Developer pushes code** to GitHub repository
2. **GitHub webhook triggers** Jenkins pipeline
3. **Jenkins pipeline executes:**
   - Code checkout
   - Dependency installation
   - SonarQube code analysis
   - OWASP dependency scanning
   - Trivy filesystem scan
   - Docker image build
   - Trivy image scan
   - Push to Amazon ECR
   - Update Kubernetes manifests with new image tag
   - Commit manifest changes to Git
4. **ArgoCD detects** manifest changes in Git
5. **ArgoCD automatically syncs** and deploys to EKS cluster
6. **Prometheus collects** metrics from new deployment
7. **Grafana displays** real-time monitoring data

---

## 📊 Monitoring & Logging

### Prometheus Metrics
- Cluster resource utilization
- Pod CPU and memory usage
- Network traffic
- Application-specific custom metrics

### Grafana Dashboards
- **Kubernetes Cluster Monitoring** (ID: 3119)
- **Pod Monitoring**
- **Deployment Status**
- **Custom Application Metrics**

### Access Monitoring:
- Prometheus: `http://<PROMETHEUS_LB_IP>:9090`
- Grafana: `http://<GRAFANA_LB_IP>:3000`

---

## 🔒 Security Features

1. **Code Analysis**: SonarQube scans for code vulnerabilities and code smells
2. **Dependency Scanning**: OWASP checks for vulnerable dependencies
3. **Image Scanning**: Trivy scans container images for CVEs
4. **Private Registry**: Amazon ECR with encryption at rest
5. **IAM Roles**: Principle of least privilege for all AWS resources
6. **Network Policies**: Kubernetes network segmentation
7. **Secrets Management**: Kubernetes secrets for sensitive data
8. **Security Groups**: AWS security groups for network isolation

---

## 📈 Scalability & High Availability

- **Horizontal Pod Autoscaling**: Automatic scaling based on CPU/memory
- **Multi-AZ Deployment**: Resources across multiple availability zones
- **Load Balancing**: Application Load Balancer distributes traffic
- **Persistent Volumes**: Data persistence with EBS volumes
- **Rolling Updates**: Zero-downtime deployments
- **Health Checks**: Liveness and readiness probes

---

## 🧹 Cleanup Resources

To avoid ongoing AWS charges, clean up resources when done:

```bash
# Delete EKS cluster and associated resources
cd eks-terraform
terraform destroy -auto-approve

# Delete Jenkins server
cd ../jenkins-server-terraform
terraform destroy -auto-approve

# Delete S3 bucket (after emptying)
aws s3 rb s3://your-terraform-state-bucket --force

# Delete DynamoDB table
aws dynamodb delete-table --table-name terraform-lock

# Delete ECR repositories
aws ecr delete-repository --repository-name frontend --force
aws ecr delete-repository --repository-name backend --force

# Delete IAM policies and roles created
```

**Note:** Delete load balancers from AWS console if they persist after cluster deletion.

---

## 🐛 Troubleshooting

### Common Issues:

**1. Pods in CrashLoopBackOff:**
```bash
kubectl describe pod <pod-name> -n three-tier
kubectl logs <pod-name> -n three-tier
```

**2. ArgoCD Sync Failures:**
- Check repository credentials
- Verify manifest syntax
- Review ArgoCD logs: `kubectl logs -n argocd <argocd-pod>`

**3. Jenkins Pipeline Failures:**
- Verify credentials are configured
- Check Jenkins console output
- Ensure AWS permissions are correct

**4. Load Balancer Not Creating:**
- Verify AWS Load Balancer Controller is running
- Check security group configurations
- Review ingress annotations

**5. ECR Push Failed:**
```bash
# Re-authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

---

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---
