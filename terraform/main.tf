provider "google" {
  region  = "${var.region}"
}

provider "google-beta" {
  region  = "${var.region}"
}

# module "mfe" {
#   source  = "app.terraform.io/dotcomrow/mfe/cloudflare"
#   version = "> 1.0.0"
#   cloudflare_account_id = "${var.cloudflare_account_id}"
#   cloudflare_zone_id = "${var.cloudflare_zone_id}"
# }

module "app" {
  source  = "../public/src"
  cloudflare_account_id = "${var.cloudflare_account_id}"
  cloudflare_zone_id = "${var.cloudflare_zone_id}"
}

module "user-preferences-svc" {
  source  = "../src/services/preferences"
  cloudflare_account_id = "${var.cloudflare_account_id}"
  cloudflare_worker_hostname = "user-prefs.${var.domain}"
  cloudflare_worker_url_pattern = "user-prefs.${var.domain}/*"
  cloudflare_worker_zone_id = "${var.cloudflare_zone_id}"
  cloudflare_cors_domains = ".*.${var.domain},.*localhost.*"
  user_profile_svc_url = "${var.user_profile_svc_endpoint}"
}

