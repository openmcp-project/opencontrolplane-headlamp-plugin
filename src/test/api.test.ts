import { describe, it, expect, vi, beforeEach } from 'vitest';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  K8s: { ApiProxy: { request } },
}));

import { apiExists, fetchDeploymentVersion } from '../api';

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
