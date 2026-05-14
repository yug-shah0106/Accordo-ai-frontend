/**
 * Ensures VITE_BACKEND_URL is absolute when it points at a host.
 * Values without a scheme (e.g. "ec2-....amazonaws.com:5002") are treated as
 * paths by axios/fetch and get resolved against the frontend origin.
 */
export function normalizeViteBackendUrl(raw: string): string {
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
