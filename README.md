# Codimite-Assessment

# 4. Explain how you would automate the process using TFActions

## Prerequisites

1. Use repository to store your Terraform files.
2. Add the following Terraform files to your repository:
   - `main.tf`
   - `variables.tf`
   - `outputs.tf`
   - `terraform.tfvars`

### Setup google cloud

1. Create GCP project.
2. Enable the required APIs for your project.

- **Kubernetes Engine API**
- **Compute Engine API**
- **Cloud Storage API**

3. Create a service account using the following roles:

   - **Editor**
   - **Storage Admin**
   - **Kubernetes Engine Admin**

4. Download the JSON key file for the service account.

### Setup GitHub secrets

1. Navigate to **Settings > Secrets and Variables > Actions > New Repository Secret** in your GitHub repository.
2. Add the following secrets:
   - **GCP_KEY**: Paste the content of your downloaded JSON key.
   - **GCP_PROJECT**
   - **GCP_REGION**

## GitHub Actions Workflow Setup

You can automate your Terraform commands using a GitHub Actions workflow.

### Step 1: Go to github Action tab

### Step 2: Next Select Terraform under Deployment and click configure

### Step 3: Add the following configuration to your `terraform.yml` file

```yaml
name: Terraform Automation

on:
  push:
    branches:
      - main

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0

      - name: Authenticate with GCP
        env:
          GOOGLE_CREDENTIALS: ${{ secrets.GCP_KEY }}
        run: |
          echo "${{ secrets.GCP_KEY }}" > gcp-key.json
          gcloud auth activate-service-account --key-file=gcp-key.json
          gcloud config set project ${{ secrets.GCP_PROJECT }}
          gcloud config set compute/region ${{ secrets.GCP_REGION }}

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan

      - name: Terraform Apply
        run: terraform apply -auto-approve
```

## Push Terraform Files to GitHub

### Step 1: Ensure the following files are in your GitHub repository

- `main.tf`
- `variables.tf`
- `outputs.tf`
- `terraform.tfvars`

### Step 2: Commit and push these files to the main branch of your repository

## Verify GitHub Actions Workflow

1. Go to your GitHub repository.
2. Navigate to the Actions tab.
3. You should see the Terraform Automation workflow running automatically when you push code to the main branch.

## Workflow Execution Steps

1. Checkout Repository: Fetches the Terraform files from your GitHub repository.
2. Setup Terraform: Installs the specified Terraform version.
3. Authenticate to GCP: Uses the service account key stored in GCP_KEY to authenticate with Google Cloud.
4. Terraform Init: Initializes the Terraform backend and prepares the state file.
5. Terraform Plan: Runs terraform plan to preview changes.
6. Terraform Apply: Applies the changes automatically (-auto-approve).

---

## GCP Concepts & Networking

### Task

1.  ![Architectural Diagram](img/GCP%20Concepts%20&%20Networking.png)

#### 2. Explain Diagram:

3. GCP VPC: Covers the whole configuration, including networking resources and regions.
4. Regions:Each of the two regions—Region 1 and Region 2—has many subnets for resource segregation.
5. Subnets: GKE clusters for workload hosting are located in Subnets 1 and 2.
6. CloudSQL is hosted by Private Subnet to provide safe database access.
7. Caching services are the focus of the Redis Subnet.
8. Cloud NAT: Enables private subnet resources to access the internet without being immediately exposed.
9. Services That Are Shared VPC: Stands for a VPC that connects to the primary VPC in order to enable resource sharing.

##### Enhances Security

1. IAM and RBAC: To manage who may access and alter resources, use Kubernetes clusters and fine-grained Identity and Access Management (IAM) roles and Role-Based Access Control (RBAC) for all resources.
2. Private Subnet Access: Verify the privacy of subnets housing critical resources such as Redis and CloudSQL. To establish and implement security perimeters, use VPC Service Controls.
3. Network Policies: To limit communication between pods to what is required, use Kubernetes network policies.
4. Strict firewall rules should be used for every subnet to limit incoming and outgoing traffic. Permit just the necessary IP ranges and ports.
5. Encryption: Turn on encryption for all services, both in transit and at rest. Make use of Cloud KMS or Google-managed encryption keys.
6. Cloud NAT: For safe and regulated internet access to private resources, use Cloud NAT.
7. Shared VPC: For centralised security and safe inter-project communication management, use Shared VPC.

##### Cost Reduction

1. Regional Placement: Placing services in the same area lowers the cost of data transport across regions.
2. Managed Services: By using Redis, CloudSQL, and GKE as managed services, infrastructure expenses and operational overhead are decreased.
3. Cloud NAT: Reduces the expense of IP reservations by avoiding the assignment of public IPs to resources.
4. Autoscaling: Allow GKE clusters to adjust their resource levels in response to demand by turning on autoscaling.
5. Cloud Monitoring: To find unused resources and optimise, use cloud monitoring and logging.

## CI/CD & GitHub Actions

1. Write a sample GitHub Actions workflow YAML file to:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest

    steps:
      # Checkout the repository
      - name: Checkout Code
        uses: actions/checkout@v3

      # Set up Google Cloud authentication
      - name: Authenticate with Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}

      # Configure Docker for GCR
      - name: Configure Docker to use GCR
        run: |
          gcloud auth configure-docker

      # Build the Docker image
      - name: Build Docker Image
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/Auth-microservice:${{ github.sha }} ./backend

      # Push the Docker image to GCR
      - name: Push Docker Image to GCR
        run: |
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/Auth-microservice:${{ github.sha }}

  test-and-lint:
    name: Test and Lint Code
    runs-on: ubuntu-latest
    needs: build-and-push

    steps:
      # Checkout the repository
      - name: Checkout Code
        uses: actions/checkout@v3

      # Run linting
      - name: Run Linter
        run: |

          npm install && npm run lint

      # Run tests
      - name: Run Tests
        run: |

          npm test

  deploy-to-gke:
    name: Deploy to GKE using ArgoCD
    runs-on: ubuntu-latest
    needs: test-and-lint

    steps:
      # Checkout the repository
      - name: Checkout Code
        uses: actions/checkout@v3

      # Authenticate with Google Cloud
      - name: Authenticate with Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}

      # Install ArgoCD CLI
      - name: Install ArgoCD CLI
        run: |
          curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x /usr/local/bin/argocd

      # Authenticate with ArgoCD
      - name: Authenticate with ArgoCD
        run: |
          argocd login ${{ secrets.ARGOCD_SERVER }} \
            --username ${{ secrets.ARGOCD_USERNAME }} \
            --password ${{ secrets.ARGOCD_PASSWORD }} \
            --grpc-web

      # Update ArgoCD application
      - name: Update ArgoCD Application
        run: |
          argocd app set Auth-microservice \
            --repo https://github.com/${{ github.repository }} \
            --path ./k8s \
            --revision main \
            --values gcr.io/${{ secrets.GCP_PROJECT_ID }}/Auth-microservice:${{ github.sha }}
          argocd app sync Auth-microservice
```

#### Explain how you configure the deployment through ArgoCD.

1. Install ArgoCD.

2. Expose the ArgoCD Server using port forwading to local access.

`kubectl port-forward svc/argocd-server -n argocd 8080:443`

3. Log into ArgoCD. username is admin. Retrieve the admin password using this below.

`kubectl get secret argocd-initial-admin-secret -n argocd -o yaml | grep password | awk '{print $2}' | base64 -d`

4. Create a Kubernetes manifest for the ArgoCD application.

```apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-microservice
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Lachitha/Codimite-Assessment.git
    targetRevision: main
    path: backend/k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: my-namespace
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

5. `kubectl apply -f deploymnet.yaml`

6. `argocd app sync Auth-microservice`

#### ArgoCD and GitHub Actions Integration

1. GitHub Actions authenticates with ArgoCD using the CLI in the deploy-to-gke job:
   `argocd login ${{ secrets.ARGOCD_SERVER }} \
--username ${{ secrets.ARGOCD_USERNAME }} \
--password ${{ secrets.ARGOCD_PASSWORD }}`
2. Update and Sync Application: The pipeline updates the ArgoCD application to use the latest image and syncs it:
   `argocd app set my-microservice --revision main --values gcr.io/${{ secrets.GCP_PROJECT_ID }}/my-microservice:${{ github.sha }}`
   `argocd app sync my-microservice`

   ## Security & Automation Guardrails

   ### Write a sample Conftest policy that ensures all Terraform code includes encryption for GCS buckets and restrict the project

   1. Install Conftest.
   2. Create a Conftest Policy Directory.
   3. Create a file gcs_policy.rego:

   ```package main


   ```

deny[msg] {
resource := input.resource*changes[*]
resource.type == "google_storage_bucket"
encryption := resource.change.after.encryption
encryption == null
msg := sprintf("GCS bucket %s does not have encryption enabled.", [resource.name])
}

deny[msg] {
resource := input.resource*changes[*]
resource.type == "google_storage_bucket"
project := resource.change.after.project
not project_allowed(project)
msg := sprintf("GCS bucket %s is in a restricted project: %s.", [resource.name, project])
}

project_allowed(project) {
project == "codimite-assessment"
}

```


```

4. Update terraform code.

```
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

resource "google_storage_bucket" "terraform_state" {
  name          = "${var.project_id}-terraform-state"
  location      = var.region
  storage_class = "STANDARD"


  encryption {
    default_kms_key_name = "projects/${var.project_id}/locations/${var.region}/keyRings/my-key-ring/cryptoKeys/my-key"
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }


}

terraform {
  backend "gcs" {
    bucket = "my-terraform-state-buckets"
    prefix = "terraform/state"
  }
}

resource "google_compute_network" "vpc_network" {
  name = "gke-vpc"
}

resource "google_compute_subnetwork" "general_subnet" {
  name          = "general-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}

resource "google_compute_subnetwork" "cpu_subnet" {
  name          = "cpu-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.3.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.4.0.0/20"
  }
}

resource "google_container_cluster" "gke_cluster" {
  name       = "gke-cluster"
  location   = var.region
  network    = google_compute_network.vpc_network.name
  subnetwork = google_compute_subnetwork.general_subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  node_pool {
    name       = "general-pool"
    node_count = 1

    autoscaling {
      min_node_count = 1
      max_node_count = 3
    }

    node_config {
      machine_type = "e2-small"
      disk_size_gb = 50
      disk_type    = "pd-standard"
    }
  }

  node_pool {
    name       = "cpu-pool"
    node_count = 1

    autoscaling {
      min_node_count = 1
      max_node_count = 3
    }

    node_config {
      machine_type = "e2-highcpu-2"
      disk_size_gb = 50
      disk_type    = "pd-standard"
    }
  }
}
```

5. Validate Terraform Code.
6. Initialize Terraform.
7. Generate Terraform Plan Create the binary plan file.
8. Test with Conftest Verify the plan using Conftest.

### Write a Trivy command to scan a Docker image during a GitHub Actions pipeline.

1. this is the workflow yml file we can create this seperate or can add as stage in previouse yml file this is the stage code.

```
name: Docker Image Vulnerability Scan

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  trivy-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Set up Trivy
        run: |
          curl -sfL https://github.com/aquasecurity/trivy/releases/download/v0.39.1/trivy_0.39.1_Linux-64bit.tar.gz | tar -xzv -C /usr/local/bin

      - name: Build Docker image
        run: |
          docker build -t your-image-name .

      - name: Run Trivy scan
        run: |
          trivy image --no-progress --exit-code 1 your-image-name

      - name: Push image (optional)
        run: |
          docker push your-image-name
```

2.  Explanation of the code.

- Checkout repository: The pipeline first checks out the code from the repository.
- Set up Docker Buildx: This action sets up Docker Buildx to handle multi-platform builds (if needed).
- Set up Trivy: It installs Trivy (version 0.39.1 here) to scan the Docker image for vulnerabilities.
- Build Docker image: This step builds the Docker image tagged as your-image-name.
- Run Trivy scan: This runs the Trivy scan on the image. The --no-progress flag disables the progress bar, and --exit-code 1 ensures that the pipeline fails if vulnerabilities are found.

Trivy is a tool for checking Docker images for configuration errors and vulnerabilities in security. It examines the image for known vulnerabilities in application dependencies, operating system packages, and container-specific problems. You may avoid the deployment of insecure containers by incorporating Trivy into your CI/CD pipeline, which automatically identifies security threats early in the development cycle. It helps guarantee that only safe, current images are used in production by giving quick, real-time feedback on vulnerabilities. Trivy is user-friendly, open-source, and contributes to the general security of containerised apps.

## Problem-Solving & Troubleshooting Scenario

#### Troubleshooting Approach:

1. Examine Logs: Check CloudSQL and application logs for network timeout-related errors.
2. Verify connectivity by making sure CloudSQL firewall rules permit access from GKE and by looking at CloudSQL's VPC peering or DNS configurations.
3. Network Latency: To check connectivity to CloudSQL, use tools like ping or traceroute from pods.
4. Resource Limits: Verify that the CPU and RAM of CloudSQL and pods are not overloaded.
5. Check the health of the GKE node and the pod status for any problems that might be interfering with communication.

#### Resolution & Prevention:

1. Fix Connectivity Issues: To fix connectivity issues, adjust firewall rules, VPC peering, or DNS.
2. Improve Performance: Use connection pooling, autoscale application pods to control demand, and scale CloudSQL.
3. Monitor & Prevent: To prevent future problems, use Google Cloud Monitoring, configure alarms, and put network controls and resource limits in place.
4. Backup & Recovery: Make sure that disaster recovery plans and routine CloudSQL backups are in place.

#### Tools:

GKE Tools: kubectl, Cloud Console, Kubernetes Dashboard.
CloudSQL: Logs, performance insights.
Network Diagnostics: ping, traceroute.
Monitoring: Google Cloud Operations Suite,Datadog
