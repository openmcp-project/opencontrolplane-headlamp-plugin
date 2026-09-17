import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailsMenu } from '../ui/DetailsMenu';
import type { ComponentStatus } from '../components';

vi.mock('../host-bridge', () => ({
  canInstall: vi.fn(),
  detectMode: vi.fn(),
  requestInstallWizard: vi.fn(),
  openDocumentation: vi.fn(),
}));

import { canInstall, detectMode, requestInstallWizard, openDocumentation } from '../host-bridge';
import React from 'react';
const mockCanInstall = canInstall as ReturnType<typeof vi.fn>;
const mockDetectMode = detectMode as ReturnType<typeof vi.fn>;
const mockRequestInstallWizard = requestInstallWizard as ReturnType<typeof vi.fn>;
const mockOpenDocumentation = openDocumentation as ReturnType<typeof vi.fn>;

const crossplane: ComponentStatus = {
  name: 'crossplane',
  label: 'Crossplane',
  installed: true,
  version: 'v1.15.0',
  docsUrl: 'https://docs.crossplane.io',
  phase: 'Ready',
  versionPaths: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDetectMode.mockReturnValue('unknown');
  mockCanInstall.mockReturnValue(false);
});

// In the test environment pluginLib.MuiCore is empty so DetailsMenu renders
// its native <select> fallback instead of the MUI Button+Menu variant.
const getSelect = () => screen.getByRole('combobox');

describe('DetailsMenu', () => {
  it('renders the native select with a Details placeholder', () => {
    render(<DetailsMenu component={crossplane} />);
    expect(getSelect()).toBeTruthy();
    expect(screen.getByText('Details ›')).toBeTruthy();
  });

  it('does not include Install Service when canInstall returns false', () => {
    render(<DetailsMenu component={crossplane} />);
    expect(screen.queryByText('Install Service')).toBeFalsy();
  });

  it('includes Install Service when canInstall returns true', () => {
    mockDetectMode.mockReturnValue('v2');
    mockCanInstall.mockReturnValue(true);
    render(<DetailsMenu component={crossplane} />);
    expect(screen.getByText('Install Service')).toBeTruthy();
  });

  it('always includes Open Documentation regardless of mode', () => {
    render(<DetailsMenu component={crossplane} />);
    expect(screen.getByText('Open Documentation')).toBeTruthy();
  });

  it('calls requestInstallWizard with the component name on Install Service select', () => {
    mockDetectMode.mockReturnValue('v1');
    mockCanInstall.mockReturnValue(true);
    render(<DetailsMenu component={crossplane} />);
    fireEvent.change(getSelect(), { target: { value: 'install' } });
    expect(mockRequestInstallWizard).toHaveBeenCalledWith('crossplane');
    expect(mockRequestInstallWizard).toHaveBeenCalledTimes(1);
  });

  it('calls openDocumentation with the component docsUrl on Open Documentation select', () => {
    render(<DetailsMenu component={crossplane} />);
    fireEvent.change(getSelect(), { target: { value: 'docs' } });
    expect(mockOpenDocumentation).toHaveBeenCalledWith('https://docs.crossplane.io');
    expect(mockOpenDocumentation).toHaveBeenCalledTimes(1);
  });

  it('checks canInstall with the component name and the current mode', () => {
    mockDetectMode.mockReturnValue('v2');
    render(<DetailsMenu component={crossplane} />);
    expect(mockDetectMode).toHaveBeenCalled();
    expect(mockCanInstall).toHaveBeenCalledWith('crossplane', 'v2');
  });
});
