import {
  registerRoute,
  registerSidebarEntry,
  registerSidebarEntryFilter,
  registerAppBarAction,
  registerAppTheme,
} from '@kinvolk/headlamp-plugin/lib';
import { useEffect } from 'react';
import { buildAppTheme, HORIZON_LIGHT, HORIZON_DARK } from './theme';
import { OverviewPage } from './OverviewPage';
import { applyOCPStyles, forceDefaultNamespace, forceSidebarCollapsed, subscribeColorScheme } from './kiosk';
import { startSidebarGating } from './sidebarGating';
import { ocpIcon } from './ocpIcon';

// ── App themes: full SAP Fiori Horizon mapping (light + dark) ─────────────────
// `registerAppTheme` themes ALL of Headlamp — every plugin and built-in view, not
// just this plugin's routes — so selecting one of these repaints the entire app.
registerAppTheme(buildAppTheme('ocp-horizon', HORIZON_LIGHT, 'light'));
registerAppTheme(buildAppTheme('ocp-horizon-dark', HORIZON_DARK, 'dark'));

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

// Redirect the cluster root to the OCP overview page.
function ClusterRootRedirect() {
  useEffect(() => {
    const match = window.location.pathname.match(/^(\/c\/[^/]+)/);
    const clusterPrefix = match ? match[1] : '';
    window.location.replace(`${clusterPrefix}/ocp/overview`);
  }, []);
  return null;
}

registerRoute({
  path: '/',
  sidebar: null,
  name: 'ocpClusterRootRedirect',
  exact: true,
  useClusterURL: true,
  component: ClusterRootRedirect,
});

// ── Bootstrap: kiosk chrome + re-apply on navigation ──────────────────────────
if (typeof window !== 'undefined') {
  forceSidebarCollapsed();
  forceDefaultNamespace();
  applyOCPStyles();

  startSidebarGating();

  // Re-inject kiosk styles (light/dark) when the OS color scheme changes.
  subscribeColorScheme(applyOCPStyles);

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
