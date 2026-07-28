import { useEffect, useState } from 'react';
import { getApiProxy } from './api';

export interface Provider {
  name: string;
  version: string;
  healthy: boolean | null;
}

export function useProviders(): { providers: Provider[] | null; error: boolean } {
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
          }),
        );
      })
      .catch(() => setError(true));
  }, []);

  return { providers, error };
}
