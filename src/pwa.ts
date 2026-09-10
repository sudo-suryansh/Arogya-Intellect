// ==========================================================================
// Device + PWA install-state helpers
//
// Used to decide when to show the "install as an app" nudge:
//   - Desktop                -> never prompt, app just works in-browser.
//   - Mobile, browser tab    -> prompt to install.
//   - Mobile, already a PWA  -> never prompt, already installed.
//
// Service worker registration itself now lives entirely in
// vite-plugin-pwa's auto-injected script (see vite.config.ts's
// VitePWA({ registerType: 'autoUpdate' }) - injectRegister defaults to
// 'auto', so nothing in this file or main.tsx needs to call
// navigator.serviceWorker.register() manually anymore.
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
