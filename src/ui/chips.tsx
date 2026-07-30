import React from 'react';
import { Chip } from '../mui';
import { phaseColor } from './status';
import * as s from './chips.styles';

export function conditionChip(healthy: boolean | null) {
  const color = healthy === true ? '#4caf50' : healthy === false ? '#f44336' : '#9e9e9e';
  const label = healthy === true ? 'Healthy' : healthy === false ? 'Unhealthy' : '—';
  if (Chip) {
    return <Chip label={label} size="small" style={s.muiConditionChipStyle(color)} />;
  }
  return <span style={s.conditionSpanStyle(color)}>{label}</span>;
}

export function StatusChip({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  // 'Requested' is a weak V1 signal (in spec.components, probe lagging) so a confirmed
  // probe wins over it; every other phase is authoritative (shown even if probe is false).
  if (phase && phase !== 'Requested') {
    return <span style={s.chipStyle(phaseColor(phase), '#fff')}>{phase}</span>;
  }
  if (installed === true) {
    return <span style={s.chipStyle('#4caf50', '#fff')}>Installed</span>;
  }
  if (phase === 'Requested') {
    return <span style={s.chipStyle(phaseColor('Requested'), '#fff')}>Requested</span>;
  }
  if (installed === null) {
    return <span style={s.loadingStyle}>Loading…</span>;
  }
  return <span style={s.chipStyle('rgba(128,128,128,0.2)', '#888')}>Not installed</span>;
}

export function HealthChip({ healthy }: { healthy: boolean | null }) {
  return conditionChip(healthy);
}
