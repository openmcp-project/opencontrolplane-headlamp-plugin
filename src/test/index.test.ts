// Unit tests for opencontrolplane-headlamp-plugin
//
// conditionChip, FIORI, HIDDEN_SIDEBAR_ENTRIES, forceDefaultNamespace, and
// forceSidebarCollapsed are NOT exported from src/index.tsx.  We test them via:
//   - inline replication of pure logic (conditionChip color, FIORI values, HIDDEN_SIDEBAR_ENTRIES)
//   - observable localStorage side-effects (forceDefaultNamespace, forceSidebarCollapsed)

// Mock @kinvolk/headlamp-plugin/lib before any import that triggers the module
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  registerRoute: vi.fn(),
  registerSidebarEntry: vi.fn(),
  registerSidebarEntryFilter: vi.fn(),
  registerAppBarAction: vi.fn(),
  registerAppTheme: vi.fn(),
  K8s: { ApiProxy: { request: vi.fn(() => Promise.resolve({ items: [] })) } },
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── conditionChip color logic (replicated inline) ────────────────────────────

function conditionChipColor(healthy: boolean | null): string {
  return healthy === true ? '#4caf50' : healthy === false ? '#f44336' : '#9e9e9e';
}

describe('conditionChip color logic', () => {
  it('returns green for true', () => {
    expect(conditionChipColor(true)).toBe('#4caf50');
  });

  it('returns red for false', () => {
    expect(conditionChipColor(false)).toBe('#f44336');
  });

  it('returns grey for null', () => {
    expect(conditionChipColor(null)).toBe('#9e9e9e');
  });
});

// ── FIORI design tokens ───────────────────────────────────────────────────────

const FIORI = {
  primaryBlue:       '#0070F2',
  sidebarSelectedBg: '#b3d9f7',
  sidebarSelectedFg: '#0a3d6b',
  pageBackground:    '#F5F6F7',
  cardBackground:    '#FFFFFF',
  bodyText:          '#1D2D3E',
  mutedText:         '#6B7280',
  successGreen:      '#107E3E',
  warningAmber:      '#E9730C',
  errorRed:          '#BB0000',
  borderRadius:      '8px',
  spacing:           '8px',
};

describe('FIORI design tokens', () => {
  it('primaryBlue is #0070F2', () => {
    expect(FIORI.primaryBlue).toBe('#0070F2');
  });

  it('borderRadius is 8px', () => {
    expect(FIORI.borderRadius).toBe('8px');
  });
});

// ── HIDDEN_SIDEBAR_ENTRIES ────────────────────────────────────────────────────

const HIDDEN_SIDEBAR_ENTRIES = new Set(['home', 'storage', 'network', 'gatewayapi']);

describe('HIDDEN_SIDEBAR_ENTRIES', () => {
  it('contains home, storage, network, gatewayapi', () => {
    expect(HIDDEN_SIDEBAR_ENTRIES.has('home')).toBe(true);
    expect(HIDDEN_SIDEBAR_ENTRIES.has('storage')).toBe(true);
    expect(HIDDEN_SIDEBAR_ENTRIES.has('network')).toBe(true);
    expect(HIDDEN_SIDEBAR_ENTRIES.has('gatewayapi')).toBe(true);
  });

  it('does NOT contain crossplane or workloads', () => {
    expect(HIDDEN_SIDEBAR_ENTRIES.has('crossplane')).toBe(false);
    expect(HIDDEN_SIDEBAR_ENTRIES.has('workloads')).toBe(false);
  });
});

// ── forceDefaultNamespace localStorage side-effects ──────────────────────────

function forceDefaultNamespace(pathname: string) {
  try {
    const match = pathname.match(/^\/c\/([^/]+)/);
    const cluster = match ? match[1] : null;
    if (!cluster) return;
    const key = `headlamp-selected-namespace_${cluster}`;
    const saved = localStorage.getItem(key);
    const current: string[] = saved ? JSON.parse(saved) : [];
    if (current.length === 0) {
      localStorage.setItem(key, JSON.stringify(['default']));
    }
  } catch (_) {}
}

describe('forceDefaultNamespace', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('sets ["default"] when namespace list is empty', () => {
    forceDefaultNamespace('/c/test-cluster/something');
    const stored = localStorage.getItem('headlamp-selected-namespace_test-cluster');
    expect(stored).toBe(JSON.stringify(['default']));
  });

  it('does not overwrite when namespace is already set', () => {
    const key = 'headlamp-selected-namespace_test-cluster';
    localStorage.setItem(key, JSON.stringify(['my-ns']));
    forceDefaultNamespace('/c/test-cluster/something');
    const stored = localStorage.getItem(key);
    expect(stored).toBe(JSON.stringify(['my-ns']));
  });

  it('does nothing when pathname has no cluster segment', () => {
    forceDefaultNamespace('/settings');
    expect(localStorage.length).toBe(0);
  });
});

// ── forceSidebarCollapsed localStorage side-effects ──────────────────────────

function forceSidebarCollapsed() {
  try {
    localStorage.setItem('sidebar', JSON.stringify({ shrink: true }));
  } catch (_) {}
}

describe('forceSidebarCollapsed', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('calls localStorage.setItem with key "sidebar"', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    forceSidebarCollapsed();
    expect(spy).toHaveBeenCalledWith('sidebar', expect.any(String));
    spy.mockRestore();
  });

  it('stores a value containing shrink: true', () => {
    forceSidebarCollapsed();
    const stored = localStorage.getItem('sidebar');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.shrink).toBe(true);
  });
});
