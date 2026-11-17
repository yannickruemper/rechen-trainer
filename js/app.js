import { init } from './ui.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Service Worker nur über http(s) registrieren – bei lokalem Doppelklick auf
// index.html (file://) unterstützen Browser keine Service Worker.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  // Der Service Worker ruft bei einer neuen Version self.skipWaiting() +
  // clients.claim() auf (siehe service-worker.js), wodurch "controllerchange"
  // feuert. Darauf reagieren wir mit einem automatischen Reload, damit als
  // PWA installierte Nutzer:innen Updates bekommen, ohne die App neu zu
  // installieren oder manuell neu zu laden.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((registration) => {
      // Browser prüfen von sich aus nur selten/verzögert auf ein neues
      // service-worker.js (v. a. bei einer länger offenen/aus dem Hintergrund
      // zurückgeholten PWA). Deshalb stoßen wir die Prüfung aktiv an, sobald
      // die App wieder sichtbar wird, sowie in einem groben Intervall.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
      setInterval(() => registration.update(), 60 * 60 * 1000);
    }).catch(() => {
      // Offline-Unterstützung ist ein Komfort-Feature – die Seite funktioniert auch ohne.
    });
  });
}
