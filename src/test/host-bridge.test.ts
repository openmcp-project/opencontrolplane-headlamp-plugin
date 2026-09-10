import { describe, it, expect, vi, afterEach } from 'vitest';
import { canInstall, detectMode, openDocumentation, requestInstallWizard } from '../host-bridge';

describe('canInstall', () => {
  it('crossplane is installable in every mode', () => {
    expect(canInstall('crossplane', 'v1')).toBe(true);
    expect(canInstall('crossplane', 'v2')).toBe(true);
    expect(canInstall('crossplane', 'unknown')).toBe(true);
  });

  it('flux is installable in every mode', () => {
    expect(canInstall('flux', 'v1')).toBe(true);
    expect(canInstall('flux', 'v2')).toBe(true);
    expect(canInstall('flux', 'unknown')).toBe(true);
  });

  it('externalSecretsOperator is installable in every mode', () => {
    expect(canInstall('externalSecretsOperator', 'v1')).toBe(true);
    expect(canInstall('externalSecretsOperator', 'v2')).toBe(true);
    expect(canInstall('externalSecretsOperator', 'unknown')).toBe(true);
  });

  it('kyverno is installable only in v1', () => {
    expect(canInstall('kyverno', 'v1')).toBe(true);
    expect(canInstall('kyverno', 'v2')).toBe(false);
    expect(canInstall('kyverno', 'unknown')).toBe(false);
  });

  it('btpServiceOperator is installable only in v1', () => {
    expect(canInstall('btpServiceOperator', 'v1')).toBe(true);
    expect(canInstall('btpServiceOperator', 'v2')).toBe(false);
    expect(canInstall('btpServiceOperator', 'unknown')).toBe(false);
  });

  it('unknown component is never installable', () => {
    expect(canInstall('nope', 'v1')).toBe(false);
    expect(canInstall('nope', 'v2')).toBe(false);
    expect(canInstall('nope', 'unknown')).toBe(false);
  });
});

describe('detectMode', () => {
  const setParentHash = (hash: string) => {
    vi.spyOn(window, 'parent', 'get').mockReturnValue({ location: { hash } } as unknown as Window);
  };

  afterEach(() => { vi.restoreAllMocks(); });

  it('detects v1 from a /managedcontrolplane/ route', () => {
    setParentHash('#/projects/p/workspaces/w/managedcontrolplane/cp');
    expect(detectMode()).toBe('v1');
  });

  it('detects v2 from a /controlplane/ route', () => {
    setParentHash('#/projects/p/workspaces/w/controlplane/cp');
    expect(detectMode()).toBe('v2');
  });

  it('prefers v1 when the hash contains /managedcontrolplane/ (which also contains controlplane)', () => {
    setParentHash('#/projects/p/workspaces/w/managedcontrolplane/cp');
    expect(detectMode()).toBe('v1');
  });

  it('returns unknown when the route matches neither', () => {
    setParentHash('#/projects/p');
    expect(detectMode()).toBe('unknown');
  });

  it('returns unknown when parent location throws (cross-origin)', () => {
    vi.spyOn(window, 'parent', 'get').mockImplementation(() => {
      throw new Error('cross-origin');
    });
    expect(detectMode()).toBe('unknown');
  });
});

describe('requestInstallWizard', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('posts openInstallWizard to the parent when embedded', () => {
    const post = vi.fn();
    vi.spyOn(window, 'parent', 'get').mockReturnValue({ postMessage: post } as unknown as Window);
    requestInstallWizard('crossplane');
    expect(post).toHaveBeenCalledWith(
      { source: 'ocp-headlamp-plugin', action: 'openInstallWizard', component: 'crossplane' },
      window.location.origin,
    );
  });

  it('does nothing when not embedded (parent === self)', () => {
    vi.spyOn(window, 'parent', 'get').mockReturnValue(window);
    const post = vi.spyOn(window, 'postMessage');
    requestInstallWizard('crossplane');
    expect(post).not.toHaveBeenCalled();
  });

  it('passes the component name unchanged', () => {
    const post = vi.fn();
    vi.spyOn(window, 'parent', 'get').mockReturnValue({ postMessage: post } as unknown as Window);
    requestInstallWizard('externalSecretsOperator');
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({ component: 'externalSecretsOperator' }),
      expect.any(String),
    );
  });
});

describe('openDocumentation', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('opens the url in a new tab with noopener,noreferrer', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    openDocumentation('https://example.com/docs');
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
  });

  it('passes the url unchanged', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const url = 'https://docs.crossplane.io/latest/';
    openDocumentation(url);
    expect(open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
  });
});
