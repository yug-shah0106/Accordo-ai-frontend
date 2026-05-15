import { describe, it, expect } from 'vitest';
import {
  normalizeViteBackendUrl,
  normalizeViteEnvUrl,
} from '../../../src/utils/normalizeViteBackendUrl';

describe('normalizeViteEnvUrl / normalizeViteBackendUrl', () => {
  it('exports the same function under both names', () => {
    expect(normalizeViteEnvUrl('host.test:1')).toBe(normalizeViteBackendUrl('host.test:1'));
  });
  it('returns empty for blank input', () => {
    expect(normalizeViteBackendUrl('')).toBe('');
    expect(normalizeViteBackendUrl('   ')).toBe('');
  });

  it('leaves path-style bases unchanged', () => {
    expect(normalizeViteBackendUrl('/api')).toBe('/api');
    expect(normalizeViteBackendUrl('/proxy/backend')).toBe('/proxy/backend');
  });

  it('prepends http when host has no scheme (avoids axios relative resolution)', () => {
    expect(
      normalizeViteBackendUrl(
        'ec2-13-232-58-235.ap-south-1.compute.amazonaws.com:5002',
      ),
    ).toBe('http://ec2-13-232-58-235.ap-south-1.compute.amazonaws.com:5002');
    expect(normalizeViteBackendUrl('localhost:5002')).toBe('http://localhost:5002');
  });

  it('does not change URLs that already include a scheme', () => {
    expect(normalizeViteBackendUrl('https://api.example.com')).toBe(
      'https://api.example.com',
    );
    expect(normalizeViteBackendUrl('http://127.0.0.1:5002')).toBe('http://127.0.0.1:5002');
  });

  it('rewrites protocol-relative URLs to http', () => {
    expect(normalizeViteBackendUrl('//api.example.com')).toBe('http://api.example.com');
  });
});
