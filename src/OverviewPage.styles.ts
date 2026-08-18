import React from 'react';

export const sectionStyle: React.CSSProperties = { marginBottom: 32 };
export const headingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
  borderBottom: '1px solid rgba(128,128,128,0.2)',
  paddingBottom: 8,
};
export const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
export const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontWeight: 600,
  fontSize: 13,
  opacity: 0.6,
  borderBottom: '1px solid rgba(128,128,128,0.15)',
};
export const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(128,128,128,0.1)',
  fontSize: 14,
};
export const monoTdStyle: React.CSSProperties = { ...tdStyle, fontFamily: 'monospace', fontSize: 13 };
export const mutedStyle: React.CSSProperties = { color: '#888', fontSize: 14 };
export const chevronThStyle: React.CSSProperties = { ...thStyle, width: 24 };
export const chevronTdStyle: React.CSSProperties = { ...tdStyle, width: 24, textAlign: 'center' };
export const clickableRowStyle: React.CSSProperties = { cursor: 'pointer' };
export const expandedCellStyle: React.CSSProperties = {
  ...tdStyle,
  background: 'rgba(128,128,128,0.05)',
  padding: '12px 24px',
};
export const loadingVersionStyle: React.CSSProperties = { color: '#888', fontSize: 12, fontFamily: 'inherit' };
export const pageStyle: React.CSSProperties = { padding: 24, maxWidth: 800 };
export const titleStyle: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: 0 };

export const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 24,
};
export const subtitleStyle: React.CSSProperties = { color: '#6B7280', fontSize: 14, marginTop: 4 };
export const headerLinksStyle: React.CSSProperties = { display: 'flex', gap: 20, flexShrink: 0, paddingTop: 4 };
export const headerLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: '#0070F2',
  fontSize: 14,
  cursor: 'pointer',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
};

export const chevronStyle = (expanded: boolean): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 16,
  lineHeight: 1,
  color: '#888',
  transform: expanded ? 'rotate(90deg)' : 'none',
  transition: 'transform 0.15s',
});
