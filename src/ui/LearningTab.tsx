import React from 'react';
import { CHALLENGES, TOTAL_XP, useLearningProgress, type Challenge, type CompletionMap } from '../learning';
import { openDocumentation } from '../host-bridge';
import { STATUS_COLORS, CHIP } from '../theme';

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressHeader({ completed, total, xpEarned }: { completed: number; total: number; xpEarned: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {completed} / {total} challenges completed
        </span>
        <span style={{ fontSize: 13, color: '#1565c0', fontWeight: 600 }}>
          {xpEarned} / {TOTAL_XP} XP
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#e0e0e0', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: 4,
          background: pct === 100 ? STATUS_COLORS.healthy.bg : '#1565c0',
          width: `${pct}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {pct === 100 && (
        <div style={{ marginTop: 8, fontSize: 13, color: STATUS_COLORS.healthy.bg, fontWeight: 600 }}>
          🎉 All challenges complete!
        </div>
      )}
    </div>
  );
}

// ── Challenge card ────────────────────────────────────────────────────────────

function ChallengeCard({ challenge, completed }: { challenge: Challenge; completed: boolean | null }) {
  const isLoading = completed === null;
  const isDone = completed === true;

  const borderColor = isDone ? STATUS_COLORS.healthy.bg : isLoading ? '#e0e0e0' : '#e0e0e0';
  const bgColor = isDone ? 'rgba(46,125,50,0.04)' : '#fff';

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${isDone ? STATUS_COLORS.healthy.bg : '#bdbdbd'}`,
      borderRadius: 6,
      padding: '14px 16px',
      background: bgColor,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      {/* Status icon */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDone ? STATUS_COLORS.healthy.bg : isLoading ? '#f5f5f5' : '#f5f5f5',
        border: isDone ? 'none' : '2px solid #bdbdbd',
        fontSize: 14,
      }}>
        {isLoading
          ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e0e0e0', display: 'block' }} />
          : isDone
          ? <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>✓</span>
          : <span style={{ color: '#bdbdbd', fontSize: 11 }}>○</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{challenge.title}</span>
          <span style={{
            ...CHIP, display: 'inline-block',
            background: isDone ? STATUS_COLORS.healthy.bg : '#1565c0',
            color: '#fff',
          }}>
            +{challenge.xp} XP
          </span>
          {isDone && (
            <span style={{ ...CHIP, display: 'inline-block', background: STATUS_COLORS.healthy.bg, color: '#fff' }}>
              Done
            </span>
          )}
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>
          {challenge.description}
        </p>
        <button
          onClick={() => openDocumentation(challenge.docsUrl)}
          style={{
            background: 'none', border: '1px solid #1565c0', borderRadius: 4,
            color: '#1565c0', fontSize: 12, fontWeight: 600,
            padding: '3px 10px', cursor: 'pointer',
          }}
        >
          Read guide →
        </button>
      </div>
    </div>
  );
}

// ── Track section ─────────────────────────────────────────────────────────────

function TrackSection({ track, challenges, progress }: {
  track: string;
  challenges: Challenge[];
  progress: CompletionMap;
}) {
  const done = challenges.filter(c => progress[c.id] === true).length;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#757575',
        }}>
          {track}
        </span>
        <span style={{ fontSize: 11, color: '#9e9e9e' }}>
          {done} / {challenges.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {challenges.map(c => (
          <ChallengeCard key={c.id} challenge={c} completed={progress[c.id]} />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function LearningTab() {
  const progress = useLearningProgress();

  const completedCount = CHALLENGES.filter(c => progress[c.id] === true).length;
  const xpEarned = CHALLENGES.filter(c => progress[c.id] === true).reduce((s, c) => s + c.xp, 0);

  const tracks = [...new Set(CHALLENGES.map(c => c.track))];

  return (
    <div style={{ maxWidth: 680 }}>
      <ProgressHeader completed={completedCount} total={CHALLENGES.length} xpEarned={xpEarned} />
      {tracks.map(track => (
        <TrackSection
          key={track}
          track={track}
          challenges={CHALLENGES.filter(c => c.track === track)}
          progress={progress}
        />
      ))}
    </div>
  );
}
