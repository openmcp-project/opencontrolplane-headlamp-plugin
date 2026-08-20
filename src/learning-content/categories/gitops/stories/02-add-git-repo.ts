import type { LearningStory } from '../../../../types';

const DOCS_BASE = 'https://github.tools.sap/cloud-orchestration';

const story: LearningStory = {
  id: 'gitops-add-git-repo',
  categoryId: 'gitops',
  title: 'Add your First Git Repository',
  description: 'Tell Flux where your config lives by creating a GitRepository source that points to your Git repo.',
  order: 2,
  dependsOn: ['gitops-install-flux'],
  guide: {
    type: 'markdown',
    content: `## Add your First Git Repository

A \`GitRepository\` is a Flux source — it tells Flux where to pull manifests from and how often to check for changes. Everything Flux applies must come from a registered source.

> **Official guide:** [Delivery Phase 3](${DOCS_BASE}/docs/what-is-iad/learning-path/delivery/phase-3)

---

### Step 1 — Create a Secret with your Git credentials

For private repositories, create a deploy key or token secret:

\`\`\`bash
flux create secret git ocp-git-auth \\
  --url=https://github.com/<your-org>/<your-repo> \\
  --username=git \\
  --password=<your-token> \\
  --namespace=flux-system
\`\`\`

For public repositories, skip this step.

---

### Step 2 — Create the GitRepository

\`\`\`yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ocp-config
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/<your-org>/<your-repo>
  ref:
    branch: main
  # secretRef:          # uncomment for private repos
  #   name: ocp-git-auth
\`\`\`

\`\`\`bash
kubectl apply -f git-repository.yaml
\`\`\`

---

### Step 3 — Check the sync status

\`\`\`bash
flux get source git
\`\`\`

\`\`\`
NAME        REVISION        SUSPENDED  READY  MESSAGE
ocp-config  main@sha1:abc   False      True   stored artifact for revision 'main@sha1:abc'
\`\`\`

\`READY: True\` means Flux successfully pulled the repository and stored a local artifact.

---

### Trigger a manual sync

\`\`\`bash
flux reconcile source git ocp-config
\`\`\`

### Verification

Completed once a \`GitRepository\` resource exists in the cluster with a successful sync.
`,
  },
  verification: [
    {
      apiVersion: 'source.toolkit.fluxcd.io/v1',
      kind: 'GitRepository',
    },
  ],
};

export default story;
