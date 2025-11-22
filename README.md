# Accordo Frontend

## Local Environment

1. Create `.env.local` (or update it if present) with:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```
   Adjust the host/port to match your backend API. The frontend automatically appends `/api` when calling the backend, so you can provide either the root host (`http://localhost:5000`) or the full API origin (`http://localhost:5000/api`).
2. Start the development server:
   ```
   npm install
   npm run dev
   ```

## Dev Proxy

The Vite dev server proxies requests starting with `/api` to the backend host derived from `VITE_BACKEND_URL`. This avoids 404s when the browser calls `/api/*` during local development.

- Change `VITE_BACKEND_URL` to point at the backend you need.
- Optional overrides:
  - `VITE_DEV_HOST` (default `0.0.0.0`)
  - `VITE_DEV_PORT` (default `5173`)
