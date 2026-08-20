import type { LearningCategory, LearningStory } from '../types';

import categoryEssentials from './categories/crossplane-essentials/category';
import categoryGitops from './categories/gitops/category';
import categoryKyverno from './categories/kyverno/category';

import story_e1 from './categories/crossplane-essentials/stories/01-install-btp-provider';
import story_e2 from './categories/crossplane-essentials/stories/02-authenticate-global-account';
import story_e3 from './categories/crossplane-essentials/stories/03-create-subaccount';
import story_e4 from './categories/crossplane-essentials/stories/04-experience-self-healing';

import story_g1 from './categories/gitops/stories/01-install-flux';
import story_g2 from './categories/gitops/stories/02-add-git-repo';
import story_g3 from './categories/gitops/stories/03-first-kustomization';
import story_g4 from './categories/gitops/stories/04-multi-environment';

import story_k1 from './categories/kyverno/stories/01-install-kyverno';
import story_k2 from './categories/kyverno/stories/02-create-first-policy';
import story_k3 from './categories/kyverno/stories/03-break-the-policy';

export const DEFAULT_CATEGORIES: LearningCategory[] = [
  categoryEssentials,
  categoryGitops,
  categoryKyverno,
];

export const DEFAULT_STORIES: LearningStory[] = [
  story_e1, story_e2, story_e3, story_e4,
  story_g1, story_g2, story_g3, story_g4,
  story_k1, story_k2, story_k3,
];
