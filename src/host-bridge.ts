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
