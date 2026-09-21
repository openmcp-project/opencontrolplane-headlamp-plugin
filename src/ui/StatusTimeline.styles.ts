import React from 'react';
import { HorizonTokens } from '../theme';
import { StepState } from './status';

// Timeline colors follow the active Horizon token set: completed steps use the
// positive color, the in-progress step uses the brand/informative color, and
// pending steps use the neutral color.
export function stepColor(tokens: HorizonTokens, state: StepState, complete: boolean): string {
  if (state === 'pending') return tokens.neutral;
  return complete ? tokens.positive : tokens.informative;
}

export function connectorColor(tokens: HorizonTokens, state: StepState, complete: boolean): string {
  return state === 'pending' ? tokens.neutral : complete ? tokens.positive : tokens.informative;
}

export const dashStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.label, fontSize: 14 });
export const miniWrapStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
export const miniCaptionStyle = (tokens: HorizonTokens): React.CSSProperties => ({ fontSize: 12, color: tokens.label });
export const miniTrackStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' };

export const fullWrapStyle: React.CSSProperties = { padding: '4px 0 8px' };
export const fullTitleStyle = (tokens: HorizonTokens): React.CSSProperties => ({
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
  color: tokens.label,
});
export const fullTrackStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-start' };
export const fullStepStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 96,
};
export const fullLabelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginTop: 8, textAlign: 'center' };
export const fullSubStyle = (tokens: HorizonTokens): React.CSSProperties => ({ fontSize: 12, color: tokens.label, marginTop: 2 });
export const emptyStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.label, fontSize: 13, padding: '4px 0' });

export function miniConnectorStyle(tokens: HorizonTokens, state: StepState, complete: boolean): React.CSSProperties {
  return { width: 16, height: 2, background: connectorColor(tokens, state, complete) };
}

export function miniDotStyle(tokens: HorizonTokens, state: StepState, color: string): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: state === 'pending' ? tokens.surface : color,
    border: `2px solid ${color}`,
    boxShadow: state === 'current' ? `0 0 0 3px ${color}33` : 'none',
    boxSizing: 'border-box',
  };
}

export function fullConnectorStyle(tokens: HorizonTokens, state: StepState, complete: boolean): React.CSSProperties {
  return { flex: 1, height: 2, marginTop: 13, background: connectorColor(tokens, state, complete) };
}

export function fullCircleStyle(tokens: HorizonTokens, state: StepState, color: string): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: state === 'pending' ? tokens.surface : color,
    border: `2px solid ${color}`,
    color: state === 'pending' ? tokens.label : '#fff',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: state === 'current' ? `0 0 0 4px ${color}33` : 'none',
    boxSizing: 'border-box',
  };
}
