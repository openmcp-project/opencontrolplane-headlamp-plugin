import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'break-the-policy',
  categoryId: 'kyverno',
  title: 'Break the Policy',
  description: 'Try to delete a protected Subaccount and watch Kyverno block the request in real time.',
  order: 3,
  dependsOn: ['create-first-policy'],
  guide: {
    type: 'markdown',
    content: `## Break the Policy

Now that the deny-delete policy is active, any attempt to delete a Subaccount will be blocked by Kyverno's admission webhook — before the request even reaches the Kubernetes API.

---

### Step 1 — Attempt the deletion

\`\`\`bash
kubectl delete subaccount my-subaccount
\`\`\`

You will see an error like:

\`\`\`
Error from server: admission webhook "validate.kyverno.svc-fail" denied the request:

resource Subaccount/default/my-subaccount was blocked due to the following policies

deny-subaccount-delete:
  deny-delete: Deleting Subaccounts is not allowed.
               Remove the ClusterPolicy first if deletion is intentional.
\`\`\`

The Subaccount is untouched. Kyverno returned HTTP 403 to \`kubectl\` before any controller processed the request.

---

### Step 2 — Check the audit trail

Kyverno records every blocked request as a \`PolicyViolation\` event:

\`\`\`bash
kubectl get events --field-selector reason=PolicyViolation
\`\`\`

---

### Step 3 — Delete intentionally

When you genuinely want to remove the resource, delete the policy first:

\`\`\`bash
kubectl delete clusterpolicy deny-subaccount-delete
kubectl delete subaccount my-subaccount
\`\`\`

Or extend your policy to allow deletion when a specific label is present:

\`\`\`yaml
validate:
  deny:
    conditions:
      all:
        - key: "{{ request.object.metadata.labels.\"allow-delete\" || '' }}"
          operator: NotEquals
          value: "true"
\`\`\`

Then bypass it per resource:

\`\`\`bash
kubectl label subaccount my-subaccount allow-delete=true
kubectl delete subaccount my-subaccount
\`\`\`

---

### What you've learned

- Kyverno webhooks block requests **before** any controller sees them
- \`Enforce\` mode gives an immediate, user-visible error message
- Policies should include a clear message and an escape hatch for intentional operations

### Verification

Completed once a \`ClusterPolicy\` exists — the real test is the error message you see above.
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
