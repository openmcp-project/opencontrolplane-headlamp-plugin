import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'create-first-policy',
  categoryId: 'kyverno',
  title: 'Create your First Policy',
  description: 'Write a ClusterPolicy that prevents accidental deletion of BTP Subaccounts.',
  order: 2,
  dependsOn: ['install-kyverno'],
  guide: {
    type: 'markdown',
    content: `## Write a Do-Not-Delete Policy

Kyverno policies intercept API requests via admission webhooks. A \`validate\` rule with \`deny: {}\` blocks the request outright and returns a human-readable error.

---

### Anatomy of the policy

\`\`\`yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: deny-subaccount-delete
  annotations:
    policies.kyverno.io/title: Protect BTP Subaccounts
    policies.kyverno.io/description: >
      Prevents accidental deletion of BTP Subaccount resources.
spec:
  validationFailureAction: Enforce   # Enforce = block | Audit = only log
  background: false                  # don't scan existing resources
  rules:
    - name: deny-delete
      match:
        any:
          - resources:
              kinds:
                - Subaccount
              operations:
                - DELETE
      validate:
        message: >
          Deleting Subaccounts is not allowed.
          Remove the ClusterPolicy first if deletion is intentional.
        deny: {}
\`\`\`

Key fields:
- **\`validationFailureAction: Enforce\`** — the request is rejected with an HTTP 403
- **\`background: false\`** — applies only to new requests, not to existing resources
- **\`operations: [DELETE]\`** — the rule fires only on DELETE, not on create/update

---

### Apply the policy

\`\`\`bash
kubectl apply -f deny-subaccount-delete.yaml
\`\`\`

### Confirm it is ready

\`\`\`bash
kubectl get clusterpolicy deny-subaccount-delete
\`\`\`

The \`READY\` column should show \`True\`.

### Verification

Completed once any \`ClusterPolicy\` resource exists in the cluster.
`,
  },
  verification: [
    {
      apiVersion: 'kyverno.io/v1',
      kind: 'ClusterPolicy',
    },
  ],
};

export default story;
