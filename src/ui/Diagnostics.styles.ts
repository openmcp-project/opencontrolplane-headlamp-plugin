import React from 'react';
import { HorizonTokens } from '../theme';
import { DeploymentCondition } from '../api';

export function conditionColor(tokens: HorizonTokens, c: DeploymentCondition): string {
  if (c.type === 'Available') return c.status === 'True' ? tokens.positive : tokens.negative;
  if (c.type === 'Progressing') return c.status === 'True' ? tokens.positive : tokens.critical;
  return tokens.label;
}

export const wrapStyle: React.CSSProperties = { marginTop: 16 };
export const messageStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.label, fontSize: 12, marginTop: 12 });
export const panelStyle: React.CSSProperties = { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 };
export const sectionLabelStyle = (tokens: HorizonTokens): React.CSSProperties => ({ fontSize: 12, fontWeight: 600, color: tokens.label, marginBottom: 4 });
export const conditionListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
export const eventListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
export const rowStyle: React.CSSProperties = { fontSize: 12, lineHeight: 1.5 };
export const nestedTextStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.label, marginLeft: 8 });
export const fallbackButtonStyle: React.CSSProperties = { fontSize: 13, padding: '2px 10px', cursor: 'pointer' };
export const boldStyle: React.CSSProperties = { fontWeight: 600 };
export const mutedInlineStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.label });
export const reasonStyle = (tokens: HorizonTokens): React.CSSProperties => ({ color: tokens.negative, fontWeight: 600 });

export const conditionStatusStyle = (tokens: HorizonTokens, c: DeploymentCondition): React.CSSProperties => ({
  color: conditionColor(tokens, c),
  fontWeight: 600,
});
