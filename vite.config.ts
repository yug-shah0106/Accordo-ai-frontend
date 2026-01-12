import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBackend = (env.VITE_BACKEND_URL || "").trim();
  const normalizedBackend = rawBackend
    ? rawBackend.replace(/\/+$/, "")
    : "http://localhost:5002";
  const proxyTarget = normalizedBackend.endsWith("/api")
    ? normalizedBackend.slice(0, -4) || "http://localhost:5002"
    : normalizedBackend;

  return {
    optimizeDeps: {
      include: ["react-router-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    },
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || "0.0.0.0",
      port: env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : 5001,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
