import React from 'react';
import { FIORI } from '../theme';
import { StepState } from './status';

const BLUE = FIORI.accentBlue;
const GREEN = FIORI.successGreen;
const GREY = FIORI.pendingGrey;
const MUTED = FIORI.mutedText;

export function stepColor(state: StepState, complete: boolean): string {
  if (state === 'pending') return GREY;
  return complete ? GREEN : BLUE;
}

export function connectorColor(state: StepState, complete: boolean): string {
  return state === 'pending' ? GREY : complete ? GREEN : BLUE;
}

export const dashStyle: React.CSSProperties = { color: MUTED, fontSize: 14 };
export const miniWrapStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
export const miniCaptionStyle: React.CSSProperties = { fontSize: 12, color: MUTED };
export const miniTrackStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' };

export const fullWrapStyle: React.CSSProperties = { padding: '4px 0 8px' };
export const fullTitleStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginBottom: 16, color: MUTED };
export const fullTrackStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-start' };
export const fullStepStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 96,
};
export const fullLabelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginTop: 8, textAlign: 'center' };
export const fullSubStyle: React.CSSProperties = { fontSize: 12, color: MUTED, marginTop: 2 };
export const emptyStyle: React.CSSProperties = { color: MUTED, fontSize: 13, padding: '4px 0' };

export function miniConnectorStyle(state: StepState, complete: boolean): React.CSSProperties {
  return { width: 16, height: 2, background: connectorColor(state, complete) };
}

export function miniDotStyle(state: StepState, color: string): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: state === 'pending' ? '#fff' : color,
    border: `2px solid ${color}`,
    boxShadow: state === 'current' ? `0 0 0 3px ${color}33` : 'none',
    boxSizing: 'border-box',
  };
}

export function fullConnectorStyle(state: StepState, complete: boolean): React.CSSProperties {
  return { flex: 1, height: 2, marginTop: 13, background: connectorColor(state, complete) };
}

export function fullCircleStyle(state: StepState, color: string): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: state === 'pending' ? '#fff' : color,
    border: `2px solid ${color}`,
    color: state === 'pending' ? MUTED : '#fff',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: state === 'current' ? `0 0 0 4px ${color}33` : 'none',
    boxSizing: 'border-box',
  };
}
