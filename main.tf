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
  node_count = 2 

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
  node_count = 2

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
