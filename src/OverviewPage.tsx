import React from 'react';
import { useInstalledComponents } from './components';
import { useProviders } from './providers';
import { HealthChip, StatusChip } from './ui/chips';
import { DetailsMenu } from './ui/DetailsMenu';

const sectionStyle: React.CSSProperties = { marginBottom: 32 };
const headingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
  borderBottom: '1px solid rgba(128,128,128,0.2)',
  paddingBottom: 8,
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontWeight: 600,
  fontSize: 13,
  opacity: 0.6,
  borderBottom: '1px solid rgba(128,128,128,0.15)',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(128,128,128,0.1)',
  fontSize: 14,
};
const monoTdStyle: React.CSSProperties = { ...tdStyle, fontFamily: 'monospace', fontSize: 13 };
const mutedStyle: React.CSSProperties = { color: '#888', fontSize: 14 };

export function OverviewPage() {
  const components = useInstalledComponents();
  const { providers, error: providersError } = useProviders();

  const crossplaneInstalled = components.find((c) => c.name === 'crossplane')?.installed ?? null;

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Control Plane Overview</h1>

      <div style={sectionStyle}>
        <div style={headingStyle}>Components</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Component</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Installed versions</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.name}>
                <td style={tdStyle}>{c.label}</td>
                <td style={tdStyle}>
                  <StatusChip installed={c.installed} phase={c.phase} />
                </td>
                <td style={monoTdStyle}>
                  {c.version === null ? (
                    <span style={{ color: '#888', fontSize: 12, fontFamily: 'inherit' }}>Loading…</span>
                  ) : (
                    c.version
                  )}
                </td>
                <td style={tdStyle}>
                  <DetailsMenu component={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {crossplaneInstalled === false ? null : (
        <div style={sectionStyle}>
          <div style={headingStyle}>Crossplane Providers</div>
          {providersError ? (
            <span style={mutedStyle}>Crossplane not installed</span>
          ) : providers === null ? (
            <span style={mutedStyle}>Loading…</span>
          ) : providers.length === 0 ? (
            <span style={mutedStyle}>No providers installed</span>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Version</th>
                  <th style={thStyle}>Health</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.name}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={monoTdStyle}>{p.version}</td>
                    <td style={tdStyle}>
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
