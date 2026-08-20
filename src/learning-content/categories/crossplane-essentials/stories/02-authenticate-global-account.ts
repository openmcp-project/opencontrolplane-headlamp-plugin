import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'authenticate-global-account',
  categoryId: 'crossplane-essentials',
  title: 'Authenticate Global Account',
  description: 'Create a ProviderConfig that holds your BTP Global Account credentials, enabling the provider to act on your behalf.',
  order: 2,
  xp: 150,
  dependsOn: ['install-btp-provider'],
  guide: {
    type: 'markdown',
    content: `## Authenticate your BTP Global Account

A \`ProviderConfig\` tells the BTP provider which Global Account to use and how to authenticate. You will store credentials in a Kubernetes Secret and reference it from the ProviderConfig.

### Steps

**1. Create a Secret with your BTP service account credentials**

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: btp-creds
  namespace: crossplane-system
type: Opaque
stringData:
  credentials: |
    {
      "clientid": "<your-client-id>",
      "clientsecret": "<your-client-secret>",
      "tokenurl": "https://<subdomain>.authentication.<region>.hana.ondemand.com/oauth/token",
      "smurl": "https://service-manager.<region>.hana.ondemand.com"
    }
\`\`\`

**2. Create the ProviderConfig**

\`\`\`yaml
apiVersion: account.btp.sap.crossplane.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: Secret
    secretRef:
      namespace: crossplane-system
      name: btp-creds
      key: credentials
\`\`\`

**3. Apply both resources**

\`\`\`bash
kubectl apply -f btp-creds.yaml
kubectl apply -f provider-config.yaml
\`\`\`

**4. Check the ProviderConfig status**

\`\`\`bash
kubectl get providerconfig default
\`\`\`

### Verification

Completed once a \`ProviderConfig\` of kind \`account.btp.sap.crossplane.io/v1beta1\` exists with \`Ready=True\`.
`,
  },
  verification: [
    {
      apiVersion: 'account.btp.sap.crossplane.io/v1beta1',
      kind: 'ProviderConfig',
      conditions: [
        { type: 'Ready', status: 'True' },
      ],
    },
  ],
};

export default story;
