import React from 'react';
import { ClusterEvent, ComponentDiagnostics, DeploymentCondition, fetchComponentDiagnostics } from '../api';
import { Button } from '../mui';
import * as s from './Diagnostics.styles';

function ConditionRow({ c }: { c: DeploymentCondition }) {
  return (
    <div style={s.rowStyle}>
      <span style={s.boldStyle}>{c.type}</span> <span style={s.conditionStatusStyle(c)}>{c.status}</span>
      {c.reason ? <span style={s.mutedInlineStyle}> · {c.reason}</span> : null}
      {c.message ? <div style={s.nestedTextStyle}>{c.message}</div> : null}
    </div>
  );
}

function EventRow({ e }: { e: ClusterEvent }) {
  return (
    <div style={s.rowStyle}>
      <span style={s.reasonStyle}>{e.reason}</span>
      {e.involvedName ? <span style={s.mutedInlineStyle}> · {e.involvedName}</span> : null}
      <div style={s.nestedTextStyle}>{e.message}</div>
    </div>
  );
}

function ToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const label = open ? 'Hide Logs' : 'View Logs';
  if (Button) {
    return (
      <Button size="small" variant="outlined" onClick={onClick}>
        {label}
      </Button>
    );
  }
  return (
    <button type="button" onClick={onClick} style={s.fallbackButtonStyle}>
      {label}
    </button>
  );
}

// In-cluster diagnostics for a component (operator Deployment conditions + recent Warning
// events in its namespace), hidden behind a "View Logs" toggle and fetched lazily on first open.
export function Diagnostics({ versionPaths }: { versionPaths: string[] }) {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<ComponentDiagnostics | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || data !== null) return;
    let cancelled = false;
    setLoading(true);
    fetchComponentDiagnostics(versionPaths)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ namespace: null, conditions: [], events: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, data, versionPaths]);

  const conditions = data?.conditions ?? [];
  const events = data?.events ?? [];

  return (
    <div style={s.wrapStyle}>
      <ToggleButton open={open} onClick={() => setOpen((o) => !o)} />
      {open &&
        (loading ? (
          <div style={s.messageStyle}>Loading diagnostics…</div>
        ) : !conditions.length && !events.length ? (
          <div style={s.messageStyle}>No workload diagnostics found in this cluster.</div>
        ) : (
          <div style={s.panelStyle}>
            {conditions.length > 0 && (
              <div>
                <div style={s.sectionLabelStyle}>Workload status</div>
                <div style={s.conditionListStyle}>
                  {conditions.map((c, i) => (
                    <ConditionRow key={`${c.type}-${i}`} c={c} />
                  ))}
                </div>
              </div>
            )}
            {events.length > 0 && (
              <div>
                <div style={s.sectionLabelStyle}>
                  Recent warnings{data?.namespace ? ` (namespace ${data.namespace})` : ''}
                </div>
                <div style={s.eventListStyle}>
                  {events.map((e, i) => (
                    <EventRow key={i} e={e} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
