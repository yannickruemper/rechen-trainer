import { init } from './ui.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Service Worker nur über http(s) registrieren – bei lokalem Doppelklick auf
// index.html (file://) unterstützen Browser keine Service Worker.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // Offline-Unterstützung ist ein Komfort-Feature – die Seite funktioniert auch ohne.
    });
  });
}
