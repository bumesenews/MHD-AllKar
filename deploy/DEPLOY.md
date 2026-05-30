# Deploy to Hetzner (88.198.191.204)

## 1. Server hardening (run once as root)

```bash
bash deploy/server-hardening.sh
```

Add your SSH public key, disable password login, then reload SSH.

## 2. Upload project

```bash
rsync -avz --exclude node_modules --exclude cache ./ root@88.198.191.204:/var/www/mhd-api/
```

## 3. Configure secrets on server

```bash
cd /var/www/mhd-api
cp .env.example .env
nano .env
```

Set at minimum:

- `API_KEY` — long random hex (see `.env.example`)
- `NODE_ENV=production`
- `HOST=127.0.0.1`
- `CORS_ORIGINS` — your Flutter/web app origins (comma-separated)

Generate API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Install and run

```bash
npm ci --omit=dev
chown -R www-data:www-data /var/www/mhd-api
cp deploy/mhd-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now mhd-api
```

## 5. Nginx reverse proxy

```bash
cp deploy/nginx-mhd-api.conf /etc/nginx/sites-available/mhd-api
ln -sf /etc/nginx/sites-available/mhd-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

Optional HTTPS:

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## 6. Flutter client

All `/api/*` requests must send:

```
X-API-Key: <your API_KEY from .env>
```

Base URL: `http://88.198.191.204` (or `https://your-domain.com` after TLS).

**Do not** expose port 3000 publicly; only nginx (80/443) should be open.
