import React from 'react';
import { Chip } from '../mui';
import { STATUS_COLORS, CHIP } from '../theme';

function chip(bg: string, color: string, label: string): React.ReactElement {
  if (Chip) {
    return <Chip label={label} size="small" style={{ background: bg, color, fontWeight: CHIP.fontWeight }} />;
  }
  return (
    <span style={{ ...CHIP, display: 'inline-block', background: bg, color }}>
      {label}
    </span>
  );
}

export function conditionChip(healthy: boolean | null): React.ReactElement {
  if (healthy === true)  return chip(STATUS_COLORS.healthy.bg,   STATUS_COLORS.healthy.text,   'Healthy');
  if (healthy === false) return chip(STATUS_COLORS.unhealthy.bg, STATUS_COLORS.unhealthy.text, 'Unhealthy');
  return chip(STATUS_COLORS.unknown.bg, STATUS_COLORS.unknown.text, 'Unknown');
}

function phaseTokens(phase: string): { bg: string; text: string } {
  switch (phase) {
    case 'Ready':        return STATUS_COLORS.installed;
    case 'Initializing':
    case 'Requested':
    case 'Progressing':  return STATUS_COLORS.progressing;
    default:             return STATUS_COLORS.unknown;
  }
}

export function StatusChip({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  // 'Requested' is a weak V1 signal (in spec.components, probe lagging) so a confirmed
  // probe wins over it; every other phase is authoritative (shown even if probe is false).
  if (phase && phase !== 'Requested') {
    const t = phaseTokens(phase);
    return <span style={{ ...CHIP, display: 'inline-block', background: t.bg, color: t.text }}>{phase}</span>;
  }
  if (installed === true) {
    return <span style={{ ...CHIP, display: 'inline-block', background: STATUS_COLORS.installed.bg, color: STATUS_COLORS.installed.text }}>Installed</span>;
  }
  if (phase === 'Requested') {
    return <span style={{ ...CHIP, display: 'inline-block', background: STATUS_COLORS.requested.bg, color: STATUS_COLORS.requested.text }}>Requested</span>;
  }
  if (installed === null) {
    return <span style={{ color: '#888', fontSize: 12 }}>Loading…</span>;
  }
  return <span style={{ ...CHIP, display: 'inline-block', background: STATUS_COLORS.notInstalled.bg, color: STATUS_COLORS.notInstalled.text }}>Not installed</span>;
}

export function HealthChip({ healthy }: { healthy: boolean | null }) {
  return conditionChip(healthy);
}
