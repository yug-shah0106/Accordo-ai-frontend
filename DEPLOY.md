# Accordo-AI Frontend — Deployment Guide

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm 9+
- Docker & Docker Compose (for containerized deployment)

---

## Environment Variables

Copy `.env.example` to your env file and configure:

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:5002` | Backend API base URL |
| `VITE_FRONTEND_URL` | `http://localhost:5001` | Frontend public URL |
| `VITE_ASSEST_URL` | `http://localhost:5002` | Static asset URL (avatars, uploads) |
| `VITE_DEV_HOST` | `0.0.0.0` | Dev server bind address |
| `VITE_DEV_PORT` | `5001` | Dev server port |

**Production note:** In Docker, env vars are injected at container startup via `docker/env.sh` into `window.__ENV__`, so you do **not** need to rebuild the image when changing environment values.

---

## Option 1 — Local Build & Serve

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local

# Build for production
npm run build

# Preview the build locally
npm run preview
```

The production bundle is output to `dist/`. Serve it with any static file server (nginx, Caddy, etc.) with SPA fallback routing (all 404s → `index.html`).

---

## Option 2 — Docker (Recommended for Production)

### Production

```bash
# Build and start the production container (nginx + static build)
docker compose --profile prod up -d --build
```

This runs a multi-stage build:
1. **deps** — installs `node_modules`
2. **builder** — runs `npm run build` (Vite + TypeScript)
3. **runtime** — serves `dist/` via nginx on port **5001**

Override env vars at runtime:

```bash
VITE_BACKEND_URL=https://api.example.com \
VITE_FRONTEND_URL=https://app.example.com \
docker compose --profile prod up -d
```

### Development (with HMR)

```bash
docker compose --profile dev up -d --build
```

Source files are volume-mounted so hot module replacement works inside the container.

### Resource Limits

The compose file caps each container at **0.5 CPU / 256 MB RAM**. Adjust in `docker-compose.yml` if needed.

### Health Check

nginx exposes a `/health` endpoint returning `200 OK`. Docker uses it for container health monitoring.

---

## Option 3 — Static Hosting (Vercel / Netlify / S3+CloudFront)

```bash
npm run build
```

Upload the `dist/` directory. Configure:

- **SPA fallback**: all routes → `index.html`
- **Cache headers**: hashed assets (`/assets/*`) → long cache (1 year). `index.html` and `env-config.js` → no cache.
- **Environment**: set `VITE_BACKEND_URL` etc. as build-time env vars (prefix with `VITE_`).

---

## nginx Configuration Highlights

The bundled `nginx.conf` includes:

- Gzip compression for text, JS, CSS, JSON, SVG
- Long-lived cache for fingerprinted assets
- No-cache for `index.html` and `env-config.js`
- SPA fallback (try_files → `/index.html`)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`

---

## CI/CD Checklist

1. `npm ci` — clean install
2. `npm run type-check` — TypeScript compiler check
3. `npm run lint` — ESLint
4. `npm run test` — Vitest unit/component tests
5. `npm run build` — production build
6. Deploy `dist/` or build Docker image

---

## Troubleshooting

| Problem | Fix |
|---|---|
| API calls return 404 | Verify `VITE_BACKEND_URL` points to the running backend (port 5002) |
| Blank page after deploy | Ensure SPA fallback routing is configured (all paths → `index.html`) |
| Stale env vars in Docker | Restart the container — `env.sh` runs on startup, not at build time |
| CORS errors | Backend must allow the frontend origin. Check backend CORS config |
| Build OOM | Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
