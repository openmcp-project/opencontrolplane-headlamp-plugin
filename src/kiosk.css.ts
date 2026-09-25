import { FIORI, FIORI_DARK } from './theme';
import type { ColorScheme } from './kiosk';

export function kioskCss(scheme: ColorScheme = 'light'): string {
  const t: typeof FIORI = scheme === 'dark' ? FIORI_DARK : FIORI;
  return `
    /* ── Fiori Horizon design tokens ── */
    :root {
      --ocp-primary:   ${t.primaryBlue};
      --ocp-page-bg:   ${t.pageBackground};
      --ocp-card-bg:   ${t.cardBackground};
      --ocp-body-text: ${t.bodyText};
      --ocp-muted:     ${t.mutedText};
      --ocp-success:   ${t.successGreen};
      --ocp-warning:   ${t.warningAmber};
      --ocp-error:     ${t.errorRed};
      --ocp-radius:    ${t.borderRadius};
    }

    /* ── Page & body background ── */
    /* Applied imperatively in JS to beat MUI CssBaseline */

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

    /* ── Strip MUI box backgrounds so gradient shows through ── */
    #root > div[class*="MuiBox"],
    #root > div[class*="MuiBox"] > div[class*="MuiBox"] {
      background-color: transparent !important;
    }

    /* ── Sidebar selected-item highlight (Fiori blue) ── */
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"],
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"]:hover {
      background-color: ${t.sidebarSelectedBg} !important;
      color: ${t.sidebarSelectedFg} !important;
    }
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"] [class*="MuiListItemText-primary"],
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"] [class*="MuiSvgIcon-root"] {
      color: ${t.sidebarSelectedFg} !important;
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

    /* ── Fiori-aligned card radius & background ── */
    [class*="MuiPaper-root"][class*="MuiCard-root"],
    [class*="MuiPaper-elevation"] {
      border-radius: var(--ocp-radius) !important;
      background-color: var(--ocp-card-bg) !important;
    }

    /* ── Body text colour ── */
    body, [class*="MuiTypography-body"] {
      color: var(--ocp-body-text) !important;
    }

    /* ── Primary buttons ── */
    [class*="MuiButton-containedPrimary"] {
      background-color: var(--ocp-primary) !important;
      border-radius: 4px !important;
    }
    [class*="MuiButton-containedPrimary"]:hover {
      background-color: #0057C2 !important;
    }

    /* ── Links ── */
    a:not([class*="MuiButton"]) {
      color: var(--ocp-primary) !important;
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

    ul.MuiList-padding > li:has(a[href$="/c/main/"]) {
      border-top: 1px solid rgba(128,128,128,0.3) !important;
      margin-top: 4px !important;
      padding-top: 4px !important;
    }

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
      margin-left: -5px !important;
    }
  `;
}
