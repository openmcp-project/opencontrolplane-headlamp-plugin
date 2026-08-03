import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { resolveTimeline, LIFECYCLE_STEPS } from '../ui/status';
import { MiniTimeline, FullTimeline } from '../ui/StatusTimeline';

describe('resolveTimeline', () => {
  it('Requested → step 1 current, rest pending', () => {
    const t = resolveTimeline(false, 'Requested');
    expect(t.applicable).toBe(true);
    expect(t.activeIndex).toBe(0);
    expect(t.complete).toBe(false);
    expect(t.steps.map((s) => s.state)).toEqual(['current', 'pending', 'pending', 'pending']);
  });

  it('Progressing → earlier steps completed, current at index 2', () => {
    const t = resolveTimeline(false, 'Progressing');
    expect(t.activeIndex).toBe(2);
    expect(t.steps.map((s) => s.state)).toEqual(['completed', 'completed', 'current', 'pending']);
  });

  it('Initializing → index 1 current', () => {
    const t = resolveTimeline(null, 'Initializing');
    expect(t.activeIndex).toBe(1);
    expect(t.steps.map((s) => s.state)).toEqual(['completed', 'current', 'pending', 'pending']);
  });

  it('Ready → all completed and complete flag set', () => {
    const t = resolveTimeline(false, 'Ready');
    expect(t.complete).toBe(true);
    expect(t.steps.every((s) => s.state === 'completed')).toBe(true);
  });

  it('probe-confirmed install without a phase → terminal (Ready)', () => {
    const t = resolveTimeline(true, null);
    expect(t.applicable).toBe(true);
    expect(t.complete).toBe(true);
    expect(t.activeIndex).toBe(LIFECYCLE_STEPS.length - 1);
  });

  it('a confirmed probe wins over the weak Requested signal → terminal', () => {
    const t = resolveTimeline(true, 'Requested');
    expect(t.complete).toBe(true);
  });

  it('not installed (false, null) → not applicable', () => {
    expect(resolveTimeline(false, null).applicable).toBe(false);
  });

  it('loading (null, null) → not applicable', () => {
    expect(resolveTimeline(null, null).applicable).toBe(false);
  });

  it('Terminating and unknown phases → not applicable', () => {
    expect(resolveTimeline(false, 'Terminating').applicable).toBe(false);
    expect(resolveTimeline(false, 'Whatever').applicable).toBe(false);
  });
});

describe('MiniTimeline', () => {
  it('renders an em-dash when not applicable', () => {
    const { container } = render(<MiniTimeline installed={false} phase={null} />);
    expect(container.textContent).toBe('—');
  });

  it('renders one node per lifecycle step and a step caption when applicable', () => {
    const { container } = render(<MiniTimeline installed={false} phase="Progressing" />);
    expect(container.querySelectorAll('[role="listitem"]').length).toBe(LIFECYCLE_STEPS.length);
    expect(container.textContent).toContain(`Step 3 of ${LIFECYCLE_STEPS.length}`);
  });

  it('shows a Ready caption when complete', () => {
    const { container } = render(<MiniTimeline installed={true} phase={null} />);
    expect(container.textContent).toContain('Ready');
  });
});

describe('FullTimeline', () => {
  it('renders every step label with a sub-state when applicable', () => {
    const { container } = render(<FullTimeline installed={false} phase="Progressing" />);
    LIFECYCLE_STEPS.forEach((label) => expect(container.textContent).toContain(label));
    expect(container.textContent).toContain('In progress');
    expect(container.textContent).toContain('Completed');
    expect(container.textContent).toContain('Pending');
  });

  it('renders a fallback message when not applicable', () => {
    const { container } = render(<FullTimeline installed={false} phase={null} />);
    expect(container.textContent).toContain('No installation progress');
  });
});
