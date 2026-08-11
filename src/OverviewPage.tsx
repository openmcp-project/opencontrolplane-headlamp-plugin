import React, { useState } from 'react';
import { useInstalledComponents } from './components';
import { useProviders } from './providers';
import { HealthChip, StatusChip } from './ui/chips';
import { DetailsMenu } from './ui/DetailsMenu';
import { MembersTab } from './ui/MembersTab';
import { thStyle, tdStyle } from './ui/tableStyles';

const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};
const { Tabs, Tab } = (window as any).pluginLib?.MuiCore ?? {};

const sectionStyle: React.CSSProperties = { marginBottom: 32 };
const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#757575',
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const monoTdStyle: React.CSSProperties = { ...tdStyle, fontFamily: 'monospace', fontSize: 13 };
const mutedStyle: React.CSSProperties = { color: '#888', fontSize: 14 };

function ServicesTab() {
  const components = useInstalledComponents();
  const { providers, error: providersError } = useProviders();
  const crossplaneInstalled = components.find((c) => c.name === 'crossplane')?.installed ?? null;

  return (
    <>
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
    </>
  );
}

function LearningTab() {
  return (
    <div style={{ padding: '32px 0', textAlign: 'center', color: '#9e9e9e' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#616161' }}>Coming soon</div>
      <div style={{ fontSize: 14 }}>Learning resources will appear here.</div>
    </div>
  );
}

export function OverviewPage() {
  const [tab, setTab] = useState(0);

  if (!SectionBox || !Tabs || !Tab) {
    return <div style={{ padding: 24 }}><span style={{ color: '#888' }}>Loading…</span></div>;
  }

  return (
    <SectionBox title="Control Plane Overview" headerProps={{ headerStyle: 'main' }}>
      <Tabs value={tab} onChange={(_: any, v: number) => setTab(v)} style={{ marginBottom: 24 }}>
        <Tab label="Services" />
        <Tab label="Members" />
        <Tab label="Learning" />
      </Tabs>

      {tab === 0 && <ServicesTab />}
      {tab === 1 && <MembersTab />}
      {tab === 2 && <LearningTab />}
    </SectionBox>
  );
}
