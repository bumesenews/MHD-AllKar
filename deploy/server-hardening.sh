#!/usr/bin/env bash
# Run on Hetzner as root after first login: bash deploy/server-hardening.sh
set -euo pipefail

echo "==> Updating packages..."
apt-get update && apt-get upgrade -y

echo "==> Installing nginx, ufw, fail2ban..."
apt-get install -y nginx ufw fail2ban

echo "==> Configuring firewall (SSH + HTTP + HTTPS only)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> SSH hardening recommendations (apply manually in /etc/ssh/sshd_config):"
echo "    PermitRootLogin prohibit-password"
echo "    PasswordAuthentication no"
echo "    PubkeyAuthentication yes"
echo "Then: systemctl reload sshd"

echo "==> Done. Deploy app to /var/www/mhd-api, copy .env, enable systemd + nginx."
