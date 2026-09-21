// ─────────────────────────────────────────────────────────────────────────────
// SAP Fiori Horizon design tokens.
//
// Values are taken verbatim from SAP's `theming-base-content` packages
// (`sap_horizon` = Morning Horizon light, `sap_horizon_dark`). Treat this file
// as the single source of truth for the plugin's look; everything else — the
// Headlamp AppTheme (see appTheme.ts), the injected kiosk CSS, and component
// styles — derives from these tokens.
//
// This module has NO plugin-specific imports so it can be lifted into a shared
// package and reused by any Headlamp plugin unchanged.
// ─────────────────────────────────────────────────────────────────────────────

export interface HorizonTokens {
  /** Emphasized / brand blue (`--sapBrandColor`). */
  brand: string;
  /** Hover state for emphasized buttons. */
  brandHover: string;
  /** Page background (`--sapBackgroundColor`). */
  background: string;
  /** Card / shell surface (`--sapBaseColor` / `--sapShellColor`). */
  surface: string;
  /** Slightly recessed surface for nested / muted areas. */
  surfaceMuted: string;
  /** Primary text (`--sapTextColor`). */
  text: string;
  /** Secondary / label text (`--sapContent_LabelColor`). */
  label: string;
  /** Hairline border / divider color. */
  border: string;

  // Semantic colors (`--sapPositiveColor`, etc.)
  positive: string;
  negative: string;
  critical: string;
  informative: string;
  neutral: string;

  // Sidebar selection (Headlamp AppTheme sidebar.*)
  sidebarSelectedBg: string;
  sidebarSelectedFg: string;

  /** Corner radius in px (`--sapElement_BorderCornerRadius` = .75rem). */
  radius: number;
  /** `72` brand font stack (`--sapFontFamily`). */
  fontFamily: string[];
  /** Elevation shadow (`--sapContent_Shadow0`). */
  shadow: string;
}

const FONT_STACK = ['72', '72full', 'Arial', 'Helvetica', 'sans-serif'];

export const HORIZON_LIGHT: HorizonTokens = {
  brand: '#0070f2',
  brandHover: '#0057c2',
  background: '#f5f6f7',
  surface: '#ffffff',
  surfaceMuted: '#eff1f2',
  text: '#131e29',
  label: '#556b82',
  border: '#d9d9d9',

  positive: '#256f3a',
  negative: '#aa0808',
  critical: '#e76500',
  informative: '#0070f2',
  neutral: '#788fa6',

  sidebarSelectedBg: '#b3d9f7',
  sidebarSelectedFg: '#0a3d6b',

  radius: 12,
  fontFamily: FONT_STACK,
  shadow: '0 0 0.125rem 0 rgba(34,53,72,0.2), 0 0.125rem 0.25rem 0 rgba(34,53,72,0.2)',
};

export const HORIZON_DARK: HorizonTokens = {
  brand: '#0070f2',
  brandHover: '#4db1ff',
  background: '#12171c',
  surface: '#1d232a',
  surfaceMuted: '#242a31',
  text: '#f5f6f7',
  label: '#8396a8',
  border: '#3a4149',

  positive: '#97dd40',
  negative: '#fa6161',
  critical: '#ffdf72',
  informative: '#4db1ff',
  neutral: '#a9b4be',

  sidebarSelectedBg: '#1d2d3e',
  sidebarSelectedFg: '#d1e8ff',

  radius: 12,
  fontFamily: FONT_STACK,
  shadow: '0 0 0.125rem 0 rgba(0,0,0,0.4), 0 0.125rem 0.25rem 0 rgba(0,0,0,0.4)',
};
