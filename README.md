# Accordo Frontend

## Local Environment Setup

1. **Create `.env.local` file** in the root directory with the following variables:
   ```env
   # Backend API URL
   VITE_BACKEND_URL=http://localhost:8000
   
   # Frontend URL (for contract links)
   VITE_FRONTEND_URL=http://localhost:3000
   
   # Asset/Upload URL (for serving uploaded files)
   VITE_ASSEST_URL=http://localhost:8000
   
   # Development Server Configuration
   VITE_DEV_HOST=0.0.0.0
   VITE_DEV_PORT=3000
   ```

2. **Adjust values** according to your setup:
   - `VITE_BACKEND_URL`: Point to your backend API (default: `http://localhost:8000`)
   - `VITE_FRONTEND_URL`: Your frontend URL (default: `http://localhost:3000`)
   - `VITE_ASSEST_URL`: Backend URL for serving uploads (default: `http://localhost:8000`)
   - `VITE_DEV_PORT`: Port for Vite dev server (default: `3000`)

3. **Install dependencies and start the development server**:
   ```bash
   npm install
   npm run dev
   ```

## Environment Variables

The frontend uses the following environment variables (all must be prefixed with `VITE_`):

- **VITE_BACKEND_URL**: Backend API base URL (automatically appends `/api`)
- **VITE_FRONTEND_URL**: Frontend URL for generating contract links
- **VITE_ASSEST_URL**: Base URL for uploaded assets (images, documents)
- **VITE_DEV_HOST**: Dev server host (default: `0.0.0.0`)
- **VITE_DEV_PORT**: Dev server port (default: `3000`)

See `ENV_SETUP.md` for detailed documentation on all environment variables.

## Dev Proxy

The Vite dev server proxies requests starting with `/api` to the backend host derived from `VITE_BACKEND_URL`. This avoids 404s when the browser calls `/api/*` during local development.

- The frontend automatically appends `/api` when calling the backend
- You can provide either the root host (`http://localhost:8000`) or the full API origin (`http://localhost:8000/api`)
