// Registers the service worker so the shell (currently just the welcome
// page and its assets) is available offline once visited. Fails silently
// on browsers without support - the app still works fully online.
//
// Kept as a manual registration (matching the original static prototype)
// until this is migrated to vite-plugin-pwa, per the migration plan.
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// ==========================================================================
// Device + PWA install-state helpers
//
// Used to decide when to show the "install as an app" nudge:
//   - Desktop                -> never prompt, app just works in-browser.
//   - Mobile, browser tab    -> prompt to install.
//   - Mobile, already a PWA  -> never prompt, already installed.
// ==========================================================================

export function isMobileDevice(): boolean {
  // UA check + a coarse-pointer fallback, since some mobile browsers (and
  // some desktop devtools emulation) don't always agree on UA alone.
  const uaIsMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return uaIsMobile || isCoarsePointer;
}

export function isRunningAsPwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    // iOS Safari's older, non-standard flag - iOS never fires
    // beforeinstallprompt or matches display-mode reliably pre-install,
    // but once added to home screen, this becomes true.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !('MSStream' in window)
  );
}

// Should we show our own "install this app" nudge right now?
// True only for: mobile device, browser tab (not already a PWA).
export function shouldPromptInstall(): boolean {
  return isMobileDevice() && !isRunningAsPwa();
}
