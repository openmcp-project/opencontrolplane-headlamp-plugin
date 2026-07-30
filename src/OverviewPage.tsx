import React from 'react';
import { useInstalledComponents } from './components';
import { useProviders } from './providers';
import { HealthChip, StatusChip } from './ui/chips';
import { MiniTimeline, FullTimeline } from './ui/StatusTimeline';
import { Diagnostics } from './ui/Diagnostics';
import { DetailsMenu } from './ui/DetailsMenu';
import * as s from './OverviewPage.styles';

export function OverviewPage() {
  const components = useInstalledComponents();
  const { providers, error: providersError } = useProviders();
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const crossplaneInstalled = components.find((c) => c.name === 'crossplane')?.installed ?? null;

  return (
    <div style={s.pageStyle}>
      <h1 style={s.titleStyle}>Control Plane Overview</h1>

      <div style={s.sectionStyle}>
        <div style={s.headingStyle}>Components</div>
        <table style={s.tableStyle}>
          <thead>
            <tr>
              <th style={s.chevronThStyle} aria-hidden="true"></th>
              <th style={s.thStyle}>Component</th>
              <th style={s.thStyle}>Status</th>
              <th style={s.thStyle}>Progress</th>
              <th style={s.thStyle}>Installed versions</th>
              <th style={s.thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => {
              const isExpanded = expanded === c.name;
              return (
                <React.Fragment key={c.name}>
                  <tr onClick={() => setExpanded(isExpanded ? null : c.name)} style={s.clickableRowStyle}>
                    <td style={s.chevronTdStyle}>
                      <span aria-label={isExpanded ? 'Collapse' : 'Expand'} style={s.chevronStyle(isExpanded)}>
                        ›
                      </span>
                    </td>
                    <td style={s.tdStyle}>{c.label}</td>
                    <td style={s.tdStyle}>
                      <StatusChip installed={c.installed} phase={c.phase} />
                    </td>
                    <td style={s.tdStyle}>
                      <MiniTimeline installed={c.installed} phase={c.phase} />
                    </td>
                    <td style={s.monoTdStyle}>
                      {c.version === null ? <span style={s.loadingVersionStyle}>Loading…</span> : c.version}
                    </td>
                    <td style={s.tdStyle} onClick={(e) => e.stopPropagation()}>
                      <DetailsMenu component={c} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} style={s.expandedCellStyle}>
                        <FullTimeline installed={c.installed} phase={c.phase} />
                        <Diagnostics versionPaths={c.versionPaths} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {crossplaneInstalled === false ? null : (
        <div style={s.sectionStyle}>
          <div style={s.headingStyle}>Crossplane Providers</div>
          {providersError ? (
            <span style={s.mutedStyle}>Crossplane not installed</span>
          ) : providers === null ? (
            <span style={s.mutedStyle}>Loading…</span>
          ) : providers.length === 0 ? (
            <span style={s.mutedStyle}>No providers installed</span>
          ) : (
            <table style={s.tableStyle}>
              <thead>
                <tr>
                  <th style={s.thStyle}>Name</th>
                  <th style={s.thStyle}>Version</th>
                  <th style={s.thStyle}>Health</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.name}>
                    <td style={s.tdStyle}>{p.name}</td>
                    <td style={s.monoTdStyle}>{p.version}</td>
                    <td style={s.tdStyle}>
                      <HealthChip healthy={p.healthy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
