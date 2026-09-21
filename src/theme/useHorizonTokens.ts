// Resolves the active Horizon token set from Headlamp's live MUI theme mode.
//
// Headlamp is MUI-based and exposes its React/MUI runtime on `window.pluginLib`.
// We read the host theme's `palette.mode` so the plugin's hand-drawn pages
// follow the same light/dark switch as the rest of the app, without taking a
// build-time dependency on the host's MUI version.

import { HORIZON_LIGHT, HORIZON_DARK, HorizonTokens } from './horizon';

/** Read the host MUI palette mode ('light' | 'dark'), defaulting to light. */
export function useHorizonTokens(): HorizonTokens {
  const useTheme = (window as any).pluginLib?.MuiCore?.useTheme;
  const mode = typeof useTheme === 'function' ? useTheme()?.palette?.mode : undefined;
  return mode === 'dark' ? HORIZON_DARK : HORIZON_LIGHT;
}
