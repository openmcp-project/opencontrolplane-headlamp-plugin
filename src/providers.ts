import { K8s } from '@kinvolk/headlamp-plugin/lib';

const makeKubeObject: (name: string) => any =
  (K8s as any).makeKubeObject ?? (() => Object.getPrototypeOf(K8s.ResourceClasses.CustomResourceDefinition));

class ProviderResource extends makeKubeObject('Provider') {
  static apiVersion = 'pkg.crossplane.io/v1';
  static kind = 'Provider';
  static apiName = 'providers';
  static isNamespaced = false;
}

export interface Provider {
  name: string;
  version: string;
  healthy: boolean | null;
}

export function useProviders(): { providers: Provider[] | null; error: boolean } {
  const [items, error] = ProviderResource.useList();

  const providers = items
    ? items.map((item: any) => {
        const conditions: any[] = item.jsonData?.status?.conditions ?? [];
        const healthy = conditions.find((c: any) => c.type === 'Healthy');
        return {
          name: item.metadata?.name ?? '',
          version: item.jsonData?.status?.currentRevision ?? '—',
          healthy: healthy ? healthy.status === 'True' : null,
        };
      })
    : null;

  return { providers, error: !!error };
}
