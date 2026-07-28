(global as any).window = global;
(global as any).pluginLib = { MuiCore: {}, ApiProxy: { request: () => Promise.resolve({ items: [] }) } };
(global as any).headlampBaseUrl = '';
