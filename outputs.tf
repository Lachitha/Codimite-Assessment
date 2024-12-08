output "gke_endpoint" {
  description = "The endpoint for the GKE cluster"
  value       = google_container_cluster.gke_cluster.endpoint
}

output "gke_cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.gke_cluster.name
}

output "gke_node_pools" {
  description = "The node pools in the GKE cluster"
  value       = google_container_cluster.gke_cluster.node_pool
}

output "vpc_network" {
  description = "The VPC network name"
  value       = google_compute_network.vpc_network.name
}
