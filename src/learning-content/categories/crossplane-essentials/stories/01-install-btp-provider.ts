import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'install-btp-provider',
  categoryId: 'crossplane-essentials',
  title: 'Install BTP Provider',
  description: 'Install the SAP BTP Crossplane provider to enable declarative provisioning of BTP resources from your control plane.',
  order: 1,
  xp: 100,
  guide: {
    type: 'markdown',
    content: `## Install the SAP BTP Provider

The BTP Provider is the bridge between Crossplane and SAP Business Technology Platform. Once installed, your control plane can manage BTP resources declaratively as Kubernetes objects.

---

### Step 1 — Ensure Crossplane is installed

The BTP Provider runs on top of Crossplane. Navigate to the **Services** tab and confirm Crossplane shows as installed. If not, click **Install** there first.

---

### Step 2 — Declare the Provider

Crossplane providers are installed declaratively — create a \`Provider\` manifest and apply it to your control plane (or commit it to your GitOps repository):

\`\`\`yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-btp
spec:
  package: ghcr.io/sap/crossplane-provider-btp:latest
\`\`\`

\`\`\`bash
kubectl apply -f provider-btp.yaml
\`\`\`

Crossplane's package manager pulls the provider image, installs the CRDs, and starts the controller automatically.

---

### Step 3 — Wait for the provider to become healthy

\`\`\`bash
kubectl get providers provider-btp --watch
\`\`\`

\`\`\`
NAME           INSTALLED   HEALTHY   PACKAGE                                    AGE
provider-btp   True        True      ghcr.io/sap/crossplane-provider-btp:...   2m
\`\`\`

Both \`INSTALLED\` and \`HEALTHY\` must be \`True\` before proceeding.

---

### Verification

Completed automatically once \`provider-btp\` is detected with \`Installed=True\` and \`Healthy=True\`.
`,
  },
  verification: [
    {
      apiVersion: 'pkg.crossplane.io/v1',
      kind: 'Provider',
      name: 'provider-btp',
      conditions: [
        { type: 'Installed', status: 'True' },
        { type: 'Healthy', status: 'True' },
      ],
    },
  ],
};

export default story;
