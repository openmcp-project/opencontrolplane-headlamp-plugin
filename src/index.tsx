import React, { useEffect, useState } from 'react';
import {
  registerRoute,
  registerSidebarEntry,
  registerSidebarEntryFilter,
  registerAppBarAction,
  registerAppTheme,
  K8s,
} from '@kinvolk/headlamp-plugin/lib';

const { Chip, Button, Menu, MenuItem } = (window as any).pluginLib?.MuiCore ?? {};

function conditionChip(healthy: boolean | null) {
  const color = healthy === true ? '#4caf50' : healthy === false ? '#f44336' : '#9e9e9e';
  const label = healthy === true ? 'Healthy' : healthy === false ? 'Unhealthy' : '—';
  if (Chip) {
    return React.createElement(Chip, {
      label,
      size: 'small',
      style: { background: color, color: '#fff', fontWeight: 600 },
    });
  }
  return React.createElement('span', {
    style: { padding: '2px 8px', borderRadius: 10, background: color, color: '#fff', fontSize: 11, fontWeight: 600 },
  }, label);
}

// ── Fiori Horizon design tokens ───────────────────────────────────────────────
const FIORI = {
  primaryBlue:        '#0070F2',
  sidebarSelectedBg:  '#b3d9f7',
  sidebarSelectedFg:  '#0a3d6b',
  pageBackground:     '#F5F6F7',
  cardBackground:     '#FFFFFF',
  bodyText:           '#1D2D3E',
  mutedText:          '#6B7280',
  successGreen:       '#107E3E',
  warningAmber:       '#E9730C',
  errorRed:           '#BB0000',
  borderRadius:       '8px',
  spacing:            '8px',
};

// ── Custom theme: Fiori-aligned sidebar highlight ─────────────────────────────
registerAppTheme({
  name: 'ocp',
  sidebar: {
    selectedBackground: FIORI.sidebarSelectedBg,
    selectedColor:      FIORI.sidebarSelectedFg,
  },
});

// ── Sidebar entries to remove completely ──────────────────────────────────────
const HIDDEN_SIDEBAR_ENTRIES = new Set([
  'home',
  'storage',
  'network',
  'gatewayapi',
]);

registerSidebarEntryFilter(entry =>
  HIDDEN_SIDEBAR_ENTRIES.has(entry.name) ? null : entry
);

// ── Remove all app-bar actions ────────────────────────────────────────────────
registerAppBarAction({
  id: 'ocp-strip-appbar-actions',
  processor: () => [],
});

// ── Component detection ───────────────────────────────────────────────────────
//
// Each component is detected by probing its own API on the MCP cluster.
//
// MCP v1 spec.components → probe endpoint:
//   crossplane              → /apis/pkg.crossplane.io/v1/providers
//   flux                    → /apis/kustomize.toolkit.fluxcd.io/v1/kustomizations
//   btpServiceOperator      → /apis/services.cloud.sap.com/v1/servicebindings
//   externalSecretsOperator → /apis/external-secrets.io/v1beta1/externalsecrets
//   kyverno                 → /apis/kyverno.io/v1/policies

function getApiProxy(): any {
  return (K8s as any).ApiProxy ?? (window as any).pluginLib?.ApiProxy;
}

async function apiExists(path: string): Promise<boolean> {
  try {
    await getApiProxy().request(path, { isJSON: true });
    return true;
  } catch {
    return false;
  }
}

// Read an installed component version from its controller Deployment.
// Tries each candidate path in order; for the first Deployment found, reads
// the `app.kubernetes.io/version` label, then falls back to the container
// image tag. Returns null if nothing usable is found on any path.
async function fetchDeploymentVersion(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    try {
      const res = await getApiProxy().request(path, { isJSON: true });
      const items: any[] = res?.items ?? (res?.kind === 'Deployment' ? [res] : []);
      if (!items.length) continue;
      const d = items[0];
      const label =
        d.metadata?.labels?.['app.kubernetes.io/version'] ??
        d.spec?.template?.metadata?.labels?.['app.kubernetes.io/version'];
      if (label) return String(label);
      const img: string = d.spec?.template?.spec?.containers?.[0]?.image ?? '';
      if (img && !img.includes('@')) {
        const tag = img.split(':')[1] ?? '';
        if (tag && tag !== 'latest') return tag;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export interface ComponentStatus {
  name: string;
  label: string;
  installed: boolean | null;
  version: string | null; // null = loading, '—' = unknown/not found
  docsUrl: string;
  phase?: string | null; // install phase (Ready/Progressing/…) pushed by the host; null if unknown
}

interface ComponentConfig {
  name: string;
  label: string;
  probe: string;
  versionPaths: string[];
  docsUrl: string;
}

const COMPONENTS: ComponentConfig[] = [
  {
    name: 'crossplane',
    label: 'Crossplane',
    probe: '/apis/pkg.crossplane.io/v1/providers',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/component=cloud-infrastructure-controller',
      '/apis/apps/v1/namespaces/crossplane-system/deployments?labelSelector=app=crossplane',
    ],
    docsUrl: 'https://docs.crossplane.io/latest/',
  },
  {
    name: 'flux',
    label: 'Flux',
    probe: '/apis/kustomize.toolkit.fluxcd.io/v1/kustomizations',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/part-of=flux',
      '/apis/apps/v1/namespaces/flux-system/deployments?labelSelector=app.kubernetes.io/part-of=flux',
    ],
    docsUrl: 'https://fluxcd.io/flux/',
  },
  {
    name: 'btpServiceOperator',
    label: 'BTP Service Operator',
    probe: '/apis/services.cloud.sap.com/v1/servicebindings',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/name=sap-btp-operator',
      '/apis/apps/v1/namespaces/sap-btp-operator/deployments',
    ],
    docsUrl: 'https://github.com/SAP/sap-btp-service-operator#readme',
  },
  {
    name: 'externalSecretsOperator',
    label: 'External Secrets Operator',
    probe: '/apis/external-secrets.io/v1/externalsecrets',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/name=external-secrets',
      '/apis/apps/v1/namespaces/external-secrets/deployments?labelSelector=app.kubernetes.io/name=external-secrets',
    ],
    docsUrl: 'https://external-secrets.io/latest/',
  },
  {
    name: 'kyverno',
    label: 'Kyverno',
    probe: '/apis/kyverno.io/v1/policies',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/part-of=kyverno',
      '/apis/apps/v1/namespaces/kyverno/deployments?labelSelector=app.kubernetes.io/part-of=kyverno',
    ],
    docsUrl: 'https://kyverno.io/docs/',
  },
  // v2 placeholders — add config entries when needed:
  // { name: 'certManager', label: 'cert-manager', probe: '…', versionPaths: […], docsUrl: '…' },
];

export function useInstalledComponents(): ComponentStatus[] {
  const [installed, setInstalled] = useState<Record<string, boolean | null>>(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null]))
  );
  const [versions, setVersions] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null]))
  );
  // Install phase (status.phase) pushed by the host — the plugin can't read the
  // GraphQL-only component CRs itself. Keyed by component name.
  const [phases, setPhases] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (window.parent === window) return; // not embedded — no host to talk to

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== 'ocp-host' || data.action !== 'componentStatus') return;
      setPhases(data.statuses ?? {});
    };
    // Register before announcing, so we never miss the host's reply.
    window.addEventListener('message', onMessage);
    window.parent.postMessage(
      { source: 'ocp-headlamp-plugin', action: 'statusHandshake' },
      window.location.origin
    );
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    COMPONENTS.forEach((c) => {
      // Existence probe — unchanged behavior.
      apiExists(c.probe).then((ok) =>
        setInstalled((prev) => ({ ...prev, [c.name]: ok }))
      );
      // Version fetch — fully independent; a failure never affects install status.
      // Resolve unknown to '—' so the UI can distinguish loading (null) from not-found.
      fetchDeploymentVersion(c.versionPaths)
        .then((v) => setVersions((prev) => ({ ...prev, [c.name]: v ?? '—' })))
        .catch(() => setVersions((prev) => ({ ...prev, [c.name]: '—' })));
    });
  }, []);

  return COMPONENTS.map((c) => ({
    name: c.name,
    label: c.label,
    installed: installed[c.name],
    version: versions[c.name],
    docsUrl: c.docsUrl,
    phase: phases[c.name] ?? null,
  }));
}

// ── Overview page ─────────────────────────────────────────────────────────────

interface Provider {
  name: string;
  version: string;
  healthy: boolean | null;
}

function useProviders(): { providers: Provider[] | null; error: boolean } {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getApiProxy()
      .request('/apis/pkg.crossplane.io/v1/providers', { isJSON: true })
      .then((res: any) => {
        setProviders(
          (res?.items ?? []).map((item: any) => {
            const conditions: any[] = item.status?.conditions ?? [];
            const healthy = conditions.find((c: any) => c.type === 'Healthy');
            return {
              name: item.metadata?.name ?? '',
              version: item.status?.currentRevision ?? '—',
              healthy: healthy ? healthy.status === 'True' : null,
            };
          })
        );
      })
      .catch(() => setError(true));
  }, []);

  return { providers, error };
}

function phaseColor(phase: string): string {
  switch (phase) {
    case 'Ready':
      return '#4caf50'; // green
    case 'Progressing':
      return '#E9730C'; // amber
    default:
      return '#9e9e9e'; // Terminating / unknown — grey
  }
}

function StatusChip({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  // The host-reported install phase is the authoritative signal: during install
  // the workload CRD may not exist yet (so the ApiProxy probe reports not-installed),
  // but the phase already says 'Progressing'. Prefer phase whenever it's present.
  if (phase) {
    return React.createElement(
      'span',
      {
        style: {
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 12,
          background: phaseColor(phase),
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
        },
      },
      phase
    );
  }
  if (installed === null) {
    return React.createElement('span', { style: { color: '#888', fontSize: 12 } }, 'Loading…');
  }
  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        background: installed ? '#4caf50' : 'rgba(128,128,128,0.2)',
        color: installed ? '#fff' : '#888',
        fontSize: 12,
        fontWeight: 600,
      },
    },
    installed ? 'Installed' : 'Not installed'
  );
}

function HealthChip({ healthy }: { healthy: boolean | null }) {
  return conditionChip(healthy);
}

// Ask the host app (ui-frontend) to open its component-install wizard. The plugin
// runs inside a same-origin iframe; it cannot install a component itself (the
// ManagedControlPlane lives on the Crate cluster, out of the iframe's reach), so
// installation is delegated to the host via postMessage. See host listener in
// ManagedControlPlanePage.tsx.
function requestInstallWizard(componentName: string) {
  if (window.parent === window) return; // not embedded — nothing to notify
  window.parent.postMessage(
    { source: 'ocp-headlamp-plugin', action: 'openInstallWizard', component: componentName },
    window.location.origin
  );
}

// The host app (ui-frontend) embeds this plugin in two different MCP flows with
// different installable component sets. The plugin's own iframe URL is identical
// in both (/api/headlamp/c/...), so we read the host's route from the parent
// window (same-origin; HashRouter → the route lives in the hash).
type Mode = 'v1' | 'v2' | 'unknown';

function detectMode(): Mode {
  try {
    if (window.parent === window) return 'unknown';
    const hash = window.parent.location.hash || '';
    // Both flows render Headlamp inside their control-plane page (no /headlamp
    // segment). V1 route: /managedcontrolplane/<name>. V2 route: /controlplane/<name>.
    // Check V1 first because its path also contains the substring "controlplane".
    if (hash.includes('/managedcontrolplane/')) return 'v1';
    if (hash.includes('/controlplane/')) return 'v2';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// Which components can be installed from Headlamp in each host mode.
// unknown → the V2 (safe intersection) set, so we never offer an install the host can't handle.
const INSTALLABLE_BY_MODE: Record<Mode, Set<string>> = {
  v1: new Set(['crossplane', 'flux', 'btpServiceOperator', 'externalSecretsOperator', 'kyverno']),
  v2: new Set(['crossplane', 'flux', 'externalSecretsOperator']),
  unknown: new Set(['crossplane', 'flux', 'externalSecretsOperator']),
};

function canInstall(componentName: string, mode: Mode): boolean {
  return INSTALLABLE_BY_MODE[mode].has(componentName);
}

function openDocumentation(docsUrl: string) {
  window.open(docsUrl, '_blank', 'noopener,noreferrer');
}

// "Details" dropdown in the Actions column: Install Service (mode-gated) + Open Documentation.
function DetailsMenu({ component }: { component: ComponentStatus }) {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  const items = [
    ...(canInstall(component.name, detectMode())
      ? [{ key: 'install', label: 'Install Service', onClick: () => requestInstallWizard(component.name) }]
      : []),
    { key: 'docs', label: 'Open Documentation', onClick: () => openDocumentation(component.docsUrl) },
  ];

  // MUI is available at runtime via pluginLib; fall back to a native <select>
  // (mirrors the Chip fallback pattern) if it isn't.
  if (Button && Menu && MenuItem) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Button,
        {
          size: 'small',
          variant: 'outlined',
          endIcon: React.createElement('span', { style: { fontSize: 16, lineHeight: 1 } }, '›'),
          onClick: (e: any) => setAnchorEl(e.currentTarget),
        },
        'Details'
      ),
      React.createElement(
        Menu,
        {
          anchorEl,
          open,
          onClose: () => setAnchorEl(null),
        },
        items.map((item) =>
          React.createElement(
            MenuItem,
            {
              key: item.key,
              onClick: () => {
                setAnchorEl(null);
                item.onClick();
              },
            },
            item.label
          )
        )
      )
    );
  }

  // Fallback: native <select> acting as a lightweight dropdown.
  return React.createElement(
    'select',
    {
      style: { fontSize: 13, padding: '2px 6px' },
      value: '',
      onChange: (e: any) => {
        const chosen = items.find((i) => i.key === e.target.value);
        e.target.value = '';
        chosen?.onClick();
      },
    },
    React.createElement('option', { value: '', disabled: true }, 'Details ›'),
    items.map((item) => React.createElement('option', { key: item.key, value: item.key }, item.label))
  );
}

function OverviewPage() {
  const components = useInstalledComponents();
  const { providers, error: providersError } = useProviders();

  const crossplaneInstalled = components.find(c => c.name === 'crossplane')?.installed ?? null;

  const sectionStyle: React.CSSProperties = { marginBottom: 32 };
  const headingStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    borderBottom: '1px solid rgba(128,128,128,0.2)',
    paddingBottom: 8,
  };
  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '8px 12px',
    fontWeight: 600,
    fontSize: 13,
    opacity: 0.6,
    borderBottom: '1px solid rgba(128,128,128,0.15)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(128,128,128,0.1)',
    fontSize: 14,
  };

  return React.createElement(
    'div',
    { style: { padding: 24, maxWidth: 800 } },
    React.createElement('h1', { style: { fontSize: 24, fontWeight: 700, marginBottom: 24 } }, 'Control Plane Overview'),

    // ── Installed Components ────────────────────────────────────────────────
    React.createElement(
      'div',
      { style: sectionStyle },
      React.createElement('div', { style: headingStyle }, 'Components'),
      React.createElement(
        'table',
        { style: tableStyle },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', { style: thStyle }, 'Component'),
            React.createElement('th', { style: thStyle }, 'Status'),
            React.createElement('th', { style: thStyle }, 'Installed versions'),
            React.createElement('th', { style: thStyle }, 'Actions')
          )
        ),
        React.createElement(
          'tbody',
          null,
          components.map((c) =>
            React.createElement(
              'tr',
              { key: c.name },
              React.createElement('td', { style: tdStyle }, c.label),
              React.createElement(
                'td',
                { style: tdStyle },
                React.createElement(StatusChip, { installed: c.installed, phase: c.phase })
              ),
              React.createElement(
                'td',
                { style: { ...tdStyle, fontFamily: 'monospace', fontSize: 13 } },
                c.version === null
                  ? React.createElement(
                      'span',
                      { style: { color: '#888', fontSize: 12, fontFamily: 'inherit' } },
                      'Loading…'
                    )
                  : c.version
              ),
              React.createElement(
                'td',
                { style: tdStyle },
                React.createElement(DetailsMenu, { component: c })
              )
            )
          )
        )
      )
    ),

    // ── Crossplane Providers ────────────────────────────────────────────────
    crossplaneInstalled === false
      ? null
      : React.createElement(
          'div',
          { style: sectionStyle },
          React.createElement('div', { style: headingStyle }, 'Crossplane Providers'),
          providersError
            ? React.createElement('span', { style: { color: '#888', fontSize: 14 } }, 'Crossplane not installed')
            : providers === null
            ? React.createElement('span', { style: { color: '#888', fontSize: 14 } }, 'Loading…')
            : providers.length === 0
            ? React.createElement('span', { style: { color: '#888', fontSize: 14 } }, 'No providers installed')
            : React.createElement(
                'table',
                { style: tableStyle },
                React.createElement(
                  'thead',
                  null,
                  React.createElement(
                    'tr',
                    null,
                    React.createElement('th', { style: thStyle }, 'Name'),
                    React.createElement('th', { style: thStyle }, 'Version'),
                    React.createElement('th', { style: thStyle }, 'Health')
                  )
                ),
                React.createElement(
                  'tbody',
                  null,
                  providers.map((p) =>
                    React.createElement(
                      'tr',
                      { key: p.name },
                      React.createElement('td', { style: tdStyle }, p.name),
                      React.createElement('td', { style: { ...tdStyle, fontFamily: 'monospace', fontSize: 13 } }, p.version),
                      React.createElement('td', { style: tdStyle }, React.createElement(HealthChip, { healthy: p.healthy }))
                    )
                  )
                )
              )
        )
  );
}

// ── Default namespace filter to "default" ─────────────────────────────────────
function forceDefaultNamespace() {
  try {
    const match = window.location.pathname.match(/^\/c\/([^/]+)/);
    const cluster = match ? match[1] : null;
    if (!cluster) return;
    const key = `headlamp-selected-namespace_${cluster}`;
    const saved = localStorage.getItem(key);
    const current: string[] = saved ? JSON.parse(saved) : [];
    if (current.length === 0) {
      localStorage.setItem(key, JSON.stringify(['default']));
    }
  } catch (_) {}
}

// ── Force sidebar into collapsed (icon-only) state ────────────────────────────
function forceSidebarCollapsed() {
  try {
    localStorage.setItem('sidebar', JSON.stringify({ shrink: true }));
  } catch (_) {}

  const tryDispatch = (): boolean => {
    try {
      const pluginLib = (window as any).pluginLib;
      if (!pluginLib) return false;
      const store = pluginLib['redux/stores/store']?.default;
      const sidebarSlice = pluginLib['components/Sidebar/sidebarSlice'];
      if (!store || !sidebarSlice?.setWhetherSidebarOpen) return false;
      store.dispatch(sidebarSlice.setWhetherSidebarOpen(false));
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!tryDispatch()) {
    let attempts = 0;
    const id = setInterval(() => {
      attempts++;
      if (tryDispatch() || attempts >= 20) clearInterval(id);
    }, 100);
  }
}

// ── CSS: kiosk chrome removal + Fiori styling + OCP sidebar ordering ──────────
function applyOCPStyles() {
  const gradient = 'linear-gradient(180deg, transparent 0%, rgba(240,253,250,0.35) 50%, transparent 100%)';
  [document.documentElement, document.body].forEach((el) => {
    el.style.setProperty('background-color', '#ffffff', 'important');
    el.style.setProperty('background-image', gradient, 'important');
    el.style.setProperty('min-height', '100vh', 'important');
  });

  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.style.setProperty('background', 'transparent', 'important');

  const root = document.getElementById('root');
  if (root) root.style.setProperty('background', 'transparent', 'important');

  const styleId = 'kiosk-mode-styles';
  document.getElementById(styleId)?.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* ── Fiori Horizon design tokens ── */
    :root {
      --ocp-primary:   ${FIORI.primaryBlue};
      --ocp-page-bg:   ${FIORI.pageBackground};
      --ocp-card-bg:   ${FIORI.cardBackground};
      --ocp-body-text: ${FIORI.bodyText};
      --ocp-muted:     ${FIORI.mutedText};
      --ocp-success:   ${FIORI.successGreen};
      --ocp-warning:   ${FIORI.warningAmber};
      --ocp-error:     ${FIORI.errorRed};
      --ocp-radius:    ${FIORI.borderRadius};
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
      background-color: ${FIORI.sidebarSelectedBg} !important;
      color: ${FIORI.sidebarSelectedFg} !important;
    }
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"] [class*="MuiListItemText-primary"],
    nav [class*="MuiListItemButton-root"][class*="Mui-selected"] [class*="MuiSvgIcon-root"] {
      color: ${FIORI.sidebarSelectedFg} !important;
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

    /* ── Hide "Create / Apply" button ── */
    button[aria-label="Create / Apply"],
    button[aria-label="Create/Apply"] {
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
  `;

  document.head.appendChild(style);

  // Belt-and-suspenders: imperatively suppress any alerts that win specificity
  document.querySelectorAll('[role="alert"], [class*="MuiAlert-root"]').forEach((el) => {
    (el as HTMLElement).style.setProperty('display', 'none', 'important');
  });

  // Suppress text-matched cluster-error banners inside <main>
  const main = document.querySelector('main');
  if (main) {
    Array.from(main.children).forEach((el) => {
      const text = (el as HTMLElement).textContent || '';
      if (text.includes('Something went wrong') || text.includes('Lost connection')) {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      }
    });
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  forceSidebarCollapsed();
  forceDefaultNamespace();
  applyOCPStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOCPStyles);
  }

  // Re-apply after React hydration and lazy chunk loads
  setTimeout(applyOCPStyles, 100);
  setTimeout(applyOCPStyles, 500);
  setTimeout(applyOCPStyles, 1500);

  // Re-apply on every SPA navigation
  const observer = new MutationObserver(applyOCPStyles);
  observer.observe(document.body, { childList: true, subtree: true });

  // Re-collapse sidebar on every navigation so the user can't expand it
  window.addEventListener('popstate', forceSidebarCollapsed);
}

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
