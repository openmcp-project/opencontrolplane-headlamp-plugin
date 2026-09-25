import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveColorScheme } from '../kiosk';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('resolveColorScheme', () => {
  it("returns 'dark' when the OS prefers dark", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(resolveColorScheme()).toBe('dark');
  });

  it("returns 'light' when the OS prefers light", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    expect(resolveColorScheme()).toBe('light');
  });

  it("defaults to 'light' when matchMedia is unavailable", () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    expect(resolveColorScheme()).toBe('light');
  });
});
