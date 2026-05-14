/**
 * Ensures VITE_* URLs used in the browser are absolute when they point at a host.
 * Same rules for VITE_BACKEND_URL, VITE_ASSEST_URL, and VITE_FRONTEND_URL.
 * Values without a scheme (e.g. "ec2-....amazonaws.com:5002") are treated as
 * paths and resolve against the current page origin (broken images, wrong API host).
 */
export function normalizeViteEnvUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.includes("://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `http:${trimmed}`;
  }
  return `http://${trimmed}`;
}

/** Alias for {@link normalizeViteEnvUrl} — kept for existing imports. */
export const normalizeViteBackendUrl = normalizeViteEnvUrl;
