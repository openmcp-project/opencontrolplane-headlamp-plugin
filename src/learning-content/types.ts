export interface LearningCategory {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export type GuideContent =
  | { type: 'markdown'; content: string }
  | { type: 'url'; url: string };

export interface VerificationRule {
  apiVersion: string;
  kind: string;
  name?: string;
  namespace?: string;
  labelSelector?: Record<string, string>;
  conditions?: Array<{ type: string; status: string }>;
  fields?: Array<{ path: string; exists?: boolean; equals?: unknown }>;
}

export interface LearningStory {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  order: number;
  xp?: number;
  dependsOn?: string[];
  guide: GuideContent;
  verification: VerificationRule[];
}
