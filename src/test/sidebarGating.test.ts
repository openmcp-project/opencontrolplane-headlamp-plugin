import { describe, it, expect, vi, beforeEach } from 'vitest';

const { registerSidebarEntry, registerSidebarEntryFilter } = vi.hoisted(() => ({
  registerSidebarEntry: vi.fn(),
  registerSidebarEntryFilter: vi.fn(),
}));
const { fetchDeploymentVersion } = vi.hoisted(() => ({ fetchDeploymentVersion: vi.fn() }));

vi.mock('@kinvolk/headlamp-plugin/lib', () => ({ registerSidebarEntry, registerSidebarEntryFilter }));
vi.mock('../api', () => ({ fetchDeploymentVersion }));

import { gateEntry, probeCycle, startSidebarGating, __resetForTests, GATED_TABS } from '../sidebarGating';

beforeEach(() => {
  registerSidebarEntry.mockReset();
  registerSidebarEntryFilter.mockReset();
  fetchDeploymentVersion.mockReset();
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

  it('shows a gated tab once its component deployment is found', async () => {
    fetchDeploymentVersion.mockImplementation((paths: string[]) =>
      Promise.resolve(paths.some((p) => p.includes('crossplane')) ? 'v1.15.0' : null),
    );
    await probeCycle();
    const crossplane = { name: 'crossplane' };
    expect(gateEntry(crossplane)).toBe(crossplane);
    expect(gateEntry({ name: 'flux' })).toBeNull();
  });
});

describe('probeCycle', () => {
  it('bumps the sidebar when the installed set changes (appears)', async () => {
    fetchDeploymentVersion.mockResolvedValue('v1.0.0');
    await probeCycle();
    expect(registerSidebarEntry).toHaveBeenCalledTimes(1);
    expect(registerSidebarEntry).toHaveBeenCalledWith(expect.objectContaining({ name: 'ocp-overview' }));
  });

  it('does not bump when the set is unchanged between cycles', async () => {
    fetchDeploymentVersion.mockResolvedValue('v1.0.0');
    await probeCycle();
    await probeCycle();
    expect(registerSidebarEntry).toHaveBeenCalledTimes(1);
  });

  it('bumps again and hides the tab when a component disappears', async () => {
    fetchDeploymentVersion.mockResolvedValue('v1.0.0');
    await probeCycle();
    expect(gateEntry({ name: 'crossplane' })).not.toBeNull();

    fetchDeploymentVersion.mockResolvedValue(null);
    await probeCycle();
    expect(registerSidebarEntry).toHaveBeenCalledTimes(2);
    expect(gateEntry({ name: 'crossplane' })).toBeNull();
  });
});

describe('startSidebarGating', () => {
  it('registers the filter and returns a stop function', () => {
    fetchDeploymentVersion.mockResolvedValue(null);
    const stop = startSidebarGating();
    expect(registerSidebarEntryFilter).toHaveBeenCalledTimes(1);
    expect(typeof stop).toBe('function');
    stop();
  });

  it('gates crossplane, flux and external-secrets-operator tabs', () => {
    expect(GATED_TABS).toEqual({
      crossplane: 'crossplane',
      flux: 'flux',
      externalSecretsOperator: 'external-secrets-operator',
    });
  });
});
