resource "cloudflare_pages_domain" "dtk" {
  account_id   = var.cloudflare_account_id
  project_name = "dtk"
  domain       = "dtk.suncoast.systems"

  depends_on = [ cloudflare_pages_project.dtk ]
}

resource "cloudflare_record" "dtk" {
  zone_id = var.cloudflare_zone_id
  name    = "dtk"
  value   = cloudflare_pages_project.dtk.domains[0]
  type    = "CNAME"
  ttl     = 3600
  allow_overwrite = true
}

resource "cloudflare_pages_project" "dtk" {
  account_id        = var.cloudflare_account_id
  name              = "dtk"
  production_branch = "gh-pages"
  source {
    type = "github"
    config {
      owner                         = "dotcomrow"
      repo_name                     = "leafygreen-ui.github.io"
      production_branch             = "gh-pages"
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_deployment_setting = "none" 
    }
  }

  deployment_configs {
    production {

    }
  }
}