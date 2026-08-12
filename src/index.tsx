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
  icon: 'mdi:view-dashboard-outline',
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
