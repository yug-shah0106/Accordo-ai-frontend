import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { env } from '../../../src/utils/env';

describe('env() helper', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Clear window.__ENV__ before each test
    delete window.__ENV__;
  });

  afterEach(() => {
    delete window.__ENV__;
    // Restore import.meta.env stubs
    vi.unstubAllEnvs();
  });

  describe('window.__ENV__ lookup', () => {
    it('returns value from window.__ENV__ when set', () => {
      window.__ENV__ = { VITE_BACKEND_URL: 'https://api.prod.example.com' };

      expect(env('VITE_BACKEND_URL')).toBe('https://api.prod.example.com');
    });

    it('returns value for VITE_FRONTEND_URL from window.__ENV__', () => {
      window.__ENV__ = { VITE_FRONTEND_URL: 'https://app.prod.example.com' };

      expect(env('VITE_FRONTEND_URL')).toBe('https://app.prod.example.com');
    });

    it('returns value for VITE_ASSEST_URL from window.__ENV__', () => {
      window.__ENV__ = { VITE_ASSEST_URL: 'https://assets.prod.example.com' };

      expect(env('VITE_ASSEST_URL')).toBe('https://assets.prod.example.com');
    });
  });

  describe('import.meta.env fallback', () => {
    it('falls back to import.meta.env when window.__ENV__ is not set', () => {
      vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:5002');

      expect(env('VITE_BACKEND_URL')).toBe('http://localhost:5002');
    });

    it('falls back to import.meta.env when key is missing from window.__ENV__', () => {
      window.__ENV__ = { VITE_FRONTEND_URL: 'https://app.example.com' };
      vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:5002');

      expect(env('VITE_BACKEND_URL')).toBe('http://localhost:5002');
    });
  });

  describe('priority', () => {
    it('window.__ENV__ takes priority over import.meta.env', () => {
      window.__ENV__ = { VITE_BACKEND_URL: 'https://api.prod.example.com' };
      vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:5002');

      expect(env('VITE_BACKEND_URL')).toBe('https://api.prod.example.com');
    });
  });

  describe('empty string fallback', () => {
    it('returns empty string when key is in neither source', () => {
      expect(env('VITE_NONEXISTENT_KEY')).toBe('');
    });

    it('returns empty string for unknown keys when window.__ENV__ is set', () => {
      window.__ENV__ = { VITE_BACKEND_URL: 'https://api.example.com' };

      expect(env('VITE_UNKNOWN_KEY')).toBe('');
    });

    it('returns empty string when window.__ENV__ is undefined and key not in import.meta.env', () => {
      // window.__ENV__ is already deleted in beforeEach
      // Use a key that is definitely not in .env.local
      expect(env('VITE_TOTALLY_MISSING_KEY')).toBe('');
    });
  });

  describe('edge cases', () => {
    it('handles window.__ENV__ set to empty object (falls through to import.meta.env)', () => {
      window.__ENV__ = {};

      // Key missing from both __ENV__ (empty) and import.meta.env
      expect(env('VITE_DEFINITELY_NOT_SET')).toBe('');
    });

    it('handles window.__ENV__ with empty string value (does not fall through)', () => {
      // An empty string is falsy but nullish coalescing (??) only triggers on null/undefined.
      // So an explicit empty string in __ENV__ should be returned as-is.
      window.__ENV__ = { VITE_BACKEND_URL: '' };
      vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:5002');

      expect(env('VITE_BACKEND_URL')).toBe('');
    });

    it('works with all three known VITE_ keys simultaneously', () => {
      window.__ENV__ = {
        VITE_BACKEND_URL: 'https://api.example.com',
        VITE_FRONTEND_URL: 'https://app.example.com',
        VITE_ASSEST_URL: 'https://assets.example.com',
      };

      expect(env('VITE_BACKEND_URL')).toBe('https://api.example.com');
      expect(env('VITE_FRONTEND_URL')).toBe('https://app.example.com');
      expect(env('VITE_ASSEST_URL')).toBe('https://assets.example.com');
    });

    it('handles arbitrary custom keys via the index signature', () => {
      window.__ENV__ = { VITE_CUSTOM_FEATURE_FLAG: 'true' };

      expect(env('VITE_CUSTOM_FEATURE_FLAG')).toBe('true');
    });
  });
});
