import React, { useEffect, useState } from 'react';
import { getApiProxy } from '../api';
import { thStyle, tdStyle } from './tableStyles';

const { CircularProgress } = (window as any).pluginLib?.MuiCore ?? {};

interface Member {
  subject: string;
  kind: string;
  role: string;
  scope: 'Cluster' | 'Namespace';
  namespace?: string;
}

function useMembers(): { members: Member[] | null; error: string | null } {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getApiProxy();
    Promise.all([
      api.request('/apis/rbac.authorization.k8s.io/v1/clusterrolebindings', { isJSON: true }).catch(() => null),
      api.request('/apis/rbac.authorization.k8s.io/v1/rolebindings', { isJSON: true }).catch(() => null),
    ]).then(([crbRes, rbRes]) => {
      const rows: Member[] = [];

      for (const binding of (crbRes?.items ?? [])) {
        const role: string = binding.roleRef?.name ?? '';
        for (const subject of (binding.subjects ?? [])) {
          rows.push({ subject: subject.name, kind: subject.kind, role, scope: 'Cluster' });
        }
      }

      for (const binding of (rbRes?.items ?? [])) {
        const role: string = binding.roleRef?.name ?? '';
        const ns: string = binding.metadata?.namespace ?? '';
        for (const subject of (binding.subjects ?? [])) {
          rows.push({ subject: subject.name, kind: subject.kind, role, scope: 'Namespace', namespace: ns });
        }
      }

      rows.sort((a, b) => a.subject.localeCompare(b.subject));
      setMembers(rows);
    }).catch((e: any) => setError(String(e?.message ?? e)));
  }, []);

  return { members, error };
}

function kindBadge(kind: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    User:           { bg: '#1565c0', text: '#fff' },
    Group:          { bg: '#6a1b9a', text: '#fff' },
    ServiceAccount: { bg: '#37474f', text: '#fff' },
  };
  const c = colors[kind] ?? { bg: '#616161', text: '#fff' };
  return (
    <span style={{
      display: 'inline-block', padding: '1px 8px', borderRadius: 10,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.text,
    }}>
      {kind}
    </span>
  );
}

function scopeBadge(scope: 'Cluster' | 'Namespace', namespace?: string) {
  const isNamespaced = scope === 'Namespace';
  const badge = (
    <span style={{
      display: 'inline-block', padding: '1px 8px', borderRadius: 10,
      fontSize: 11, fontWeight: 600,
      background: isNamespaced ? '#6a1b9a' : '#1565c0', color: '#fff',
    }}>
      {scope}
    </span>
  );
  if (!isNamespaced || !namespace) return badge;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {badge}
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{namespace}</span>
    </span>
  );
}

export function MembersTab() {
  const { members, error } = useMembers();

  if (error) {
    return <p style={{ color: '#c62828', padding: '8px 0' }}>Failed to load members: {error}</p>;
  }

  if (members === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
        {CircularProgress ? <CircularProgress size={18} /> : null}
        <span style={{ color: '#888', fontSize: 14 }}>Loading members…</span>
      </div>
    );
  }

  if (members.length === 0) {
    return <p style={{ color: '#888', fontSize: 14 }}>No role bindings found.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={thStyle}>Subject</th>
          <th style={thStyle}>Kind</th>
          <th style={thStyle}>Role</th>
          <th style={thStyle}>Scope</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m, i) => (
          <tr key={i}>
            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 13 }}>{m.subject}</td>
            <td style={tdStyle}>{kindBadge(m.kind)}</td>
            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 13 }}>{m.role}</td>
            <td style={tdStyle}>{scopeBadge(m.scope, m.namespace)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
