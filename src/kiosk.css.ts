import { HORIZON_LIGHT } from './theme';
import type { ColorScheme } from './kiosk';

// Kiosk chrome: purely STRUCTURAL overrides (hide the app bar, reclaim layout,
// remove built-in entries, suppress error banners, order the sidebar). All COLOR
// now comes from the registered Horizon AppTheme (see index.tsx) so both light
// and dark modes are handled by a single source of truth — this CSS deliberately
// sets no palette values, otherwise it would fight the theme and break dark mode.
export function kioskCss(_scheme: ColorScheme = 'light'): string {
  return `
    :root {
      --ocp-radius: ${HORIZON_LIGHT.radius}px;
    }

    /* ── Hide the Headlamp AppBar (top bar with logo, search, user) ── */
    header[class*="MuiAppBar"],
    nav[class*="MuiAppBar"],
    [class*="MuiAppBar-root"],
    nav[aria-label="Appbar Tools"] {
      display: none !important;
    }

    /* ── Remove AppBar top-padding; make root a plain flex row ── */
    #root > div[class*="MuiBox"] {
      padding-top: 0 !important;
      flex-direction: row !important;
    }

    /* ── Main content fills the viewport ── */
    main {
      margin-left: 0 !important;
      padding: 16px !important;
      width: 100% !important;
      max-width: 100% !important;
      flex: 1 !important;
      background-color: transparent !important;
    }

    /* ── Strip MUI box backgrounds so the theme page background shows through ── */
    #root > div[class*="MuiBox"],
    #root > div[class*="MuiBox"] > div[class*="MuiBox"] {
      background-color: transparent !important;
    }

    /* ── Hide specific built-in sidebar entries by aria-label ── */
    nav a[aria-label="Storage"],
    nav a[aria-label="Network"],
    nav a[aria-label="Gateway (beta)"] {
      display: none !important;
    }

    /* ── Hide all alerts / error banners ── */
    [role="alert"],
    [class*="MuiAlert-root"],
    [class*="MuiAlert-standard"],
    [class*="MuiAlert-filled"],
    [class*="MuiAlert-outlined"],
    [class*="clusterError"],
    [class*="ClusterGroupError"] {
      display: none !important;
    }

    /* ── Hide structural cluster-error box inside <main> ── */
    main > [class*="MuiBox-root"]:not(:has([class*="MuiPaper"])):not(:has(h1)):not(:has(table)):not(:has(nav)) {
      display: none !important;
    }

    /* ── Card radius follows the Horizon corner radius ── */
    [class*="MuiPaper-root"][class*="MuiCard-root"],
    [class*="MuiPaper-elevation"] {
      border-radius: var(--ocp-radius) !important;
    }

    /* ── Hide "Create" buttons in sidebar — language-independent MUI class selectors ── */
    /* Expanded sidebar: text button */
    [class*="MuiDrawer-paper"] button[class*="MuiButton-textSecondary"][class*="MuiButton-sizeLarge"],
    /* Collapsed sidebar: icon button */
    [class*="MuiDrawer-paper"] button[class*="MuiIconButton-colorPrimary"][class*="MuiIconButton-sizeMedium"] {
      display: none !important;
    }

    /* ── OCP sidebar ordering: Overview → Crossplane → Flux → rest ── */
    ul.MuiList-padding {
      display: flex !important;
      flex-direction: column !important;
    }
    ul.MuiList-padding > li:has(a[href*="/ocp/overview"]) { order: -300 !important; }
    ul.MuiList-padding > li:has(a[href*="/crossplane"])   { order: -200 !important; }
    ul.MuiList-padding > li:has(a[href*="/flux"])         { order: -100 !important; }

    /* OCP Overview icon slightly larger than default 24px */
    ul.MuiList-padding > li:has(a[href*="/ocp/overview"]) svg {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
    }
    ul.MuiList-padding > li:has(a[href*="/ocp/overview"]) [class*="MuiListItemIcon"] {
      min-width: unset !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-left: -2px !important;
    }

    ul.MuiList-padding > li:has(a[href$="/c/main/"]) {
      border-top: 1px solid rgba(128,128,128,0.3) !important;
      margin-top: 4px !important;
      padding-top: 4px !important;
    }

    /* ── Tooltip: replace Headlamp's heavy dark tooltip with SAP Horizon popover style ── */
    /* Rendered in a portal at <body> end — no drawer scope needed */
    .MuiTooltip-tooltip {
      background-color: #ffffff !important;
      color: #131e29 !important;
      border: 1px solid #d9d9d9 !important;
      border-radius: 0.5rem !important;
      box-shadow: 0 0 0 0.0625rem rgba(34,53,72,0.12), 0 0.125rem 0.5rem 0 rgba(34,53,72,0.18) !important;
      font-size: 0.75rem !important;
      font-weight: 400 !important;
      padding: 0.375rem 0.625rem !important;
      max-width: 18rem !important;
    }
    .MuiTooltip-arrow {
      color: #ffffff !important;
    }
    .MuiTooltip-arrow::before {
      border: 1px solid #d9d9d9 !important;
    }

    @media (prefers-color-scheme: dark) {
      .MuiTooltip-tooltip {
        background-color: #1d232a !important;
        color: #f5f6f7 !important;
        border-color: #3a4149 !important;
        box-shadow: 0 0 0.125rem 0 rgba(0,0,0,0.4), 0 0.125rem 0.5rem 0 rgba(0,0,0,0.35) !important;
      }
      .MuiTooltip-arrow {
        color: #1d232a !important;
      }
      .MuiTooltip-arrow::before {
        border-color: #3a4149 !important;
      }
    }

    /* ── Sidebar selected-item indicator: override Headlamp's default yellow ── */
    /* Light mode (default) */
    [class*="MuiDrawer-paper"] .MuiListItemButton-root.Mui-selected {
      background: #b3d9f7 !important;
      color: #0a3d6b !important;
    }
    [class*="MuiDrawer-paper"] .MuiListItemButton-root.Mui-selected:hover {
      background-color: rgba(179, 217, 247, 0.85) !important;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      [class*="MuiDrawer-paper"] .MuiListItemButton-root.Mui-selected {
        background: #1d2d3e !important;
        color: #d1e8ff !important;
      }
      [class*="MuiDrawer-paper"] .MuiListItemButton-root.Mui-selected:hover {
        background-color: rgba(29, 45, 62, 0.85) !important;
      }
    }
  `;
}
