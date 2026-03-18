#!/bin/sh
# Generate /usr/share/nginx/html/env-config.js from environment variables at container startup.
# This allows runtime configuration without rebuilding the Docker image.

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL:-}",
  VITE_FRONTEND_URL: "${VITE_FRONTEND_URL:-}",
  VITE_ASSEST_URL: "${VITE_ASSEST_URL:-}"
};
EOF

echo "env-config.js generated with runtime environment variables"
