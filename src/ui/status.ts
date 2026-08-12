export type StepState = 'completed' | 'current' | 'pending';

export const LIFECYCLE_STEPS: string[] = ['Requested', 'Initializing', 'Progressing', 'Ready'];

export function phaseColor(phase: string): string {
  switch (phase) {
    case 'Ready':
      return '#4caf50';
    case 'Initializing':
    case 'Requested':
    case 'Progressing':
      return '#E9730C';
    default:
      return '#9e9e9e';
  }
}

export interface TimelineStep {
  label: string;
  state: StepState;
}

export interface Timeline {
  steps: TimelineStep[];
  activeIndex: number;
  complete: boolean;
  applicable: boolean;
}

// A confirmed probe (installed=true) beats both 'Requested' and 'Progressing' — if the API
// group is already live the component is ready regardless of what the host last pushed.
// 'Initializing' and other authoritative phases win over an unconfirmed probe.
function effectivePhase(installed: boolean | null, phase?: string | null): string | null {
  if (phase && phase !== 'Requested' && phase !== 'Progressing' && LIFECYCLE_STEPS.includes(phase)) return phase;
  if (installed === true) return 'Ready';
  if (phase === 'Progressing' || phase === 'Requested') return phase;
  return null;
}

export function resolveTimeline(installed: boolean | null, phase?: string | null): Timeline {
  const active = effectivePhase(installed, phase);
  if (active === null) {
    return { steps: [], activeIndex: -1, complete: false, applicable: false };
  }
  const activeIndex = LIFECYCLE_STEPS.indexOf(active);
  const complete = activeIndex === LIFECYCLE_STEPS.length - 1;
  const steps: TimelineStep[] = LIFECYCLE_STEPS.map((label, i) => ({
    label,
    state: i < activeIndex ? 'completed' : i === activeIndex ? (complete ? 'completed' : 'current') : 'pending',
  }));
  return { steps, activeIndex, complete, applicable: true };
}
