import React from 'react';

export const chipStyle = (background: string, color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 12,
  background,
  color,
  fontSize: 12,
  fontWeight: 600,
});

export const muiConditionChipStyle = (color: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  fontWeight: 600,
});

export const conditionSpanStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 10,
  background: color,
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
});

export const loadingStyle: React.CSSProperties = { color: '#888', fontSize: 12 };
