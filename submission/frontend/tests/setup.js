import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no browser layout APIs; Mantine uses them.
if (!window.matchMedia) {
  window.matchMedia = query => ({ matches:false, media:query, onchange:null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){return false} });
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
