// Semantic status colors, derived from Horizon tokens so they follow the active
// theme (light/dark) and never diverge into an ad-hoc Material palette.

import { HorizonTokens } from './horizon';

export type StatusKind = 'healthy' | 'error' | 'warning' | 'info' | 'pending' | 'neutral';

/** Map a semantic status to its Horizon color for the given token set. */
export function statusColor(tokens: HorizonTokens, kind: StatusKind): string {
  switch (kind) {
    case 'healthy':
      return tokens.positive;
    case 'error':
      return tokens.negative;
    case 'warning':
      return tokens.critical;
    case 'info':
      return tokens.informative;
    case 'pending':
    case 'neutral':
    default:
      return tokens.neutral;
  }
}

/** Boolean health → semantic kind (null = unknown/pending). */
export function healthKind(healthy: boolean | null): StatusKind {
  return healthy === true ? 'healthy' : healthy === false ? 'error' : 'neutral';
}
