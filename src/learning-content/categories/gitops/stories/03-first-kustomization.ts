import type { LearningStory } from '../../../../types';

const DOCS_BASE = 'https://github.tools.sap/cloud-orchestration';

const story: LearningStory = {
  id: 'gitops-first-kustomization',
  categoryId: 'gitops',
  title: 'Deploy with a Kustomization',
  description: 'Create a Flux Kustomization that continuously applies your OCP manifests from Git — with drift correction built in.',
  order: 3,
  dependsOn: ['gitops-add-git-repo'],
  guide: {
    type: 'markdown',
    content: `## Deploy with a Flux Kustomization

A \`Kustomization\` tells Flux which path in your \`GitRepository\` to apply and how often to reconcile. It is the bridge between your Git source and your live cluster state.

> **Official guide:** [Manifests Phase 2](${DOCS_BASE}/docs/what-is-iad/learning-path/manifests/phase-2)

---

### Step 1 — Organise your manifests in Git

Place your BTP Provider, ProviderConfig, and Subaccount YAMLs under a dedicated path in your repo:

\`\`\`
ocp/
  provider-btp.yaml
  provider-config.yaml
  subaccount.yaml
\`\`\`

---

### Step 2 — Create the Kustomization

\`\`\`yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ocp-manifests
  namespace: flux-system
spec:
  interval: 5m       # reconcile every 5 minutes
  path: ./ocp
  prune: true        # delete resources removed from Git
  sourceRef:
    kind: GitRepository
    name: ocp-config
  timeout: 2m
\`\`\`

\`\`\`bash
kubectl apply -f kustomization.yaml
\`\`\`

---

### Step 3 — Watch the first reconciliation

\`\`\`bash
flux get kustomizations --watch
\`\`\`

\`\`\`
NAME           REVISION        READY  MESSAGE
ocp-manifests  main@sha1:abc   True   Applied revision: main@sha1:abc
\`\`\`

---

### Step 4 — Test drift correction

Delete a resource Flux manages:

\`\`\`bash
kubectl delete provider provider-btp
\`\`\`

Within the next reconciliation interval Flux recreates it automatically.

---

### Force an immediate reconcile

\`\`\`bash
flux reconcile kustomization ocp-manifests --with-source
\`\`\`

### Verification

Completed once a \`Kustomization\` resource exists in the cluster.
`,
  },
  verification: [
    {
      apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
      kind: 'Kustomization',
    },
  ],
};

export default story;
