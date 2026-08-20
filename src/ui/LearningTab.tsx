import React, { useState } from 'react';
import {
  useLearningContent,
  useLearningProgress,
  type LearningCategory,
  type LearningStory,
  type CompletionMap,
} from '../learning';
import { openDocumentation } from '../host-bridge';
import { STATUS_COLORS } from '../theme';
import { SimpleMarkdown } from './SimpleMarkdown';

const {
  Paper, Typography, Box, Chip, Button, CircularProgress, LinearProgress,
} = (window as any).pluginLib?.MuiCore ?? {};

// ── Icons ─────────────────────────────────────────────────────────────────────

function LockIcon({ size = 14, color = '#9e9e9e' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────

function StatusDot({ done, loading, locked }: { done: boolean; loading: boolean; locked: boolean }) {
  const base: React.CSSProperties = {
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (locked) return (
    <div style={{ ...base, background: '#f5f5f5', border: '2px solid #e0e0e0' }}>
      <LockIcon />
    </div>
  );
  if (loading) return (
    <div style={{ ...base, background: '#f5f5f5', border: '2px solid #e0e0e0' }}>
      {CircularProgress
        ? <CircularProgress size={11} thickness={5} />
        : <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0e0e0' }} />}
    </div>
  );
  if (done) return (
    <div style={{ ...base, background: STATUS_COLORS.healthy.bg }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </div>
  );
  return <div style={{ ...base, border: '2px solid #bdbdbd' }} />;
}

// ── Guide Drawer ──────────────────────────────────────────────────────────────

function GuideDrawer({ story, onClose }: { story: LearningStory; onClose: () => void }) {
  const PaperEl = Paper ?? 'div';
  const TypoEl = Typography ?? 'span';
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1200 }} />
      <PaperEl elevation={4} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 500, maxWidth: '90vw',
        zIndex: 1201, display: 'flex', flexDirection: 'column', borderRadius: 0,
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <TypoEl style={{ fontWeight: 600, fontSize: 15 }}>{story.title}</TypoEl>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 6px', borderRadius: 4, color: '#757575', fontSize: 16, lineHeight: 1,
          }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {story.guide.type === 'markdown'
            ? <SimpleMarkdown content={story.guide.content} />
            : (
              <span style={{ fontSize: 13, color: '#555' }}>
                This guide opens in a new tab.{' '}
                <a href={story.guide.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#1565c0', fontWeight: 600 }}
                  onClick={() => openDocumentation(story.guide.url)}>
                  Open guide
                </a>
              </span>
            )}
        </div>
      </PaperEl>
    </>
  );
}

// ── Story card ────────────────────────────────────────────────────────────────

function StoryCard({ story, completed, locked, lockReason }: {
  story: LearningStory;
  completed: boolean | null;
  locked: boolean;
  lockReason?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLoading = completed === null && !locked;
  const isDone = completed === true;
  const PaperEl = Paper ?? 'div';
  const ChipEl = Chip ?? 'span';
  const ButtonEl = Button ?? 'button';

  function handleGuide() {
    if (story.guide.type === 'url') openDocumentation(story.guide.url);
    else setDrawerOpen(true);
  }

  return (
    <>
      <PaperEl variant="outlined" style={{
        borderLeft: `4px solid ${locked ? '#e0e0e0' : isDone ? STATUS_COLORS.healthy.bg : '#bdbdbd'}`,
        borderRadius: 6, padding: '14px 16px',
        background: isDone ? 'rgba(46,125,50,0.03)' : locked ? '#fafafa' : '#fff',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        opacity: locked ? 0.72 : 1, transition: 'opacity 0.2s',
      }}>
        <StatusDot done={isDone} loading={isLoading} locked={locked} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: locked ? '#9e9e9e' : 'inherit' }}>
              {story.title}
            </span>
            {isDone && (
              <ChipEl label="Done" size="small" style={{
                height: 18, fontSize: 11, fontWeight: 600,
                background: STATUS_COLORS.healthy.bg, color: '#fff',
              }} />
            )}
            {locked && (
              <ChipEl label="Locked" size="small" style={{
                height: 18, fontSize: 11, fontWeight: 600, background: '#e0e0e0', color: '#757575',
              }} />
            )}
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: locked ? '#9e9e9e' : '#555', lineHeight: 1.5 }}>
            {story.description}
          </p>
          {locked && lockReason && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9e9e9e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <LockIcon size={11} /> Complete "{lockReason}" first
            </p>
          )}
          <ButtonEl size="small" variant="outlined" onClick={handleGuide}
            style={{ fontSize: 12, textTransform: 'none', padding: '2px 10px' }}>
            Read guide
          </ButtonEl>
        </Box>
      </PaperEl>
      {drawerOpen && <GuideDrawer story={story} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

// ── Category card (overview grid) ─────────────────────────────────────────────

function CategoryCard({ category, stories, progress, onClick }: {
  category: LearningCategory;
  stories: LearningStory[];
  progress: CompletionMap;
  onClick: () => void;
}) {
  const PaperEl = Paper ?? 'div';
  const TypoEl = Typography ?? 'div';
  const ProgressEl = LinearProgress ?? null;

  const done = stories.filter(s => progress[s.id] === true).length;
  const total = stories.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const isComplete = done === total && total > 0;

  return (
    <PaperEl
      variant="outlined"
      onClick={onClick}
      style={{
        borderRadius: 8, padding: '20px 20px 16px',
        cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
        borderColor: isComplete ? STATUS_COLORS.healthy.bg : undefined,
      }}
      onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.10)'; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <TypoEl style={{ fontWeight: 700, fontSize: 15 }}>{category.title}</TypoEl>
        <TypoEl style={{ fontSize: 12, color: isComplete ? STATUS_COLORS.healthy.bg : '#757575', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12 }}>
          {done} / {total}
        </TypoEl>
      </div>
      {category.description && (
        <TypoEl style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
          {category.description}
        </TypoEl>
      )}
      {ProgressEl ? (
        <ProgressEl variant="determinate" value={pct} style={{ height: 5, borderRadius: 3 }}
          sx={{ '& .MuiLinearProgress-bar': { background: isComplete ? STATUS_COLORS.healthy.bg : '#1565c0' } }} />
      ) : (
        <div style={{ height: 5, borderRadius: 3, background: '#e0e0e0', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: isComplete ? STATUS_COLORS.healthy.bg : '#1565c0', transition: 'width 0.5s' }} />
        </div>
      )}
    </PaperEl>
  );
}

// ── Category detail view ──────────────────────────────────────────────────────

function CategoryDetail({ category, stories, progress, allStories, onBack }: {
  category: LearningCategory;
  stories: LearningStory[];
  progress: CompletionMap;
  allStories: LearningStory[];
  onBack: () => void;
}) {
  const TypoEl = Typography ?? 'div';
  const ButtonEl = Button ?? 'button';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <ButtonEl
          size="small"
          variant="text"
          onClick={onBack}
          startIcon={<BackIcon />}
          style={{ fontSize: 13, textTransform: 'none', color: '#555', minWidth: 0, padding: '4px 8px' }}
        >
          All categories
        </ButtonEl>
        <span style={{ color: '#bdbdbd', fontSize: 14 }}>/</span>
        <TypoEl style={{ fontSize: 14, fontWeight: 600 }}>{category.title}</TypoEl>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stories.map(story => {
          const unmetDep = story.dependsOn?.find(depId => progress[depId] !== true);
          const locked = !!unmetDep;
          const lockReason = unmetDep
            ? (allStories.find(s => s.id === unmetDep)?.title ?? unmetDep)
            : undefined;
          return (
            <StoryCard
              key={story.id}
              story={story}
              completed={locked ? false : progress[story.id]}
              locked={locked}
              lockReason={lockReason}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function LearningTab() {
  const { categories, stories } = useLearningContent();
  const progress = useLearningProgress(stories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  if (selectedCategoryId) {
    const category = sortedCategories.find(c => c.id === selectedCategoryId);
    if (category) {
      const catStories = stories
        .filter(s => s.categoryId === selectedCategoryId)
        .sort((a, b) => a.order - b.order);
      return (
        <div style={{ maxWidth: 680 }}>
          <CategoryDetail
            category={category}
            stories={catStories}
            progress={progress}
            allStories={stories}
            onBack={() => setSelectedCategoryId(null)}
          />
        </div>
      );
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedCategories.map(cat => {
          const catStories = stories.filter(s => s.categoryId === cat.id);
          if (!catStories.length) return null;
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              stories={catStories}
              progress={progress}
              onClick={() => setSelectedCategoryId(cat.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
