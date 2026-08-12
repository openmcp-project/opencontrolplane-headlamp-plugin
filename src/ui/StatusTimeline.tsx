import React from 'react';
import { resolveTimeline, StepState, Timeline } from './status';
import * as s from './StatusTimeline.styles';

const subLabel = (state: StepState): string =>
  state === 'completed' ? 'Completed' : state === 'current' ? 'In progress' : 'Pending';

export function MiniTimeline({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  const t: Timeline = resolveTimeline(installed, phase);
  if (!t.applicable) return <span style={s.dashStyle}>—</span>;

  const total = t.steps.length;
  const stepNo = Math.min(t.activeIndex + 1, total);

  return (
    <div style={s.miniWrapStyle}>
      <span style={s.miniCaptionStyle}>{t.complete ? 'Ready' : `Step ${stepNo} of ${total}`}</span>
      <div style={s.miniTrackStyle} role="list" aria-label="installation progress">
        {t.steps.map((step, i) => {
          const color = s.stepColor(step.state, t.complete);
          return (
            <React.Fragment key={step.label}>
              {i > 0 && <span style={s.miniConnectorStyle(step.state, t.complete)} />}
              <span
                role="listitem"
                aria-label={`${step.label}: ${step.state}`}
                title={step.label}
                style={s.miniDotStyle(step.state, color)}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function FullTimeline({ installed, phase }: { installed: boolean | null; phase?: string | null }) {
  const t: Timeline = resolveTimeline(installed, phase);
  if (!t.applicable) {
    return <div style={s.emptyStyle}>No installation progress to show.</div>;
  }

  return (
    <div style={s.fullWrapStyle}>
      <div style={s.fullTitleStyle}>Installation Progress</div>
      <div style={s.fullTrackStyle}>
        {t.steps.map((step, i) => {
          const color = s.stepColor(step.state, t.complete);
          const showCheck = step.state === 'completed';
          return (
            <React.Fragment key={step.label}>
              {i > 0 && <div style={s.fullConnectorStyle(step.state, t.complete)} />}
              <div style={s.fullStepStyle}>
                <div style={s.fullCircleStyle(step.state, color)}>{showCheck ? '✓' : i + 1}</div>
                <div style={s.fullLabelStyle}>{step.label}</div>
                <div style={s.fullSubStyle}>{subLabel(step.state)}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
