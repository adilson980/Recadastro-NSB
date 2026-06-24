import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error logger overlay for iframe/sandbox debugging
if (typeof window !== 'undefined') {
  const handleError = (msg: string, url: string, line: number, col: number, error: any) => {
    const existing = document.getElementById('debug-error-overlay');
    if (existing) return; // avoid duplicate overlays

    const container = document.createElement('div');
    container.id = 'debug-error-overlay';
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.zIndex = '999999';
    container.style.backgroundColor = '#1e293b';
    container.style.color = '#f87171';
    container.style.padding = '12px';
    container.style.borderRadius = '8px';
    container.style.border = '1px solid #ef4444';
    container.style.maxWidth = '450px';
    container.style.fontSize = '12px';
    container.style.fontFamily = 'monospace';
    container.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
    container.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px; display: flex; justify-content: space-between;">
        <span>Runtime Error:</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-weight: bold;">✕</button>
      </div>
      <div style="margin-bottom: 6px; font-weight: 500;">${msg}</div>
      <div style="color: #94a3b8; font-size: 10px;">Source: ${url || 'Unknown'}:${line}:${col}</div>
      ${error && error.stack ? `<pre style="white-space: pre-wrap; margin-top: 8px; color: #cbd5e1; font-size: 10px; max-height: 150px; overflow-y: auto; background-color: #0f172a; padding: 6px; border-radius: 4px;">${error.stack}</pre>` : ''}
    `;
    document.body.appendChild(container);
  };

  window.onerror = (message, source, lineno, colno, error) => {
    const msgStr = String(message).toLowerCase();
    if (msgStr.includes('script error') || msgStr === 'script error.') {
      console.warn('Suppressed cross-origin Script error in sandboxed iframe environment:', message);
      return true; // prevent error bubbling up as uncaught script error
    }
    handleError(String(message), String(source), lineno || 0, colno || 0, error);
    return false;
  };

  window.addEventListener('error', (event) => {
    const msgStr = String(event.message || '').toLowerCase();
    if (msgStr.includes('script error') || msgStr === 'script error.') {
      console.warn('Suppressed uncaught Script error event in sandboxed iframe:', event);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = String(event.reason?.message || event.reason).toLowerCase();
    if (reasonMsg.includes('script error') || reasonMsg === 'script error.') {
      console.warn('Suppressed unhandled rejection Script error in sandboxed iframe:', event.reason);
      return;
    }
    handleError(
      `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
      '',
      0,
      0,
      event.reason
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

