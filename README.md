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

---

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
