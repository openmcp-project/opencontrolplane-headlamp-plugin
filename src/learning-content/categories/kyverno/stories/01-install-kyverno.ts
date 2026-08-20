import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'install-kyverno',
  categoryId: 'kyverno',
  title: 'Install Kyverno',
  description: 'Deploy Kyverno into your cluster using Helm — the foundation for all policy enforcement.',
  order: 1,
  guide: {
    type: 'markdown',
    content: `## Install Kyverno

Kyverno is a Kubernetes-native policy engine. Policies are plain Kubernetes YAML — no new language to learn, no sidecar to configure.

---

### Install via the Services tab

This plugin manages service installations for you. Navigate to the **Services** tab on this page, find **Kyverno** in the component list, and click **Install**.

The wizard provisions Kyverno onto your control plane using the correct version and configuration for your setup.

---

### Verify the installation

Once the wizard completes, confirm the pods are running:

\`\`\`bash
kubectl get pods -n kyverno
\`\`\`

You should see all four controllers reach \`Running\`:

\`\`\`
kyverno-admission-controller-...    1/1   Running
kyverno-background-controller-...   1/1   Running
kyverno-cleanup-controller-...      1/1   Running
kyverno-reports-controller-...      1/1   Running
\`\`\`

---

### Optional — Install the Kyverno CLI

The CLI lets you test policies locally before applying them to the cluster:

\`\`\`bash
brew install kyverno
\`\`\`

\`\`\`bash
kyverno test .
\`\`\`

### Verification

Completed once Kyverno Deployments are detected in the \`kyverno\` namespace.
`,
  },
  verification: [
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      namespace: 'kyverno',
      labelSelector: { 'app.kubernetes.io/part-of': 'kyverno' },
    },
  ],
};

export default story;
