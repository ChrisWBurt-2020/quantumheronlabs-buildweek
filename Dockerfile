FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css script.js heron-mascot.js heron-particles.js manifest.webmanifest favicon.svg robots.txt sitemap.xml ed707595a3714105a93153b1cc2f12a7.txt /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} + \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} +

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1
