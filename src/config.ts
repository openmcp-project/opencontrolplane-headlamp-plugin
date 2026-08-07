export interface ComponentConfig {
  name: string;
  label: string;
  probe: string;
  versionPaths: string[];
  docsUrl: string;
}

export const COMPONENTS: ComponentConfig[] = [
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
  {
    name: 'metricsOperator',
    label: 'Metrics Operator',
    probe: '/apis/metrics.services.open-control-plane.io/v1alpha1/metricsoperators',
    versionPaths: [
      '/apis/apps/v1/deployments?labelSelector=app.kubernetes.io/name=metrics-operator',
      '/apis/apps/v1/namespaces/metrics-operator/deployments',
    ],
    docsUrl: 'https://github.com/openmcp-project/service-provider-metrics-operator#readme',
  },
];

export type Mode = 'v1' | 'v2' | 'unknown';

export const INSTALLABLE_BY_MODE: Record<Mode, Set<string>> = {
  v1: new Set(['crossplane', 'flux', 'btpServiceOperator', 'externalSecretsOperator', 'kyverno']),
  v2: new Set(['crossplane', 'flux', 'externalSecretsOperator', 'metricsOperator']),
  unknown: new Set(['crossplane', 'flux', 'externalSecretsOperator', 'metricsOperator']),
};
