import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock localStorage (jsdom provides it but it may not behave correctly in all environments)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// NOTE: Vitest runs afterEach hooks in LIFO order (last registered = first to run).
// cleanup() must run before localStorageMock.clear() to ensure component unmount
// effects (e.g., useAutoSave save-on-unmount) complete before clearing localStorage.
// Register localStorage clear FIRST so it runs LAST (after cleanup).
afterEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// Cleanup after each test - registered LAST so it runs FIRST (LIFO order)
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Export expect for convenience
export { expect };
