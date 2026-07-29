// MUI components the Headlamp host exposes at runtime via `window.pluginLib`.
// May be undefined if the host hasn't exposed them, so consumers must guard.
const MuiCore = (window as any).pluginLib?.MuiCore ?? {};

export const { Chip, Button, Menu, MenuItem } = MuiCore;
