import { describe, it, expect } from 'vitest';
import { HORIZON_LIGHT, HORIZON_DARK, buildAppTheme, statusColor } from '../theme';

// These assertions pin the authoritative SAP `theming-base-content` values
// (sap_horizon / sap_horizon_dark). If a value drifts, this test fails loudly.
describe('Horizon token sets', () => {
  it('light tokens match the authoritative Horizon palette', () => {
    expect(HORIZON_LIGHT).toMatchObject({
      brand: '#0070f2',
      background: '#f5f6f7',
      surface: '#ffffff',
      text: '#131e29',
      label: '#556b82',
      positive: '#256f3a',
      negative: '#aa0808',
      critical: '#e76500',
      informative: '#0070f2',
      neutral: '#788fa6',
      radius: 12,
    });
  });

  it('dark tokens match the authoritative Horizon Dark palette', () => {
    expect(HORIZON_DARK).toMatchObject({
      brand: '#0070f2',
      background: '#12171c',
      surface: '#1d232a',
      text: '#f5f6f7',
      label: '#8396a8',
      positive: '#97dd40',
      negative: '#fa6161',
      critical: '#ffdf72',
      informative: '#4db1ff',
      neutral: '#a9b4be',
      radius: 12,
    });
  });

  it('uses the 72 brand font stack', () => {
    expect(HORIZON_LIGHT.fontFamily[0]).toBe('72');
    expect(HORIZON_DARK.fontFamily).toEqual(HORIZON_LIGHT.fontFamily);
  });
});

describe('buildAppTheme', () => {
  const light = buildAppTheme('ocp-horizon', HORIZON_LIGHT, 'light');
  const dark = buildAppTheme('ocp-horizon-dark', HORIZON_DARK, 'dark');

  it('carries name and base through', () => {
    expect(light.name).toBe('ocp-horizon');
    expect(light.base).toBe('light');
    expect(dark.base).toBe('dark');
  });

  it('maps every token field onto the AppTheme', () => {
    expect(light.primary).toBe(HORIZON_LIGHT.brand);
    expect(light.text?.primary).toBe(HORIZON_LIGHT.text);
    expect(light.link?.color).toBe(HORIZON_LIGHT.informative);
    expect(light.background?.default).toBe(HORIZON_LIGHT.background);
    expect(light.background?.surface).toBe(HORIZON_LIGHT.surface);
    expect(light.background?.muted).toBe(HORIZON_LIGHT.surfaceMuted);
    expect(light.sidebar?.selectedBackground).toBe(HORIZON_LIGHT.sidebarSelectedBg);
    expect(light.sidebar?.selectedColor).toBe(HORIZON_LIGHT.sidebarSelectedFg);
    expect(light.radius).toBe(HORIZON_LIGHT.radius);
    expect(light.fontFamily).toEqual(HORIZON_LIGHT.fontFamily);
  });

  it('uses sentence-case buttons (Horizon, not MUI uppercase)', () => {
    expect(light.buttonTextTransform).toBe('none');
  });

  it('dark theme maps its own darker surfaces', () => {
    expect(dark.background?.default).toBe(HORIZON_DARK.background);
    expect(dark.background?.surface).toBe(HORIZON_DARK.surface);
  });
});

describe('statusColor', () => {
  it('follows the active token set (light vs dark)', () => {
    expect(statusColor(HORIZON_LIGHT, 'healthy')).toBe(HORIZON_LIGHT.positive);
    expect(statusColor(HORIZON_DARK, 'healthy')).toBe(HORIZON_DARK.positive);
    expect(statusColor(HORIZON_LIGHT, 'error')).toBe(HORIZON_LIGHT.negative);
    expect(statusColor(HORIZON_LIGHT, 'warning')).toBe(HORIZON_LIGHT.critical);
    expect(statusColor(HORIZON_LIGHT, 'info')).toBe(HORIZON_LIGHT.informative);
    expect(statusColor(HORIZON_LIGHT, 'pending')).toBe(HORIZON_LIGHT.neutral);
  });
});
