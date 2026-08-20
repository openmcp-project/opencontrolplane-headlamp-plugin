import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'gitops-install-flux',
  categoryId: 'gitops',
  title: 'Install Flux',
  description: 'Deploy the Flux GitOps toolkit into your cluster — the engine that will keep your config in sync with Git.',
  order: 1,
  guide: {
    type: 'markdown',
    content: `## Install Flux

Flux is a set of controllers that continuously reconcile your cluster state with whatever is committed to a Git repository. Once installed, Flux watches for changes and applies them automatically.

---

### Install via the Services tab

This plugin manages service installations for you. Navigate to the **Services** tab on this page, find **Flux** in the component list, and click **Install**.

The wizard provisions Flux onto your control plane using the correct version and configuration for your setup.

---

### Verify the installation

Once the wizard completes, confirm the controllers are running:

\`\`\`bash
kubectl get pods -n flux-system
\`\`\`

You should see all four controllers reach \`Running\`:

\`\`\`
source-controller-...        1/1   Running
kustomize-controller-...     1/1   Running
helm-controller-...          1/1   Running
notification-controller-...  1/1   Running
\`\`\`

---

### Optional — Install the Flux CLI

The CLI provides helpful commands for inspecting and triggering reconciliations:

\`\`\`bash
# macOS
brew install fluxcd/tap/flux
\`\`\`

\`\`\`bash
flux check
\`\`\`

### Verification

Completed once Flux Deployments are detected in the \`flux-system\` namespace.
`,
  },
  verification: [
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      namespace: 'flux-system',
      labelSelector: { 'app.kubernetes.io/part-of': 'flux' },
    },
  ],
};

export default story;
