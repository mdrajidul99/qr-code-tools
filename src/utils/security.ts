/**
 * Client-Side Source Protection & Anti-Inspection Guard
 * 
 * - Disables source viewing shortcuts (Ctrl+U, F12, Ctrl+Shift+I/J/C)
 * - Disables right-click context menu (while preserving copy/paste inside input & textarea)
 * - Disables Save Page shortcut (Ctrl+S)
 * - Emits a console warning to discourage inspection
 */

export function initSourceProtection(onNotify?: (msg: string) => void): () => void {
  // 1. Right-Click Context Menu Guard
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    // Allow right click inside text inputs or textareas for copy/paste convenience
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }
    e.preventDefault();
    if (onNotify) {
      onNotify('Right-click inspection is disabled.');
    }
  };

  // 2. Keyboard Shortcuts Guard
  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    // F12 -> DevTools
    if (e.key === 'F12') {
      e.preventDefault();
      if (onNotify) onNotify('Developer tools are disabled.');
      return;
    }

    // Ctrl+U / Cmd+U -> View Source
    if (isCtrlOrMeta && key === 'u') {
      e.preventDefault();
      if (onNotify) onNotify('Source viewing is disabled.');
      return;
    }

    // Ctrl+S / Cmd+S -> Save Page
    if (isCtrlOrMeta && key === 's') {
      e.preventDefault();
      return;
    }

    // Ctrl+Shift+I / Cmd+Option+I -> Inspect Element
    // Ctrl+Shift+J / Cmd+Option+J -> Console
    // Ctrl+Shift+C / Cmd+Option+C -> Inspect Element Selector
    if (isCtrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      if (onNotify) onNotify('Developer tools are disabled.');
      return;
    }

    // Alt+Cmd+I / Alt+Cmd+J on Mac Safari
    if (e.altKey && e.metaKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u')) {
      e.preventDefault();
      if (onNotify) onNotify('Developer tools are disabled.');
      return;
    }
  };

  // 3. Console Security Banner
  try {
    const styleTitle = 'color: #ef4444; font-size: 28px; font-weight: 800; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);';
    const styleBody = 'color: #64748b; font-size: 14px; font-weight: 600;';
    console.log('%c⛔ STOP!', styleTitle);
    console.log('%cThis web application source code is protected and minified.', styleBody);
  } catch {
    // ignore
  }

  // Attach event listeners
  document.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
  };
}
