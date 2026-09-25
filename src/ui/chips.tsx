import React from 'react';
import { Chip } from '../mui';
import { phaseColor } from './status';
import { useHorizonTokens, statusColor, healthKind, HorizonTokens } from '../theme';
import * as s from './chips.styles';

export function conditionChip(tokens: HorizonTokens, healthy: boolean | null) {
  const color = statusColor(tokens, healthKind(healthy));
  const label = healthy === true ? 'Healthy' : healthy === false ? 'Unhealthy' : '—';
  if (Chip) {
    return <Chip label={label} size="small" style={s.muiConditionChipStyle(color)} />;
  }
  return <span style={s.conditionSpanStyle(color)}>{label}</span>;
}

export function StatusChip({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  const tokens = useHorizonTokens();
  // 'Requested' and 'Progressing' are weak signals — a confirmed probe (installed=true) wins.
  // 'Initializing' and other phases are authoritative and win even without a probe confirmation.
  if (phase && phase !== 'Requested' && phase !== 'Progressing') {
    return <span style={s.chipStyle(phaseColor(tokens, phase), '#fff')}>{phase}</span>;
  }
  if (installed === true) {
    return <span style={s.chipStyle(statusColor(tokens, 'healthy'), '#fff')}>Installed</span>;
  }
  if (phase === 'Progressing' || phase === 'Requested') {
    return <span style={s.chipStyle(phaseColor(tokens, phase), '#fff')}>{phase}</span>;
  }
  if (installed === null) {
    return <span style={s.loadingStyle(tokens)}>Loading…</span>;
  }
  return <span style={s.chipStyle(tokens.surfaceMuted, tokens.label)}>Not installed</span>;
}

export function HealthChip({ healthy }: { healthy: boolean | null }) {
  const tokens = useHorizonTokens();
  return conditionChip(tokens, healthy);
}
