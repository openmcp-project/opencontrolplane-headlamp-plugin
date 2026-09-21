// Public entry point for the Horizon theme layer.
//
// Everything a plugin needs to adopt the SAP Fiori Horizon look is re-exported
// here: the raw token sets, the AppTheme mapper, the status color map, and the
// runtime-mode hook. A second plugin adopts the look with a single call:
//
//   registerAppTheme(buildAppTheme('my-horizon', HORIZON_LIGHT, 'light'));

export * from './horizon';
export * from './appTheme';
export * from './status';
export * from './useHorizonTokens';

import { HORIZON_LIGHT } from './horizon';

// ─────────────────────────────────────────────────────────────────────────────
// Back-compat shim. The plugin's older components import a flat `FIORI` object;
// this alias derives the same keys from the authoritative light token set so
// nothing breaks mid-migration. Delete once every caller reads HorizonTokens
// directly (see status.ts / useHorizonTokens).
// ─────────────────────────────────────────────────────────────────────────────
export const FIORI = {
  primaryBlue: HORIZON_LIGHT.brand,
  sidebarSelectedBg: HORIZON_LIGHT.sidebarSelectedBg,
  sidebarSelectedFg: HORIZON_LIGHT.sidebarSelectedFg,
  pageBackground: HORIZON_LIGHT.background,
  cardBackground: HORIZON_LIGHT.surface,
  bodyText: HORIZON_LIGHT.text,
  mutedText: HORIZON_LIGHT.label,
  successGreen: HORIZON_LIGHT.positive,
  warningAmber: HORIZON_LIGHT.critical,
  errorRed: HORIZON_LIGHT.negative,
  borderRadius: `${HORIZON_LIGHT.radius}px`,
  spacing: '8px',
  accentBlue: HORIZON_LIGHT.informative,
  pendingGrey: HORIZON_LIGHT.neutral,
};
