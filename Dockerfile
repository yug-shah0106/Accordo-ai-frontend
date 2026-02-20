# =============================================
# Accordo Frontend - Unified Dockerfile
# Multi-stage build with dev and prod targets
# =============================================
#
# Development (Vite dev server with HMR):
#   docker build --target dev -t accordo-frontend:dev .
#
# Production (nginx serving static build):
#   docker build --target prod \
#     --build-arg VITE_BACKEND_URL=https://api.accordo.com \
#     --build-arg VITE_FRONTEND_URL=https://app.accordo.com \
#     -t accordo-frontend:prod .
#
# Or via Docker Compose profiles:
#   docker compose --profile dev up -d --build
#   docker compose --profile prod up -d --build
# =============================================

# ---------------------------------------------
# Stage 1: Dependencies (shared by dev & prod)
# ---------------------------------------------
FROM node:20-alpine AS deps

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install --legacy-peer-deps

# =============================================
# TARGET: dev — Vite dev server with HMR
# =============================================
# Source code is mounted as a volume at runtime.
# Vite HMR detects changes and hot-reloads.
# ---------------------------------------------
FROM deps AS dev

ENV NODE_ENV=development

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:5001/ || exit 1

# Run vite dev server (host 0.0.0.0 allows access from outside the container)
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5001"]

# =============================================
# TARGET: prod — nginx serving static build
# =============================================

# ---------------------------------------------
# Stage 2: Builder (Vite production build)
# ---------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment variables (Vite requires VITE_ prefix)
# These get baked into the static bundle during build
ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL
ARG VITE_ASSEST_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
ENV VITE_ASSEST_URL=${VITE_ASSEST_URL}

# Build the application (tsc type-check + vite build)
RUN npm run build

# ---------------------------------------------
# Stage 3: Production (nginx)
# ---------------------------------------------
FROM nginx:alpine AS prod

RUN apk add --no-cache curl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
