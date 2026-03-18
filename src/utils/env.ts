/**
 * Runtime environment configuration.
 *
 * In production (nginx), env vars are injected into window.__ENV__
 * via /env-config.js at container startup.
 *
 * In development (Vite dev server), falls back to import.meta.env.
 */

interface RuntimeEnv {
  VITE_BACKEND_URL?: string;
  VITE_FRONTEND_URL?: string;
  VITE_ASSEST_URL?: string;
  [key: string]: string | undefined;
}

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

/**
 * Get an environment variable at runtime.
 * Priority: window.__ENV__ (injected by nginx) > import.meta.env (Vite dev server)
 */
export function env(key: string): string {
  return window.__ENV__?.[key] ?? (import.meta.env[key] as string) ?? "";
}
