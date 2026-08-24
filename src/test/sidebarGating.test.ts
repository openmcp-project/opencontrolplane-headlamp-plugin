import { describe, it, expect, vi, beforeEach } from 'vitest';

const { registerSidebarEntry, registerSidebarEntryFilter } = vi.hoisted(() => ({
  registerSidebarEntry: vi.fn(),
  registerSidebarEntryFilter: vi.fn(),
}));
const { apiExists } = vi.hoisted(() => ({ apiExists: vi.fn() }));

vi.mock('@kinvolk/headlamp-plugin/lib', () => ({ registerSidebarEntry, registerSidebarEntryFilter }));
vi.mock('../api', () => ({ apiExists }));

import { gateEntry, probeCycle, startSidebarGating, __resetForTests, GATED_TABS } from '../sidebarGating';

beforeEach(() => {
  registerSidebarEntry.mockReset();
  registerSidebarEntryFilter.mockReset();
  apiExists.mockReset();
  __resetForTests();
});

describe('gateEntry', () => {
  it('hides gated tabs when nothing is installed', () => {
    expect(gateEntry({ name: 'crossplane' })).toBeNull();
    expect(gateEntry({ name: 'flux' })).toBeNull();
  });

  it('passes through non-gated entries unchanged', () => {
    const overview = { name: 'ocp-overview' };
    const storage = { name: 'storage' };
    expect(gateEntry(overview)).toBe(overview);
    expect(gateEntry(storage)).toBe(storage);
    expect(gateEntry({})).toEqual({});
  });

  it('shows a gated tab once its component probes installed', async () => {
    apiExists.mockImplementation((path: string) => Promise.resolve(path.includes('crossplane')));
    await probeCycle();
    const crossplane = { name: 'crossplane' };
    expect(gateEntry(crossplane)).toBe(crossplane);
    expect(gateEntry({ name: 'flux' })).toBeNull();
  });
});

describe('probeCycle', () => {
  it('bumps the sidebar when the installed set changes (appears)', async () => {
    apiExists.mockResolvedValue(true);
    await probeCycle();
    expect(registerSidebarEntry).toHaveBeenCalledTimes(1);
    expect(registerSidebarEntry).toHaveBeenCalledWith(expect.objectContaining({ name: 'ocp-overview' }));
  });

  it('does not bump when the set is unchanged between cycles', async () => {
    apiExists.mockResolvedValue(true);
    await probeCycle(); // false -> true, bump
    await probeCycle(); // true -> true, no change
    expect(registerSidebarEntry).toHaveBeenCalledTimes(1);
  });

  it('bumps again and hides the tab when a component disappears', async () => {
    apiExists.mockResolvedValue(true);
    await probeCycle(); // installed
    expect(gateEntry({ name: 'crossplane' })).not.toBeNull();

    apiExists.mockResolvedValue(false);
    await probeCycle(); // uninstalled -> bump + hidden
    expect(registerSidebarEntry).toHaveBeenCalledTimes(2);
    expect(gateEntry({ name: 'crossplane' })).toBeNull();
  });
});

describe('startSidebarGating', () => {
  it('registers the filter and returns a stop function', () => {
    apiExists.mockResolvedValue(false);
    const stop = startSidebarGating();
    expect(registerSidebarEntryFilter).toHaveBeenCalledTimes(1);
    expect(typeof stop).toBe('function');
    stop();
  });

  it('gates exactly the crossplane and flux tabs', () => {
    expect(GATED_TABS).toEqual({ crossplane: 'crossplane', flux: 'flux' });
  });
});
