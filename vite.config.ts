import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { normalizeViteEnvUrl } from "./src/utils/normalizeViteBackendUrl";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // BACKEND_PROXY_TARGET is server-only (not exposed to browser).
  // Falls back to VITE_BACKEND_URL, then localhost:5002.
  const rawBackend = normalizeViteEnvUrl(
    (env.BACKEND_PROXY_TARGET || env.VITE_BACKEND_URL || "").trim(),
  );
  const normalizedBackend = rawBackend
    ? rawBackend.replace(/\/+$/, "")
    : "http://localhost:5002";
  const proxyTarget = normalizedBackend.endsWith("/api")
    ? normalizedBackend.slice(0, -4) || "http://localhost:5002"
    : normalizedBackend;

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      include: ["react-router-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    },
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || "0.0.0.0",
      port: env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : 5001,
      proxy: {
        "/api/auth": {
          target: env.AUTH_PROXY_TARGET || "http://localhost:5100",
          changeOrigin: true,
          secure: false,
        },
        "/api/role": {
          target: env.AUTH_PROXY_TARGET || "http://localhost:5100",
          changeOrigin: true,
          secure: false,
        },
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
