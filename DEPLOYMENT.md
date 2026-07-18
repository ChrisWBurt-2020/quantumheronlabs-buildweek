# Production deployment

## Topology

```text
Cloudflare DNS/proxy
        ↓
Host Nginx :443 (Let's Encrypt TLS)
        ↓
127.0.0.1:8465
        ↓
quantumheronlabs-buildweek container :80
```

DNS does not point to a directory. The root and `www` records already reach this VPS through Cloudflare; the production cutover is the host Nginx upstream in `deploy/quantumheronlabs.com.conf`.

## Deploy or update

```bash
cd /home/debian/quantumheronlabs-buildweek
git pull --ff-only
sudo docker compose up -d --build
curl -fsS http://127.0.0.1:8465/health

sudo install -o root -g root -m 0644 \
  deploy/quantumheronlabs.com.conf \
  /etc/nginx/sites-available/quantumheronlabs.com
sudo nginx -t
sudo systemctl reload nginx

curl -fsS https://quantumheronlabs.com/nginx-health
curl -fsS https://quantumheronlabs.com/ | grep '<title>'
```

## Runtime checks

```bash
sudo docker ps --filter name=quantumheronlabs-buildweek
sudo docker inspect quantumheronlabs-buildweek --format '{{.State.Health.Status}}'
curl -sSI https://quantumheronlabs.com/
```

## Rollback

The pre-cutover host Nginx configuration is retained at:

```text
/etc/nginx/sites-available/quantumheronlabs.com.pre-buildweek-20260718
```

The former source directory remains at `/home/debian/testproj/apps/marketing-site`, but the legacy Compose service and its localhost port mapping have been removed from the active VPS configuration. To restore the old site, rebuild it as a separate container, restore the backup host configuration, test with `sudo nginx -t`, and reload Nginx.

## Security boundary

- The site container binds only to `127.0.0.1:8465`.
- Its filesystem is read-only with temporary Nginx runtime paths mounted as `tmpfs`.
- Linux capabilities are dropped except the minimum required by the upstream Nginx image.
- Host Nginx terminates TLS; the container emits CSP, frame, referrer, permissions, and MIME-sniffing protections.
