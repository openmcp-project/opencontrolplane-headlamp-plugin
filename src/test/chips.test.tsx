import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusChip } from '../ui/chips';

const text = (installed: boolean | null, phase?: string | null) =>
  render(<StatusChip installed={installed} phase={phase} />).container.textContent;

describe('StatusChip precedence', () => {
  it('shows an authoritative phase even when the probe is false/null', () => {
    expect(text(false, 'Progressing')).toBe('Progressing');
    expect(text(null, 'Ready')).toBe('Ready');
    expect(text(false, 'Ready')).toBe('Ready');
  });

  it('a confirmed probe wins over the weak Requested signal', () => {
    expect(text(true, 'Requested')).toBe('Installed');
  });

  it('shows Requested only while the probe has not confirmed', () => {
    expect(text(false, 'Requested')).toBe('Requested');
    expect(text(null, 'Requested')).toBe('Requested');
  });

  it('falls back to installed / loading / not-installed without a phase', () => {
    expect(text(true, null)).toBe('Installed');
    expect(text(null, null)).toBe('Loading…');
    expect(text(false, null)).toBe('Not installed');
  });
});
