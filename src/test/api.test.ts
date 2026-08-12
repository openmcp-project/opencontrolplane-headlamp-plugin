import { describe, it, expect, vi, beforeEach } from 'vitest';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  K8s: { ApiProxy: { request } },
}));

import { apiExists, fetchDeploymentVersion, fetchDeploymentConditions, fetchNamespaceWarningEvents, fetchComponentDiagnostics } from '../api';

beforeEach(() => request.mockReset());

describe('apiExists', () => {
  it('returns true when the request resolves', async () => {
    request.mockResolvedValueOnce({});
    expect(await apiExists('/apis/x')).toBe(true);
  });

  it('returns false when the request rejects', async () => {
    request.mockRejectedValueOnce(new Error('404'));
    expect(await apiExists('/apis/x')).toBe(false);
  });
});

describe('fetchDeploymentVersion', () => {
  const deployment = (over: Record<string, unknown>) => ({ items: [over] });

  it('prefers the app.kubernetes.io/version label', async () => {
    request.mockResolvedValueOnce(
      deployment({ metadata: { labels: { 'app.kubernetes.io/version': '1.2.3' } } }),
    );
    expect(await fetchDeploymentVersion(['/a'])).toBe('1.2.3');
  });

  it('falls back to the container image tag', async () => {
    request.mockResolvedValueOnce(
      deployment({ spec: { template: { spec: { containers: [{ image: 'repo/img:2.0.0' }] } } } }),
    );
    expect(await fetchDeploymentVersion(['/a'])).toBe('2.0.0');
  });

  it('ignores a :latest tag and digest-pinned images', async () => {
    request.mockResolvedValueOnce(
      deployment({ spec: { template: { spec: { containers: [{ image: 'repo/img:latest' }] } } } }),
    );
    expect(await fetchDeploymentVersion(['/a'])).toBeNull();

    request.mockResolvedValueOnce(
      deployment({ spec: { template: { spec: { containers: [{ image: 'repo/img@sha256:abc' }] } } } }),
    );
    expect(await fetchDeploymentVersion(['/a'])).toBeNull();
  });

  it('tries the next path when the first yields no deployment', async () => {
    request.mockResolvedValueOnce({ items: [] });
    request.mockResolvedValueOnce(deployment({ metadata: { labels: { 'app.kubernetes.io/version': '9.9' } } }));
    expect(await fetchDeploymentVersion(['/a', '/b'])).toBe('9.9');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('returns null when every path fails or is empty', async () => {
    request.mockResolvedValueOnce({ items: [] });
    request.mockRejectedValueOnce(new Error('boom'));
    expect(await fetchDeploymentVersion(['/a', '/b'])).toBeNull();
  });
});

describe('fetchDeploymentConditions', () => {
  it('extracts conditions and namespace from the first deployment found', async () => {
    request.mockResolvedValueOnce({
      items: [
        {
          metadata: { namespace: 'crossplane-system' },
          status: {
            conditions: [
              { type: 'Available', status: 'False', reason: 'MinimumReplicasUnavailable', message: 'not ready' },
              { type: 'Progressing', status: 'False', reason: 'ProgressDeadlineExceeded' },
            ],
          },
        },
      ],
    });
    const res = await fetchDeploymentConditions(['/a']);
    expect(res.namespace).toBe('crossplane-system');
    expect(res.conditions).toHaveLength(2);
    expect(res.conditions[0]).toEqual({
      type: 'Available',
      status: 'False',
      reason: 'MinimumReplicasUnavailable',
      message: 'not ready',
    });
    expect(res.conditions[1].message).toBeUndefined();
  });

  it('tries the next path and returns empty when nothing found', async () => {
    request.mockResolvedValueOnce({ items: [] });
    request.mockRejectedValueOnce(new Error('boom'));
    const res = await fetchDeploymentConditions(['/a', '/b']);
    expect(res).toEqual({ conditions: [], namespace: null });
  });
});

describe('fetchNamespaceWarningEvents', () => {
  it('maps, sorts most-recent-first, and caps the list', async () => {
    request.mockResolvedValueOnce({
      items: [
        { type: 'Warning', reason: 'BackOff', message: 'old', lastTimestamp: '2024-01-01T00:00:00Z', involvedObject: { name: 'pod-a' } },
        { type: 'Warning', reason: 'Failed', message: 'new', lastTimestamp: '2024-01-02T00:00:00Z', involvedObject: { name: 'pod-b' } },
      ],
    });
    const events = await fetchNamespaceWarningEvents('ns', 1);
    expect(events).toHaveLength(1);
    expect(events[0].reason).toBe('Failed'); // newest first
    expect(events[0].involvedName).toBe('pod-b');
  });

  it('returns empty on error', async () => {
    request.mockRejectedValueOnce(new Error('403'));
    expect(await fetchNamespaceWarningEvents('ns')).toEqual([]);
  });
});

describe('fetchComponentDiagnostics', () => {
  it('skips the events call when no namespace is resolved', async () => {
    request.mockResolvedValueOnce({ items: [] }); // deployment lookup: nothing
    const res = await fetchComponentDiagnostics(['/a']);
    expect(res).toEqual({ namespace: null, conditions: [], events: [] });
    expect(request).toHaveBeenCalledTimes(1); // no events request
  });

  it('fetches events in the resolved namespace', async () => {
    request.mockResolvedValueOnce({
      items: [{ metadata: { namespace: 'flux-system' }, status: { conditions: [{ type: 'Available', status: 'True' }] } }],
    });
    request.mockResolvedValueOnce({
      items: [{ type: 'Warning', reason: 'Failed', message: 'x', lastTimestamp: '2024-01-01T00:00:00Z', involvedObject: { name: 'p' } }],
    });
    const res = await fetchComponentDiagnostics(['/a']);
    expect(res.namespace).toBe('flux-system');
    expect(res.conditions).toHaveLength(1);
    expect(res.events).toHaveLength(1);
    expect(request).toHaveBeenLastCalledWith(
      '/api/v1/namespaces/flux-system/events?fieldSelector=type=Warning',
      { isJSON: true },
    );
  });
});
