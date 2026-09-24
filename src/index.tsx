import {
  registerRoute,
  registerSidebarEntry,
  registerSidebarEntryFilter,
  registerAppBarAction,
  registerAppTheme,
} from '@kinvolk/headlamp-plugin/lib';
import { FIORI } from './theme';
import { OverviewPage } from './OverviewPage';
import { applyOCPStyles, forceDefaultNamespace, forceSidebarCollapsed } from './kiosk';
import { startSidebarGating } from './sidebarGating';
const ocpIcon = {
  body: '<g transform="translate(0.000000,100.000000) scale(0.038462,-0.038314)" fill="currentColor" stroke="none"><path d="M1520 2323 c-52 -19 -169 -62 -260 -95 -284 -103 -304 -111 -327 -134 -27 -27 -28 -37 -7 -58 32 -33 29 -34 414 166 202 106 264 139 275 149 12 12 13 12 -95 -28z"/> <path d="M729 2051 c-42 -14 -77 -41 -100 -78 -12 -19 -20 -35 -18 -37 4 -4 286 -187 307 -200 21 -13 66 97 59 145 -13 95 -83 166 -172 174 -28 2 -62 1 -76 -4z m157 -46 c19 -14 42 -40 51 -58 18 -35 23 -131 8 -146 -12 -12 -286 168 -282 184 2 6 23 20 47 33 58 30 126 25 176 -13z"/> <path d="M1678 2050 c-111 -33 -165 -170 -110 -277 12 -24 24 -43 27 -43 14 0 311 204 313 216 2 7 -15 31 -37 53 -55 54 -123 72 -193 51z m152 -40 c17 -12 30 -24 30 -28 -1 -6 -151 -111 -251 -175 l-28 -18 -12 40 c-10 33 -10 50 1 84 13 46 75 112 112 120 44 10 119 -2 148 -23z"/> <path d="M445 1810 c-31 -61 -55 -121 -53 -133 2 -16 13 -24 43 -30 22 -6 41 -11 43 -12 2 -2 -20 -57 -47 -124 -28 -66 -51 -123 -51 -127 0 -3 107 -141 238 -307 l237 -302 5 -295 5 -295 395 0 395 0 5 295 5 295 209 265 c115 146 223 282 239 304 l30 38 -53 131 c-46 112 -51 132 -38 141 23 17 19 48 -6 43 -12 -3 -108 -22 -215 -43 l-195 -38 -15 24 c-9 13 -24 33 -33 44 -18 20 -18 21 -33 2 -12 -16 -12 -23 5 -55 27 -55 43 -64 92 -57 40 6 44 4 66 -27 12 -18 22 -40 22 -48 0 -8 -38 -70 -85 -136 -72 -102 -85 -127 -85 -161 0 -75 -13 -167 -20 -146 -4 10 -42 38 -84 61 -62 35 -80 41 -100 33 -13 -5 -27 -6 -32 -2 -4 4 -4 1 0 -5 5 -9 0 -13 -13 -13 -12 0 -21 -7 -21 -15 0 -19 -4 -19 -40 0 -19 10 -31 11 -35 4 -12 -19 16 -67 46 -79 16 -7 29 -15 29 -19 -2 -33 -39 -162 -43 -151 -11 27 -37 151 -37 175 0 36 -13 38 -81 10 -66 -26 -86 -32 -56 -14 17 10 11 16 -45 49 -62 38 -63 38 -70 17 -3 -12 -6 10 -7 49 l-1 71 -71 104 c-40 57 -80 115 -90 128 -11 13 -19 31 -19 41 0 25 38 70 60 70 11 0 24 9 30 20 14 27 9 29 -235 75 -110 21 -203 41 -208 45 -4 3 11 42 34 86 50 97 61 124 50 124 -5 0 -35 -50 -66 -110z m839 -1156 c24 -23 9 -36 -19 -18 -14 9 -22 20 -19 25 8 13 21 11 38 -7z m4 -157 c3 -15 0 -16 -22 -6 -32 15 -34 32 -4 27 13 -2 24 -11 26 -21z m2 -147 c0 -20 -1 -20 -25 -4 -14 9 -25 18 -25 20 0 2 11 4 25 4 18 0 25 -5 25 -20z"/> <path d="M1120 1785 c-98 -30 -165 -121 -181 -243 -15 -122 -13 -137 24 -153 23 -10 35 -25 45 -54 21 -63 90 -126 170 -153 51 -18 37 4 -21 31 -67 30 -112 75 -129 129 -10 32 -22 47 -46 58 l-33 15 7 85 c8 107 34 169 91 220 100 88 281 73 348 -28 14 -21 30 -65 36 -97 14 -74 6 -231 -16 -303 -19 -64 -14 -92 8 -40 41 96 47 319 12 404 -48 116 -181 170 -315 129z"/> <path d="M474 1755 c-4 -9 -2 -21 4 -27 15 -15 44 -1 40 19 -4 23 -36 29 -44 8z"/> <path d="M1994 1755 c-8 -20 4 -35 27 -35 14 0 19 7 19 25 0 18 -5 25 -20 25 -11 0 -23 -7 -26 -15z"/></g>',
  width: 100,
  height: 100,
};


// ── Custom theme: Fiori-aligned sidebar highlight ─────────────────────────────
registerAppTheme({
  name: 'ocp',
  sidebar: {
    selectedBackground: FIORI.sidebarSelectedBg,
    selectedColor: FIORI.sidebarSelectedFg,
  },
});

// ── Sidebar entries to remove completely ──────────────────────────────────────
const HIDDEN_SIDEBAR_ENTRIES = new Set(['home', 'storage', 'network', 'gatewayapi']);
registerSidebarEntryFilter((entry) => (HIDDEN_SIDEBAR_ENTRIES.has(entry.name) ? null : entry));

// ── Remove all app-bar actions ────────────────────────────────────────────────
registerAppBarAction({
  id: 'ocp-strip-appbar-actions',
  processor: () => [],
});

// ── OCP: sidebar entry + route ────────────────────────────────────────────────
registerSidebarEntry({
  parent: null,
  name: 'ocp-overview',
  label: 'Overview',
  url: '/ocp/overview',
  icon: ocpIcon,
});

registerRoute({
  path: '/ocp/overview',
  sidebar: 'ocp-overview',
  name: 'ocpOverview',
  exact: true,
  component: OverviewPage,
});

// ── Bootstrap: kiosk chrome + re-apply on navigation ──────────────────────────
if (typeof window !== 'undefined') {
  forceSidebarCollapsed();
  forceDefaultNamespace();
  applyOCPStyles();

  startSidebarGating();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOCPStyles);
  }

  // Re-apply after React hydration and lazy chunk loads.
  setTimeout(applyOCPStyles, 100);
  setTimeout(applyOCPStyles, 500);
  setTimeout(applyOCPStyles, 1500);

  // Re-apply on every SPA navigation.
  const observer = new MutationObserver(applyOCPStyles);
  observer.observe(document.body, { childList: true, subtree: true });

  // Re-collapse sidebar on every navigation so the user can't expand it.
  window.addEventListener('popstate', forceSidebarCollapsed);
}
