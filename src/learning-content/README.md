# Writing Learning Stories

Stories live in `src/learning-content/` and are picked up at build time. An admin who does not want to rebuild the plugin can instead ship stories via a Kubernetes ConfigMap — see [Deploying via ConfigMap](#deploying-via-configmap) below.

---

## Directory layout

```
src/learning-content/
  types.ts                  ← shared TypeScript interfaces (do not edit)
  index.ts                  ← register your new category + stories here
  categories/
    <your-category>/
      category.ts           ← category metadata
      stories/
        01-first-story.ts
        02-second-story.ts
```

---

## 1. Create a category

```ts
// src/learning-content/categories/my-track/category.ts
import type { LearningCategory } from '../../types';

const category: LearningCategory = {
  id: 'my-track',           // unique slug
  title: 'My Track',
  description: 'Optional one-liner shown in the UI.',
  order: 10,                // controls sort order across categories
};

export default category;
```

---

## 2. Create a story

```ts
// src/learning-content/categories/my-track/stories/01-first-story.ts
import type { LearningStory } from '../../../../types';

const story: LearningStory = {
  id: 'first-story',          // unique slug, used in dependsOn
  categoryId: 'my-track',
  title: 'My First Story',
  description: 'One sentence shown on the card.',
  order: 1,
  xp: 100,
  dependsOn: [],              // list of story ids that must complete first

  // Guide: inline markdown OR external URL
  guide: {
    type: 'markdown',
    content: `## Do the thing\n\nStep 1 ...\n\nStep 2 ...`,
  },
  // guide: { type: 'url', url: 'https://docs.example.com/guide' },

  verification: [
    {
      apiVersion: 'example.io/v1',
      kind: 'MyResource',
      name: 'my-instance',     // omit to match any resource of this kind
      conditions: [
        { type: 'Ready', status: 'True' },
      ],
    },
  ],
};

export default story;
```

### Verification rule reference

| Field | Type | Description |
|---|---|---|
| `apiVersion` | string | e.g. `pkg.crossplane.io/v1` |
| `kind` | string | e.g. `Provider` |
| `name` | string? | Match a specific resource by name |
| `namespace` | string? | Restrict to a namespace (omit for cluster-scoped) |
| `labelSelector` | `{key: value}`? | Match by labels |
| `conditions` | `{type, status}[]`? | Check `.status.conditions[]` entries |
| `fields` | `{path, exists?, equals?}[]`? | Check arbitrary fields by dot-path |

**Field path examples:**

```ts
fields: [
  { path: '.spec.rotation.frequency', exists: true },
  { path: '.spec.region', equals: 'eu10' },
]
```

A story is marked complete when **every rule** has at least one matching cluster resource that satisfies all conditions and field checks.

---

## 3. Register in the barrel

Open `src/learning-content/index.ts` and add your imports:

```ts
import myCategory from './categories/my-track/category';
import myStory1   from './categories/my-track/stories/01-first-story';

export const DEFAULT_CATEGORIES = [...existingCategories, myCategory];
export const DEFAULT_STORIES    = [...existingStories,    myStory1];
```

Then rebuild the plugin: `npm run build`.

---

## Deploying via ConfigMap

If you cannot rebuild the plugin, store your content as JSON in a Kubernetes ConfigMap in the `headlamp` namespace. The plugin will merge it with the compiled defaults at runtime (ConfigMap entries win on id collisions).

### ConfigMap structure

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ocp-learning-content
  namespace: headlamp
data:
  categories: |
    [
      { "id": "my-track", "title": "My Track", "order": 10 }
    ]
  stories: |
    [
      {
        "id": "first-story",
        "categoryId": "my-track",
        "title": "My First Story",
        "description": "One sentence shown on the card.",
        "order": 1,
        "xp": 100,
        "guide": { "type": "url", "url": "https://docs.example.com" },
        "verification": [
          {
            "apiVersion": "example.io/v1",
            "kind": "MyResource",
            "conditions": [{ "type": "Ready", "status": "True" }]
          }
        ]
      }
    ]
```

Apply it with:

```bash
kubectl apply -f my-content.yaml
```

### Generate the ConfigMap from local JSON files

Use the bundled helper script to turn a directory of JSON files into a ready-to-apply ConfigMap:

```bash
node scripts/generate-configmap.mjs ./my-content-dir
```

See `scripts/generate-configmap.mjs` for the expected directory layout and all options.
