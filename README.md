# Codimite-Assessment

# Terraform Automation for Google Cloud using GitHub Actions

This repository provides a setup for automating the deployment of Google Cloud resources using Terraform and GitHub Actions.

## Prerequisites

Before you start, make sure the following are ready:

### GitHub Repository

1. Use an existing repository or create a new one to store your Terraform files.
2. Add the following Terraform files to your repository:
   - `main.tf`
   - `variables.tf`
   - `outputs.tf`

### Google Cloud Setup

1. Create or use an existing GCP project.
2. Enable the required APIs for your project.
3. Create a service account with the following roles:
   - **Editor**
   - **Storage Admin**
   - **Kubernetes Engine Admin**
4. Download the JSON key file for the service account and save it securely.

### GitHub Secrets

To securely store your GCP credentials and configurations in GitHub:

1. Navigate to **Settings > Secrets and Variables > Actions > New Repository Secret** in your GitHub repository.
2. Add the following secrets:
   - **GCP_KEY**: Paste the content of your downloaded JSON key file.
   - **GCP_PROJECT**: Your GCP project ID (e.g., `my-project-id`).
   - **GCP_REGION**: The GCP region for your deployment (e.g., `us-central1`).

---

## GitHub Actions Workflow Setup

You can automate your Terraform commands using a GitHub Actions workflow.

### Step 1: Create a Workflow File

1. In your repository, create a folder called `.github/workflows/`.
2. Inside the folder, create a file named `terraform.yml`.

### Step 2: Add Workflow Configuration

Add the following configuration to your `terraform.yml` file:

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
