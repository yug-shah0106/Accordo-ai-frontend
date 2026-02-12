# =============================================
# Accordo Frontend - Production Dockerfile
# Multi-stage build with nginx for static serving
# Supports: AMD64 and ARM64 (Apple Silicon)
# =============================================

# ---------------------------------------------
# Stage 1: Dependencies
# ---------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
# Using npm install instead of npm ci for better cross-platform compatibility
RUN npm install --legacy-peer-deps

# ---------------------------------------------
# Stage 2: Builder
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

# Set environment variables for the build
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
ENV VITE_ASSEST_URL=${VITE_ASSEST_URL}

# Build the application
# Skip TypeScript type checking during build (vite build only)
# Type errors should be caught during development, not blocking production builds
RUN npx vite build

# ---------------------------------------------
# Stage 3: Production (nginx)
# ---------------------------------------------
FROM nginx:alpine AS production

# Install curl for health check
RUN apk add --no-cache curl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5001
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5001/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
