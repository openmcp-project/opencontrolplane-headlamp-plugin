import { useEffect, useState } from 'react';
import { apiExists, fetchDeploymentVersion } from './api';

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
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null])),
  );
  const [versions, setVersions] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null])),
  );
  // Install phase pushed by the host, keyed by component name.
  const [phases, setPhases] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (window.parent === window) return; // not embedded

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== 'ocp-host' || data.action !== 'componentStatus') return;
      setPhases(data.statuses ?? {});
    };
    // Listen before announcing so we don't miss the host's reply.
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ source: 'ocp-headlamp-plugin', action: 'statusHandshake' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    COMPONENTS.forEach((c) => {
      apiExists(c.probe).then((ok) => setInstalled((prev) => ({ ...prev, [c.name]: ok })));
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
