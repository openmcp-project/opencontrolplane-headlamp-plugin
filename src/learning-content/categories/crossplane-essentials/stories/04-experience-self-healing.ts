import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'experience-self-healing',
  categoryId: 'crossplane-essentials',
  title: 'Experience Self-healing',
  description: 'Witness Crossplane\'s reconciliation loop in action: delete your Subaccount and watch it automatically come back.',
  order: 4,
  xp: 250,
  dependsOn: ['create-subaccount'],
  guide: {
    type: 'markdown',
    content: `## Experience Self-healing

One of Crossplane's most powerful properties is its continuous reconciliation loop. Any drift from the desired state — whether caused by an accident or an external change — is automatically corrected.

### Steps

**1. Confirm your Subaccount is healthy**

\`\`\`bash
kubectl get subaccount my-subaccount
# READY: True   SYNCED: True
\`\`\`

**2. Delete the Subaccount resource from Kubernetes**

\`\`\`bash
kubectl delete subaccount my-subaccount
\`\`\`

> **What happens?** By default, Crossplane uses a \`DeletionPolicy: Delete\` — so deleting the Kubernetes object also deletes the BTP resource. To observe self-healing without destroying the BTP resource, first set the deletion policy to \`Orphan\`:

\`\`\`yaml
spec:
  deletionPolicy: Orphan
\`\`\`

**3. Watch Crossplane recreate it**

If you re-apply the manifest after deletion, Crossplane will immediately detect the missing resource and start reconciling:

\`\`\`bash
kubectl apply -f subaccount.yaml
kubectl get subaccount my-subaccount --watch
\`\`\`

**4. Observe external drift healing**

You can also edit the Subaccount directly in the BTP Cockpit (e.g., rename it) and watch Crossplane revert the change back to the desired state within seconds.

### What you've learned

- Crossplane continuously compares desired state (your YAML) to actual state (BTP)
- Deleting the Kubernetes resource removes the cloud resource (unless \`deletionPolicy: Orphan\`)
- Any external change to the cloud resource is automatically reverted

### Verification

Completed once your Subaccount is back with \`Ready=True\` and \`Synced=True\`.
`,
  },
  verification: [
    {
      apiVersion: 'account.btp.sap.crossplane.io/v1alpha1',
      kind: 'Subaccount',
      conditions: [
        { type: 'Ready', status: 'True' },
        { type: 'Synced', status: 'True' },
      ],
    },
  ],
};

export default story;
