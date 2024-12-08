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

### Enhances Security

1. IAM and RBAC: To manage who may access and alter resources, use Kubernetes clusters and fine-grained Identity and Access Management (IAM) roles and Role-Based Access Control (RBAC) for all resources.
2. Private Subnet Access: Verify the privacy of subnets housing critical resources such as Redis and CloudSQL. To establish and implement security perimeters, use VPC Service Controls.
3. Network Policies: To limit communication between pods to what is required, use Kubernetes network policies.
4. Strict firewall rules should be used for every subnet to limit incoming and outgoing traffic. Permit just the necessary IP ranges and ports.
5. Encryption: Turn on encryption for all services, both in transit and at rest. Make use of Cloud KMS or Google-managed encryption keys.
6. Cloud NAT: For safe and regulated internet access to private resources, use Cloud NAT.
7. Shared VPC: For centralised security and safe inter-project communication management, use Shared VPC.

### Cost Reduction

1. Regional Placement: Placing services in the same area lowers the cost of data transport across regions.
2. Managed Services: By using Redis, CloudSQL, and GKE as managed services, infrastructure expenses and operational overhead are decreased.
3. Cloud NAT: Reduces the expense of IP reservations by avoiding the assignment of public IPs to resources.
4. Autoscaling: Allow GKE clusters to adjust their resource levels in response to demand by turning on autoscaling.
5. Cloud Monitoring: To find unused resources and optimise, use cloud monitoring and logging.
