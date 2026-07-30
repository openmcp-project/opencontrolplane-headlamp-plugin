import { K8s } from '@kinvolk/headlamp-plugin/lib';

export function getApiProxy(): any {
  return (K8s as any).ApiProxy ?? (window as any).pluginLib?.ApiProxy;
}

export async function apiExists(path: string): Promise<boolean> {
  try {
    await getApiProxy().request(path, { isJSON: true });
    return true;
  } catch {
    return false;
  }
}

// Reads a component version from the first Deployment found across the candidate
// paths: prefers the app.kubernetes.io/version label, falls back to the image tag.
export async function fetchDeploymentVersion(paths: string[]): Promise<string | null> {
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

export interface DeploymentCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
}

export interface ClusterEvent {
  type: string;
  reason: string;
  message: string;
  time: string;
  involvedName: string;
}

export interface ComponentDiagnostics {
  namespace: string | null;
  conditions: DeploymentCondition[];
  events: ClusterEvent[];
}

export async function fetchDeploymentConditions(
  paths: string[],
): Promise<{ conditions: DeploymentCondition[]; namespace: string | null }> {
  for (const path of paths) {
    try {
      const res = await getApiProxy().request(path, { isJSON: true });
      const items: any[] = res?.items ?? (res?.kind === 'Deployment' ? [res] : []);
      if (!items.length) continue;
      const d = items[0];
      const conditions: DeploymentCondition[] = (d.status?.conditions ?? []).map((c: any) => ({
        type: String(c.type ?? ''),
        status: String(c.status ?? ''),
        reason: c.reason ? String(c.reason) : undefined,
        message: c.message ? String(c.message) : undefined,
      }));
      return { conditions, namespace: d.metadata?.namespace ?? null };
    } catch {
      // try next candidate
    }
  }
  return { conditions: [], namespace: null };
}

export async function fetchNamespaceWarningEvents(namespace: string, limit = 5): Promise<ClusterEvent[]> {
  try {
    const res = await getApiProxy().request(
      `/api/v1/namespaces/${namespace}/events?fieldSelector=type=Warning`,
      { isJSON: true },
    );
    const items: any[] = res?.items ?? [];
    const events: ClusterEvent[] = items.map((e: any) => ({
      type: String(e.type ?? ''),
      reason: String(e.reason ?? ''),
      message: String(e.message ?? ''),
      time: String(e.lastTimestamp ?? e.eventTime ?? e.metadata?.creationTimestamp ?? ''),
      involvedName: String(e.involvedObject?.name ?? ''),
    }));
    events.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0));
    return events.slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchComponentDiagnostics(versionPaths: string[]): Promise<ComponentDiagnostics> {
  const { conditions, namespace } = await fetchDeploymentConditions(versionPaths);
  const events = namespace ? await fetchNamespaceWarningEvents(namespace) : [];
  return { namespace, conditions, events };
}
