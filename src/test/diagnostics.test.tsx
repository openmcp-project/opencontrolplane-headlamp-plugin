import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({ K8s: { ApiProxy: { request } } }));

import { Diagnostics } from '../ui/Diagnostics';

beforeEach(() => request.mockReset());

const deployment = (over: Record<string, unknown>) => ({ items: [over] });

async function open() {
  fireEvent.click(screen.getByText('View Logs'));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('Diagnostics', () => {
  it('renders a View Logs toggle and fetches nothing until opened', () => {
    render(<Diagnostics versionPaths={['/a']} />);
    expect(screen.getByText('View Logs')).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it('fetches on first open and renders conditions and events', async () => {
    request.mockResolvedValueOnce(
      deployment({
        metadata: { namespace: 'flux-system' },
        status: { conditions: [{ type: 'Available', status: 'False', reason: 'MinimumReplicasUnavailable' }] },
      }),
    );
    request.mockResolvedValueOnce({
      items: [{ type: 'Warning', reason: 'BackOff', message: 'crash', lastTimestamp: '', involvedObject: { name: 'pod-a' } }],
    });

    render(<Diagnostics versionPaths={['/a']} />);
    await open();

    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('MinimumReplicasUnavailable', { exact: false })).toBeTruthy();
    expect(screen.getByText('BackOff')).toBeTruthy();
    expect(screen.getByText(/namespace flux-system/)).toBeTruthy();
  });

  it('toggles the label and keeps showing data on reopen', async () => {
    request.mockResolvedValue(
      deployment({ metadata: { namespace: 'ns' }, status: { conditions: [{ type: 'Available', status: 'True' }] } }),
    );

    render(<Diagnostics versionPaths={['/a']} />);
    await open();
    expect(screen.getByText('Hide Logs')).toBeTruthy();

    fireEvent.click(screen.getByText('Hide Logs'));
    fireEvent.click(screen.getByText('View Logs'));
    expect(screen.getByText('Available')).toBeTruthy();
  });

  it('shows a fallback message when there is nothing to report', async () => {
    request.mockResolvedValue({ items: [] });
    render(<Diagnostics versionPaths={['/a']} />);
    await open();
    expect(screen.getByText(/No workload diagnostics/)).toBeTruthy();
  });

  it('does not refetch on subsequent opens once data is loaded', async () => {
    request.mockResolvedValue(
      deployment({ metadata: { namespace: 'ns' }, status: { conditions: [{ type: 'Ready', status: 'True' }] } }),
    );

    render(<Diagnostics versionPaths={['/a']} />);
    await open();
    fireEvent.click(screen.getByText('Hide Logs'));
    await open();

    expect(request).toHaveBeenCalledTimes(2); // deployment + events, once only
  });

  it('shows fallback message when fetch rejects', async () => {
    request.mockRejectedValueOnce(new Error('network error'));
    render(<Diagnostics versionPaths={['/a']} />);
    await open();
    expect(screen.getByText(/No workload diagnostics/)).toBeTruthy();
  });

  it('renders condition reason and message when present', async () => {
    request.mockResolvedValueOnce(
      deployment({
        metadata: { namespace: 'ns' },
        status: {
          conditions: [{ type: 'Available', status: 'False', reason: 'CrashLoopBackOff', message: 'container failed' }],
        },
      }),
    );
    request.mockResolvedValueOnce({ items: [] });

    render(<Diagnostics versionPaths={['/a']} />);
    await open();

    expect(screen.getByText('CrashLoopBackOff', { exact: false })).toBeTruthy();
    expect(screen.getByText(/container failed/)).toBeTruthy();
  });
});
