// Maps Horizon design tokens onto Headlamp's AppTheme interface. Registering the
// result via `registerAppTheme` themes ALL of Headlamp — every plugin and every
// built-in view — not just this plugin's routes.
//
// Headlamp's AppTheme has no success/warning/error slots; those semantic colors
// live in the token layer (see status.ts). Anything not set here is derived by
// Headlamp from the surrounding MUI palette.

import { HorizonTokens } from './horizon';

// Mirrors @kinvolk/headlamp-plugin's AppTheme shape (kept local to avoid a hard
// dependency on the host's exported type across versions).
export interface AppTheme {
  name: string;
  base?: 'light' | 'dark';
  primary?: string;
  secondary?: string;
  text?: { primary?: string };
  link?: { color?: string };
  background?: { default?: string; surface?: string; muted?: string };
  sidebar?: {
    background?: string;
    color?: string;
    selectedBackground?: string;
    selectedColor?: string;
    actionBackground?: string;
  };
  navbar?: { background?: string; color?: string };
  radius?: number;
  buttonTextTransform?: 'uppercase' | 'none';
  fontFamily?: string[];
}

export function buildAppTheme(name: string, tokens: HorizonTokens, base: 'light' | 'dark'): AppTheme {
  return {
    name,
    base,
    primary: tokens.brand,
    text: { primary: tokens.text },
    link: { color: tokens.informative },
    background: {
      default: tokens.background,
      surface: tokens.surface,
      muted: tokens.surfaceMuted,
    },
    sidebar: {
      background: tokens.surface,
      color: tokens.text,
      selectedBackground: tokens.sidebarSelectedBg,
      selectedColor: tokens.sidebarSelectedFg,
      actionBackground: tokens.brand,
    },
    navbar: { background: tokens.surface, color: tokens.text },
    radius: tokens.radius,
    // Horizon buttons use sentence case, not MUI's default UPPERCASE.
    buttonTextTransform: 'none',
    fontFamily: tokens.fontFamily,
  };
}
