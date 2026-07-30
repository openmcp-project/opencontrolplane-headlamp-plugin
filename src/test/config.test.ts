import { describe, it, expect } from 'vitest';
import { COMPONENTS, INSTALLABLE_BY_MODE } from '../config';

describe('COMPONENTS catalog', () => {
  it('has unique component names', () => {
    const names = COMPONENTS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every component has a label, probe, docsUrl and at least one version path', () => {
    for (const c of COMPONENTS) {
      expect(c.label).toBeTruthy();
      expect(c.probe.startsWith('/apis/')).toBe(true);
      expect(c.docsUrl.startsWith('https://')).toBe(true);
      expect(c.versionPaths.length).toBeGreaterThan(0);
    }
  });

  it('external-secrets probes the v1 API (not v1beta1)', () => {
    const eso = COMPONENTS.find((c) => c.name === 'externalSecretsOperator');
    expect(eso?.probe).toBe('/apis/external-secrets.io/v1/externalsecrets');
  });
});

describe('INSTALLABLE_BY_MODE', () => {
  it('v1 allows all five components', () => {
    expect(INSTALLABLE_BY_MODE.v1).toEqual(
      new Set(['crossplane', 'flux', 'btpServiceOperator', 'externalSecretsOperator', 'kyverno']),
    );
  });

  it('v2 excludes kyverno and btpServiceOperator', () => {
    expect(INSTALLABLE_BY_MODE.v2.has('kyverno')).toBe(false);
    expect(INSTALLABLE_BY_MODE.v2.has('btpServiceOperator')).toBe(false);
    expect(INSTALLABLE_BY_MODE.v2.has('crossplane')).toBe(true);
  });

  it('unknown falls back to the v2 (narrower) set', () => {
    expect(INSTALLABLE_BY_MODE.unknown).toEqual(INSTALLABLE_BY_MODE.v2);
  });
});
