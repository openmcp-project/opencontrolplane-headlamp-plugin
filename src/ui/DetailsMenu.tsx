import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '../mui';
import { ComponentStatus } from '../components';
import { canInstall, detectMode, openDocumentation, requestInstallWizard } from '../host-bridge';

// "Details" dropdown in the Actions column: Install Service (mode-gated) + Open Documentation.
export function DetailsMenu({ component }: { component: ComponentStatus }) {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  const items = [
    ...(canInstall(component.name, detectMode())
      ? [{ key: 'install', label: 'Install Service', onClick: () => requestInstallWizard(component.name) }]
      : []),
    { key: 'docs', label: 'Open Documentation', onClick: () => openDocumentation(component.docsUrl) },
  ];

  // MUI is available at runtime via pluginLib; fall back to a native <select> if not.
  if (Button && Menu && MenuItem) {
    return (
      <>
        <Button
          size="small"
          variant="outlined"
          endIcon={<span style={{ fontSize: 16, lineHeight: 1 }}>›</span>}
          onClick={(e: any) => setAnchorEl(e.currentTarget)}
        >
          Details
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          {items.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                setAnchorEl(null);
                item.onClick();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Fallback: native <select> acting as a lightweight dropdown.
  return (
    <select
      style={{ fontSize: 13, padding: '2px 6px' }}
      value=""
      onChange={(e) => {
        const chosen = items.find((i) => i.key === e.target.value);
        e.target.value = '';
        chosen?.onClick();
      }}
    >
      <option value="" disabled>
        Details ›
      </option>
      {items.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
