package main

deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "google_storage_bucket"
  encryption := resource.change.after.encryption
  encryption == null
  msg := sprintf("GCS bucket %s does not have encryption enabled.", [resource.name])
}

deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "google_storage_bucket"
  project := resource.change.after.project
  not project_allowed(project)
  msg := sprintf("GCS bucket %s is in a restricted project: %s.", [resource.name, project])
}

project_allowed(project) {
  project == "codimite-assessment"  
}
