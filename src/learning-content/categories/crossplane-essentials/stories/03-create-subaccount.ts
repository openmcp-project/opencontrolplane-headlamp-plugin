import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'create-subaccount',
  categoryId: 'crossplane-essentials',
  title: 'Create Subaccount',
  description: 'Provision a BTP Subaccount declaratively using a Crossplane managed resource — no BTP cockpit clicks required.',
  order: 3,
  xp: 200,
  dependsOn: ['authenticate-global-account'],
  guide: {
    type: 'markdown',
    content: `## Create a BTP Subaccount

With the provider configured, you can now create BTP Subaccounts as Kubernetes objects. Crossplane will reconcile the desired state with BTP continuously.

### Steps

**1. Define the Subaccount**

\`\`\`yaml
apiVersion: account.btp.sap.crossplane.io/v1alpha1
kind: Subaccount
metadata:
  name: my-subaccount
spec:
  forProvider:
    displayName: My Subaccount
    region: eu10
    subdomain: my-unique-subdomain
    betaEnabled: false
  providerConfigRef:
    name: default
\`\`\`

**2. Apply the manifest**

\`\`\`bash
kubectl apply -f subaccount.yaml
\`\`\`

**3. Watch it provision**

\`\`\`bash
kubectl get subaccount my-subaccount --watch
\`\`\`

After a short while, the \`READY\` and \`SYNCED\` columns will both show \`True\`.

**4. Inspect the status**

\`\`\`bash
kubectl describe subaccount my-subaccount
\`\`\`

The \`Status.AtProvider\` section will contain the BTP-assigned subaccount ID and other metadata.

### Verification

Completed once any \`Subaccount\` resource exists with both \`Ready=True\` and \`Synced=True\`.
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
