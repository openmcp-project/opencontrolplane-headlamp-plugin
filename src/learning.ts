import { useEffect, useState } from 'react';
import { getApiProxy } from './api';
import type { LearningCategory, LearningStory, VerificationRule } from './learning-content/types';
import { DEFAULT_CATEGORIES, DEFAULT_STORIES } from './learning-content/index';

export type { LearningCategory, LearningStory };

export type CompletionMap = Record<string, boolean | null>;

// ── API path helpers ──────────────────────────────────────────────────────────

function pluralise(kind: string): string {
  const lower = kind.toLowerCase();
  if (lower.endsWith('policy')) return lower.slice(0, -1) + 'ies';
  if (lower.endsWith('s')) return lower + 'es';
  return lower + 's';
}

function resourceListPath(rule: VerificationRule): string {
  const plural = pluralise(rule.kind);
  const base = rule.apiVersion === 'v1'
    ? `/api/v1`
    : `/apis/${rule.apiVersion}`;
  if (rule.namespace) return `${base}/namespaces/${rule.namespace}/${plural}`;
  return `${base}/${plural}`;
}

// ── Field-path resolver: ".spec.foo.bar" ─────────────────────────────────────

function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').filter(Boolean).reduce(
    (cur: unknown, key) => (cur != null && typeof cur === 'object' ? (cur as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

// ── Verification engine ───────────────────────────────────────────────────────

export async function runVerification(rules: VerificationRule[]): Promise<boolean> {
  const api = getApiProxy();
  for (const rule of rules) {
    try {
      const res = await api.request(resourceListPath(rule), { isJSON: true });
      let items: unknown[] = res?.items ?? [];

      if (rule.name) {
        items = items.filter((item: unknown) =>
          (item as any)?.metadata?.name === rule.name
        );
      }

      if (rule.labelSelector) {
        items = items.filter((item: unknown) => {
          const labels: Record<string, string> = (item as any)?.metadata?.labels ?? {};
          return Object.entries(rule.labelSelector!).every(([k, v]) => labels[k] === v);
        });
      }

      const passing = items.some((item: unknown) => {
        if (rule.conditions?.length) {
          const conds: any[] = (item as any)?.status?.conditions ?? [];
          const allMet = rule.conditions.every(want =>
            conds.some(c => c.type === want.type && c.status === want.status)
          );
          if (!allMet) return false;
        }

        if (rule.fields?.length) {
          const allMet = rule.fields.every(f => {
            const val = resolvePath(item, f.path);
            if (f.exists !== undefined) return f.exists ? val !== undefined : val === undefined;
            if (f.equals !== undefined) return val === f.equals;
            return val !== undefined;
          });
          if (!allMet) return false;
        }

        return true;
      });

      if (!passing) return false;
    } catch {
      return false;
    }
  }
  return rules.length > 0;
}

// ── ConfigMap content loader ──────────────────────────────────────────────────

const CONFIGMAP_NAMESPACE = 'headlamp';
const CONFIGMAP_NAME = 'ocp-learning-content';

async function loadConfigMapContent(): Promise<{
  categories: LearningCategory[];
  stories: LearningStory[];
} | null> {
  try {
    const api = getApiProxy();
    const cm = await api.request(
      `/api/v1/namespaces/${CONFIGMAP_NAMESPACE}/configmaps/${CONFIGMAP_NAME}`,
      { isJSON: true }
    );
    const categories: LearningCategory[] = cm?.data?.categories
      ? JSON.parse(cm.data.categories)
      : [];
    const stories: LearningStory[] = cm?.data?.stories
      ? JSON.parse(cm.data.stories)
      : [];
    return { categories, stories };
  } catch {
    return null;
  }
}

function mergeById<T extends { id: string }>(base: T[], overrides: T[]): T[] {
  const map = new Map(base.map(item => [item.id, item]));
  overrides.forEach(item => map.set(item.id, item));
  return [...map.values()];
}

// ── Content hook ──────────────────────────────────────────────────────────────

export function useLearningContent(): { categories: LearningCategory[]; stories: LearningStory[] } {
  const [categories, setCategories] = useState<LearningCategory[]>(DEFAULT_CATEGORIES);
  const [stories, setStories] = useState<LearningStory[]>(DEFAULT_STORIES);

  useEffect(() => {
    loadConfigMapContent().then(extra => {
      if (!extra) return;
      setCategories(prev => mergeById(prev, extra.categories));
      setStories(prev => mergeById(prev, extra.stories));
    });
  }, []);

  return { categories, stories };
}

// ── Progress hook ─────────────────────────────────────────────────────────────

export function useLearningProgress(stories: LearningStory[]): CompletionMap {
  const [results, setResults] = useState<CompletionMap>(
    Object.fromEntries(stories.map(s => [s.id, null]))
  );

  useEffect(() => {
    if (!stories.length) return;
    setResults(Object.fromEntries(stories.map(s => [s.id, null])));
    stories.forEach(s => {
      runVerification(s.verification).then(done =>
        setResults(prev => ({ ...prev, [s.id]: done }))
      );
    });
  }, [stories.map(s => s.id).join(',')]);

  return results;
}
