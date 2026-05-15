import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for the API base URL construction logic.
 *
 * The `buildBaseUrl()` function in src/api/index.ts runs at module load time
 * and reads from `env("VITE_BACKEND_URL")`. Since module-level code executes
 * once on import, we use `vi.resetModules()` and dynamic `import()` to
 * re-execute the module with different env configurations.
 *
 * The env() helper reads window.__ENV__ first, then import.meta.env, then "".
 * buildBaseUrl() applies these rules:
 *   - empty/blank string → "/api"
 *   - URL ending with "/api" → used as-is
 *   - URL not ending with "/api" → appends "/api"
 *   - trailing slashes are stripped before the check
 *   - host:port without scheme → http://... (absolute URL for axios)
 */
describe('API base URL construction', () => {
  beforeEach(() => {
    delete window.__ENV__;
    vi.resetModules();
  });

  afterEach(() => {
    delete window.__ENV__;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function getApiBaseURL(): Promise<string> {
    const mod = await import('../../../src/api/index');
    // The default export is the axios instance; its defaults.baseURL is set by buildBaseUrl()
    return mod.default.defaults.baseURL as string;
  }

  it('returns "/api" when env returns empty string (no env configured)', async () => {
    // Explicitly set window.__ENV__ with empty VITE_BACKEND_URL to override any .env.local value
    window.__ENV__ = { VITE_BACKEND_URL: '' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('/api');
  });

  it('appends /api when env returns a URL without /api suffix', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('https://api.example.com/api');
  });

  it('uses URL as-is when it already ends with /api', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com/api' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('https://api.example.com/api');
  });

  it('strips trailing slashes before appending /api', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com/' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('https://api.example.com/api');
  });

  it('strips trailing slashes and preserves existing /api suffix', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com/api/' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('https://api.example.com/api');
  });

  it('returns "/api" when env returns whitespace-only string', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: '   ' };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe('/api');
  });

  it('applies the same baseURL to authApi and authMultiFormApi', async () => {
    window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com' };

    const mod = await import('../../../src/api/index');

    expect(mod.default.defaults.baseURL).toBe('https://api.example.com/api');
    expect(mod.authApi.defaults.baseURL).toBe('https://api.example.com/api');
    expect(mod.authMultiFormApi.defaults.baseURL).toBe('https://api.example.com/api');
  });

  it('prepends http:// when env is host:port without scheme', async () => {
    window.__ENV__ = {
      VITE_BACKEND_URL: 'ec2-13-232-58-235.ap-south-1.compute.amazonaws.com:5002',
    };

    const baseURL = await getApiBaseURL();

    expect(baseURL).toBe(
      'http://ec2-13-232-58-235.ap-south-1.compute.amazonaws.com:5002/api',
    );
  });
});
