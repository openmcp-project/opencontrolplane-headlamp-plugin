import React from 'react';
import { Chip } from '../mui';

const chipStyle = (background: string, color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 12,
  background,
  color,
  fontSize: 12,
  fontWeight: 600,
});

export function conditionChip(healthy: boolean | null) {
  const color = healthy === true ? '#4caf50' : healthy === false ? '#f44336' : '#9e9e9e';
  const label = healthy === true ? 'Healthy' : healthy === false ? 'Unhealthy' : '—';
  if (Chip) {
    return <Chip label={label} size="small" style={{ background: color, color: '#fff', fontWeight: 600 }} />;
  }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 10, background: color, color: '#fff', fontSize: 11, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function phaseColor(phase: string): string {
  switch (phase) {
    case 'Ready':
      return '#4caf50'; // green
    case 'Initializing':
    case 'Requested':
    case 'Progressing':
      return '#E9730C'; // amber
    default:
      return '#9e9e9e'; // grey
  }
}

export function StatusChip({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  // 'Requested' is a weak V1 signal (in spec.components, probe lagging) so a confirmed
  // probe wins over it; every other phase is authoritative (shown even if probe is false).
  if (phase && phase !== 'Requested') {
    return <span style={chipStyle(phaseColor(phase), '#fff')}>{phase}</span>;
  }
  if (installed === true) {
    return <span style={chipStyle('#4caf50', '#fff')}>Installed</span>;
  }
  if (phase === 'Requested') {
    return <span style={chipStyle(phaseColor('Requested'), '#fff')}>Requested</span>;
  }
  if (installed === null) {
    return <span style={{ color: '#888', fontSize: 12 }}>Loading…</span>;
  }
  return <span style={chipStyle('rgba(128,128,128,0.2)', '#888')}>Not installed</span>;
}

export function HealthChip({ healthy }: { healthy: boolean | null }) {
  return conditionChip(healthy);
}
