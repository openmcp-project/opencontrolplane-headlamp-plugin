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
