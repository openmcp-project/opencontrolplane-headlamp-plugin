import { kioskCss } from './kiosk.css';

// Default the namespace filter to "default" for the current cluster.
export function forceDefaultNamespace() {
  try {
    const match = window.location.pathname.match(/^\/c\/([^/]+)/);
    const cluster = match ? match[1] : null;
    if (!cluster) return;
    const key = `headlamp-selected-namespace_${cluster}`;
    const saved = localStorage.getItem(key);
    const current: string[] = saved ? JSON.parse(saved) : [];
    if (current.length === 0) {
      localStorage.setItem(key, JSON.stringify(['default']));
    }
  } catch (_) {}
}

// Force the sidebar into collapsed (icon-only) state.
export function forceSidebarCollapsed() {
  try {
    localStorage.setItem('sidebar', JSON.stringify({ shrink: true }));
  } catch (_) {}

  const tryDispatch = (): boolean => {
    try {
      const pluginLib = (window as any).pluginLib;
      if (!pluginLib) return false;
      const store = pluginLib['redux/stores/store']?.default;
      const sidebarSlice = pluginLib['components/Sidebar/sidebarSlice'];
      if (!store || !sidebarSlice?.setWhetherSidebarOpen) return false;
      store.dispatch(sidebarSlice.setWhetherSidebarOpen(false));
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!tryDispatch()) {
    let attempts = 0;
    const id = setInterval(() => {
      attempts++;
      if (tryDispatch() || attempts >= 20) clearInterval(id);
    }, 100);
  }
}

// Inject the kiosk chrome-removal + Fiori styling + OCP sidebar ordering CSS,
// and imperatively suppress alert/error banners that win specificity.
export function applyOCPStyles() {
  const gradient = 'linear-gradient(180deg, transparent 0%, rgba(240,253,250,0.35) 50%, transparent 100%)';
  [document.documentElement, document.body].forEach((el) => {
    el.style.setProperty('background-color', '#ffffff', 'important');
    el.style.setProperty('background-image', gradient, 'important');
    el.style.setProperty('min-height', '100vh', 'important');
  });

  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.style.setProperty('background', 'transparent', 'important');

  const root = document.getElementById('root');
  if (root) root.style.setProperty('background', 'transparent', 'important');

  const styleId = 'kiosk-mode-styles';
  document.getElementById(styleId)?.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = kioskCss();

  document.head.appendChild(style);

  // Belt-and-suspenders: imperatively suppress any alerts that win specificity
  document.querySelectorAll('[role="alert"], [class*="MuiAlert-root"]').forEach((el) => {
    (el as HTMLElement).style.setProperty('display', 'none', 'important');
  });

  // Suppress text-matched cluster-error banners inside <main>
  const main = document.querySelector('main');
  if (main) {
    Array.from(main.children).forEach((el) => {
      const text = (el as HTMLElement).textContent || '';
      if (text.includes('Something went wrong') || text.includes('Lost connection')) {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      }
    });
  }
}
