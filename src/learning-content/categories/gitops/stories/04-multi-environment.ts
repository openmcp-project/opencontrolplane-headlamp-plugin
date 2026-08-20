import type { LearningStory } from '../../../../types';

const DOCS_BASE = 'https://github.tools.sap/cloud-orchestration';

const story: LearningStory = {
  id: 'gitops-multi-environment',
  categoryId: 'gitops',
  title: 'Template Across Environments',
  description: 'Use Kustomize overlays to maintain dev, staging, and production variants of your OCP config from a single base.',
  order: 4,
  dependsOn: ['gitops-first-kustomization'],
  guide: {
    type: 'markdown',
    content: `## Template Across Environments

Most teams have nearly identical configs across environments but with small differences — region, subdomain, resource names. Kustomize overlays let you define a base once and patch only what changes per environment.

> **Official guide:** [Manifests Phase 2](${DOCS_BASE}/docs/what-is-iad/learning-path/manifests/phase-2)

---

### Repository structure

\`\`\`
ocp/
  base/
    kustomization.yaml
    subaccount.yaml
    provider-config.yaml
  overlays/
    dev/
      kustomization.yaml
      subaccount-patch.yaml
    prod/
      kustomization.yaml
      subaccount-patch.yaml
\`\`\`

---

### Step 1 — Create the base

\`\`\`yaml
# ocp/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - subaccount.yaml
  - provider-config.yaml
\`\`\`

\`\`\`yaml
# ocp/base/subaccount.yaml
apiVersion: account.btp.sap.crossplane.io/v1alpha1
kind: Subaccount
metadata:
  name: ocp-subaccount
spec:
  forProvider:
    displayName: OCP Subaccount
    region: eu10
    subdomain: ocp-placeholder
  providerConfigRef:
    name: default
\`\`\`

---

### Step 2 — Create overlays

\`\`\`yaml
# ocp/overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - path: subaccount-patch.yaml
\`\`\`

\`\`\`yaml
# ocp/overlays/dev/subaccount-patch.yaml
apiVersion: account.btp.sap.crossplane.io/v1alpha1
kind: Subaccount
metadata:
  name: ocp-subaccount
spec:
  forProvider:
    displayName: OCP Dev
    subdomain: ocp-dev-unique
\`\`\`

---

### Step 3 — Create a Flux Kustomization per environment

\`\`\`yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ocp-dev
  namespace: flux-system
spec:
  interval: 5m
  path: ./ocp/overlays/dev
  prune: true
  sourceRef:
    kind: GitRepository
    name: ocp-config
\`\`\`

Repeat for \`ocp-prod\` pointing to \`./ocp/overlays/prod\`.

---

### Preview before applying

\`\`\`bash
kubectl kustomize ocp/overlays/dev
kubectl kustomize ocp/overlays/prod
\`\`\`

Compare the rendered output to confirm only the expected fields differ.

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
