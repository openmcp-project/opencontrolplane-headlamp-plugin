import React from 'react';
import { FIORI } from '../theme';
import { DeploymentCondition } from '../api';

const MUTED = FIORI.mutedText;
const RED = FIORI.errorRed;
const GREEN = FIORI.successGreen;
const AMBER = FIORI.warningAmber;

export function conditionColor(c: DeploymentCondition): string {
  if (c.type === 'Available') return c.status === 'True' ? GREEN : RED;
  if (c.type === 'Progressing') return c.status === 'True' ? GREEN : AMBER;
  return MUTED;
}

export const wrapStyle: React.CSSProperties = { marginTop: 16 };
export const messageStyle: React.CSSProperties = { color: MUTED, fontSize: 12, marginTop: 12 };
export const panelStyle: React.CSSProperties = { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 };
export const sectionLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 4 };
export const conditionListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
export const eventListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
export const rowStyle: React.CSSProperties = { fontSize: 12, lineHeight: 1.5 };
export const nestedTextStyle: React.CSSProperties = { color: MUTED, marginLeft: 8 };
export const fallbackButtonStyle: React.CSSProperties = { fontSize: 13, padding: '2px 10px', cursor: 'pointer' };
export const boldStyle: React.CSSProperties = { fontWeight: 600 };
export const mutedInlineStyle: React.CSSProperties = { color: MUTED };
export const reasonStyle: React.CSSProperties = { color: RED, fontWeight: 600 };

export const conditionStatusStyle = (c: DeploymentCondition): React.CSSProperties => ({
  color: conditionColor(c),
  fontWeight: 600,
});
