import { INSTALLABLE_BY_MODE, Mode } from './config';

// Bridge between the plugin (inside the Headlamp iframe) and the ui-frontend host.
// The plugin can't install a component itself (the CR lives on the host's Crate
// cluster, out of the iframe's reach); it asks the host to open its install wizard.
export function requestInstallWizard(componentName: string) {
  if (window.parent === window) return; // not embedded
  window.parent.postMessage(
    { source: 'ocp-headlamp-plugin', action: 'openInstallWizard', component: componentName },
    window.location.origin,
  );
}

// The host embeds this plugin in both the V1 and V2 flows with different installable
// sets; the iframe URL is identical, so detect the flow from the parent route (hash).
export function detectMode(): Mode {
  try {
    if (window.parent === window) return 'unknown';
    const hash = window.parent.location.hash || '';
    // Check V1 first: its /managedcontrolplane/ path also contains "controlplane".
    if (hash.includes('/managedcontrolplane/')) return 'v1';
    if (hash.includes('/controlplane/')) return 'v2';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function canInstall(componentName: string, mode: Mode): boolean {
  return INSTALLABLE_BY_MODE[mode].has(componentName);
}

export function openDocumentation(docsUrl: string) {
  window.open(docsUrl, '_blank', 'noopener,noreferrer');
}

export interface HostContext {
  project: string | null;
  workspace: string | null;
  controlPlane: string | null;
}

export function getHostContext(): HostContext {
  try {
    if (window.parent === window) return { project: null, workspace: null, controlPlane: null };
    const hash = window.parent.location.hash || '';
    // Both V1 (#/.../managedcontrolplane/:cp) and V2 (#/.../controlplane/:cp) share the same structure.
    const match = hash.match(/\/projects\/([^/]+)\/workspaces\/([^/]+)\/(?:managedcontrolplane|controlplane)\/([^/?#]+)/);
    if (!match) return { project: null, workspace: null, controlPlane: null };
    return {
      project: decodeURIComponent(match[1]),
      workspace: decodeURIComponent(match[2]),
      controlPlane: decodeURIComponent(match[3]),
    };
  } catch {
    return { project: null, workspace: null, controlPlane: null };
  }
}

const SUPPORT_REPO = 'https://github.tools.sap/openmcp/support';

export function openSupportIssue(
  components: { label: string; version: string | null; installed: boolean | null; phase?: string | null }[],
  mode: Mode,
  landscape: string | null,
) {
  const { project, workspace, controlPlane } = getHostContext();

  const clusterLink = [project, workspace, controlPlane].filter(Boolean).join('/');
  const apiVersion = mode === 'v1' ? '/apiVersion/ManagedControlPlane' : mode === 'v2' ? '/apiVersion/ControlPlane' : '';

  const title = clusterLink ? `[${clusterLink}]: ` : '';

  const rows = components
    .map((c) => {
      const status = c.phase ?? (c.installed === true ? 'Installed' : c.installed === false ? 'Not installed' : 'Loading');
      const version = c.version && c.version !== '—' ? c.version : 'unknown';
      return `| ${c.label} | ${version} | ${status} |`;
    })
    .join('\n');

  const additionalInfo = [
    landscape ? `**Landscape:** ${landscape}` : null,
    `**Component versions:**\n\n| Component | Version | Status |\n|-----------|---------|--------|\n${rows}`,
  ].filter(Boolean).join('\n\n');

  const landscapeOption: Record<string, string> = {
    LIVE: '/landscape/SAP/live',
    CANARY: '/landscape/SAP/canary',
    STAGING: '/landscape/SAP/canary',
    DEV: '/landscape/SAP/canary',
    LOCAL: '/landscape/SAP/canary',
  };
  const mappedLandscape = landscape ? (landscapeOption[landscape.toUpperCase()] ?? null) : null;

  const params = new URLSearchParams({
    template: '1-mcp_issue.yml',
    title,
    ...(clusterLink && { 'cluster-link': clusterLink }),
    ...(apiVersion && { 'api-version': apiVersion }),
    ...(mappedLandscape && { landscape: mappedLandscape }),
    'additional-info': additionalInfo,
  });

  window.open(`${SUPPORT_REPO}/issues/new?${params.toString()}`, '_blank', 'noopener,noreferrer');
}
