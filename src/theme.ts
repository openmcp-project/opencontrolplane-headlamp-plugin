// Fiori Horizon design tokens, shared by the app theme and the injected kiosk CSS.
export const FIORI = {
  primaryBlue: '#0070F2',
  sidebarSelectedBg: '#b3d9f7',
  sidebarSelectedFg: '#0a3d6b',
  pageBackground: '#F5F6F7',
  cardBackground: '#FFFFFF',
  bodyText: '#1D2D3E',
  mutedText: '#6B7280',
  successGreen: '#107E3E',
  warningAmber: '#E9730C',
  errorRed: '#BB0000',
  borderRadius: '8px',
  spacing: '8px',
};

// Status color tokens — aligned with the crossplane-headlamp-plugin palette.
export const STATUS_COLORS = {
  healthy:     { bg: '#2e7d32', text: '#fff' },
  unhealthy:   { bg: '#c62828', text: '#fff' },
  warning:     { bg: '#e65100', text: '#fff' },
  unknown:     { bg: '#616161', text: '#fff' },
  installed:   { bg: '#2e7d32', text: '#fff' },
  notInstalled:{ bg: 'rgba(128,128,128,0.18)', text: '#666' },
  requested:   { bg: '#e65100', text: '#fff' },
  progressing: { bg: '#e65100', text: '#fff' },
};

// Chip geometry — single source of truth.
export const CHIP = {
  borderRadius: 10,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 600,
} as const;
