import { useEffect, useState } from 'react';
import { apiExists, fetchDeploymentVersion } from './api';
import { COMPONENTS } from './config';
import type { Mode } from './config';

export interface ComponentStatus {
  name: string;
  label: string;
  installed: boolean | null;
  version: string | null; // null = loading, '—' = unknown/not found
  docsUrl: string;
  phase?: string | null; // install phase (Ready/Progressing/…) pushed by the host; null if unknown
  versionPaths: string[];
}

export function useInstalledComponents(): ComponentStatus[] {
  const [installed, setInstalled] = useState<Record<string, boolean | null>>(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null])),
  );
  const [versions, setVersions] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.name, null])),
  );
  // Install phase pushed by the host, keyed by component name.
  const [phases, setPhases] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (window.parent === window) return; // not embedded

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== 'ocp-host' || data.action !== 'componentStatus') return;
      setPhases(data.statuses ?? {});
    };
    // Listen before announcing so we don't miss the host's reply.
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ source: 'ocp-headlamp-plugin', action: 'statusHandshake' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    COMPONENTS.forEach((c) => {
      apiExists(c.probe).then((ok) => setInstalled((prev) => ({ ...prev, [c.name]: ok })));
      // Resolve unknown to '—' so the UI can distinguish loading (null) from not-found.
      fetchDeploymentVersion(c.versionPaths)
        .then((v) => setVersions((prev) => ({ ...prev, [c.name]: v ?? '—' })))
        .catch(() => setVersions((prev) => ({ ...prev, [c.name]: '—' })));
    });
  }, []);

  return COMPONENTS.map((c) => ({
    name: c.name,
    label: c.label,
    installed: installed[c.name],
    version: versions[c.name],
    docsUrl: c.docsUrl,
    phase: phases[c.name] ?? null,
    versionPaths: c.versionPaths,
  }));
}

export function useHostMode(): { mode: Mode; landscape: string | null } {
  const [mode, setMode] = useState<Mode>('unknown');
  const [landscape, setLandscape] = useState<string | null>(null);

  useEffect(() => {
    if (window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== 'ocp-host' || data.action !== 'componentStatus') return;
      if (data.mode === 'v1' || data.mode === 'v2') setMode(data.mode);
      if (data.landscape) setLandscape(data.landscape);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ source: 'ocp-headlamp-plugin', action: 'statusHandshake' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return { mode, landscape };
}
