import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Integration tests for docker/env.sh
 *
 * This shell script generates a window.__ENV__ JS file from environment
 * variables at container startup. We create a modified copy that writes
 * to a temp directory, then verify the generated output.
 */
describe('docker/env.sh — env-config.js generation', () => {
  const scriptPath = join(__dirname, '..', '..', 'docker', 'env.sh');
  let tmpDir: string;
  let outputFile: string;
  let modifiedScript: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'env-config-test-'));
    outputFile = join(tmpDir, 'env-config.js');

    // Read the original script, strip \r (Windows line endings), and replace the output path
    const originalScript = readFileSync(scriptPath, 'utf-8').replace(/\r/g, '');
    const replaced = originalScript.replaceAll(
      '/usr/share/nginx/html/env-config.js',
      outputFile,
    );
    modifiedScript = join(tmpDir, 'env.sh');
    writeFileSync(modifiedScript, replaced, { mode: 0o755 });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function runEnvScript(envVars: Record<string, string> = {}): string {
    // Build a clean env with only PATH + our vars to avoid inheriting VITE_* from host
    const cleanEnv: Record<string, string> = {
      PATH: process.env.PATH || '/usr/bin:/bin:/usr/sbin:/sbin',
      HOME: process.env.HOME || '/tmp',
      ...envVars,
    };

    execSync(`/bin/sh "${modifiedScript}"`, {
      cwd: tmpDir,
      env: cleanEnv,
    });

    return readFileSync(outputFile, 'utf-8');
  }

  it('generates valid JS with all env vars set', () => {
    const output = runEnvScript({
      VITE_BACKEND_URL: 'https://api.example.com',
      VITE_FRONTEND_URL: 'https://app.example.com',
      VITE_ASSEST_URL: 'https://assets.example.com',
    });

    expect(output).toContain('window.__ENV__');
    expect(output).toContain('VITE_BACKEND_URL: "https://api.example.com"');
    expect(output).toContain('VITE_FRONTEND_URL: "https://app.example.com"');
    expect(output).toContain('VITE_ASSEST_URL: "https://assets.example.com"');
  });

  it('generates JS with empty strings when env vars are not set', () => {
    const output = runEnvScript({});

    expect(output).toContain('window.__ENV__');
    expect(output).toContain('VITE_BACKEND_URL: ""');
    expect(output).toContain('VITE_FRONTEND_URL: ""');
    expect(output).toContain('VITE_ASSEST_URL: ""');
  });

  it('generates valid JavaScript that can be evaluated', () => {
    const output = runEnvScript({
      VITE_BACKEND_URL: 'https://api.example.com',
      VITE_FRONTEND_URL: 'https://app.example.com',
      VITE_ASSEST_URL: 'https://assets.example.com',
    });

    // Evaluate the script in a sandboxed context
    const mockWindow: Record<string, any> = {};
    const fn = new Function('window', output);
    fn(mockWindow);

    expect(mockWindow.__ENV__).toBeDefined();
    expect(mockWindow.__ENV__.VITE_BACKEND_URL).toBe('https://api.example.com');
    expect(mockWindow.__ENV__.VITE_FRONTEND_URL).toBe('https://app.example.com');
    expect(mockWindow.__ENV__.VITE_ASSEST_URL).toBe('https://assets.example.com');
  });

  it('handles URLs with ports and paths in env var values', () => {
    const output = runEnvScript({
      VITE_BACKEND_URL: 'https://api.example.com:8443/v2',
    });

    expect(output).toContain('VITE_BACKEND_URL: "https://api.example.com:8443/v2"');
  });

  it('generates output with exactly three keys', () => {
    const output = runEnvScript({
      VITE_BACKEND_URL: 'a',
      VITE_FRONTEND_URL: 'b',
      VITE_ASSEST_URL: 'c',
    });

    // Count occurrences of "VITE_" which represent the three config keys
    const viteKeyMatches = output.match(/VITE_\w+:/g);
    expect(viteKeyMatches).toHaveLength(3);
  });
});
