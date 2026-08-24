import { registerSidebarEntry, registerSidebarEntryFilter } from '@kinvolk/headlamp-plugin/lib';
import { apiExists } from './api';
import { COMPONENTS } from './config';

export const GATED_TABS: Record<string, string> = {
  crossplane: 'crossplane',
  flux: 'flux',
};

const PROBE_INTERVAL_MS = 20_000;

const installed = new Set<string>();

type SidebarEntry = { name?: string };

const entryNameToComponent: Record<string, string> = Object.fromEntries(
  Object.entries(GATED_TABS).map(([component, entryName]) => [entryName, component]),
);

export function gateEntry<T extends SidebarEntry>(entry: T): T | null {
  const component = entry.name ? entryNameToComponent[entry.name] : undefined;
  if (!component) return entry;
  return installed.has(component) ? entry : null;
}

// Re-register our own entry (keyed by name, so it overwrites rather than duplicates). This
// changes redux state.sidebar.entries, forcing Headlamp's sidebar memo to recompute and
// re-run the filter against the updated set.
function bumpSidebar() {
  registerSidebarEntry({
    parent: null,
    name: 'ocp-overview',
    label: 'Overview',
    url: '/ocp/overview',
    icon: 'mdi:view-dashboard-outline',
  });
}

export async function probeCycle() {
  const confirmed = await Promise.all(
    Object.keys(GATED_TABS).map(async (component) => {
      const cfg = COMPONENTS.find((c) => c.name === component);
      if (!cfg) return { component, ok: false };
      const ok = await apiExists(cfg.probe);
      return { component, ok };
    }),
  );

  let changed = false;
  for (const { component, ok } of confirmed) {
    if (ok && !installed.has(component)) {
      installed.add(component);
      changed = true;
    } else if (!ok && installed.has(component)) {
      installed.delete(component);
      changed = true;
    }
  }
  if (changed) bumpSidebar();
}

export function startSidebarGating(): () => void {
  registerSidebarEntryFilter((entry) => gateEntry(entry));
  void probeCycle();
  const timer = setInterval(() => void probeCycle(), PROBE_INTERVAL_MS);
  return () => clearInterval(timer);
}

export function __resetForTests() {
  installed.clear();
}
