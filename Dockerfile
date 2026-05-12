FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL
ARG VITE_ASSEST_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_FRONTEND_URL=$VITE_FRONTEND_URL \
    VITE_ASSEST_URL=$VITE_ASSEST_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache wget
COPY package.json ./
RUN npm install serve@14.2.4 --no-save --no-package-lock --no-audit --no-fund \
    && chown -R node:node /app
COPY --from=builder --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "start"]
