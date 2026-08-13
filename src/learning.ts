import { useEffect, useState } from 'react';
import { getApiProxy } from './api';

const DOCS_BASE = 'https://github.tools.sap/cloud-orchestration';

export interface Challenge {
  id: string;
  track: string;
  title: string;
  description: string;
  docsUrl: string;
  xp: number;
}

export const CHALLENGES: Challenge[] = [
  // ── Track 1: Turn landscape into code ────────────────────────────────────
  {
    id: 'first-provider',
    track: 'Turn landscape into code',
    title: 'Install your first Provider',
    description: 'Declare infrastructure in YAML by installing a Crossplane provider on your control plane.',
    docsUrl: DOCS_BASE + '/docs/what-is-iad/learning-path/manifests/phase-1',
    xp: 100,
  },
  {
    id: 'kustomize-templates',
    track: 'Turn landscape into code',
    title: 'Replicate with Kustomize',
    description: 'Eliminate copy-paste across environments using Kustomize overlays to manage variants of your manifests.',
    docsUrl: DOCS_BASE + '/docs/what-is-iad/learning-path/manifests/phase-2',
    xp: 200,
  },
  {
    id: 'gitops-flux',
    track: 'Turn landscape into code',
    title: 'Automate deployments with GitOps',
    description: 'Set up Flux to automatically pull and apply your manifests from a Git repository — no more manual kubectl.',
    docsUrl: DOCS_BASE + '/docs/what-is-iad/learning-path/delivery/phase-3',
    xp: 300,
  },
  // ── Track 2: Use Cases ────────────────────────────────────────────────────
  {
    id: 'kyverno-policy',
    track: 'Use Cases',
    title: 'Secure with Kyverno Policies',
    description: 'Enforce guardrails on your control plane by installing Kyverno and applying your first ClusterPolicy.',
    docsUrl: DOCS_BASE + '/docs/use-cases/advanced/Kyverno',
    xp: 200,
  },
  {
    id: 'secret-rotation',
    track: 'Use Cases',
    title: 'Rotate secrets automatically',
    description: 'Orchestrate a BTP ServiceBinding with key rotation and sync the rolled secret into a Gardener shoot.',
    docsUrl: DOCS_BASE + '/docs/use-cases/secrets/sync-secret',
    xp: 300,
  },
];

export const TOTAL_XP = CHALLENGES.reduce((sum, c) => sum + c.xp, 0);

async function checkChallenge(id: string): Promise<boolean> {
  const api = getApiProxy();
  try {
    switch (id) {
      case 'first-provider': {
        const res = await api.request('/apis/pkg.crossplane.io/v1/providers', { isJSON: true });
        return (res?.items?.length ?? 0) > 0;
      }
      case 'kustomize-templates': {
        const res = await api.request('/apis/kustomize.toolkit.fluxcd.io/v1/kustomizations', { isJSON: true });
        return (res?.items?.length ?? 0) > 0;
      }
      case 'gitops-flux': {
        const res = await api.request('/apis/source.toolkit.fluxcd.io/v1/gitrepositories', { isJSON: true });
        return (res?.items?.length ?? 0) > 0;
      }
      case 'kyverno-policy': {
        const res = await api.request('/apis/kyverno.io/v1/clusterpolicies', { isJSON: true });
        return (res?.items?.length ?? 0) > 0;
      }
      case 'secret-rotation': {
        const res = await api.request('/apis/account.btp.sap.crossplane.io/v1alpha1/servicebindings', { isJSON: true });
        return (res?.items ?? []).some((b: any) => b.spec?.rotation?.frequency);
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export type CompletionMap = Record<string, boolean | null>;

export function useLearningProgress(): CompletionMap {
  const [results, setResults] = useState<CompletionMap>(
    Object.fromEntries(CHALLENGES.map(c => [c.id, null]))
  );

  useEffect(() => {
    CHALLENGES.forEach(c => {
      checkChallenge(c.id).then(done =>
        setResults(prev => ({ ...prev, [c.id]: done }))
      );
    });
  }, []);

  return results;
}
