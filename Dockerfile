FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL
ARG VITE_ASSEST_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
ENV VITE_ASSEST_URL=${VITE_ASSEST_URL}
RUN npm run build

FROM nginx:alpine AS runtime
RUN apk add --no-cache wget
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5001
CMD ["nginx", "-g", "daemon off;"]
