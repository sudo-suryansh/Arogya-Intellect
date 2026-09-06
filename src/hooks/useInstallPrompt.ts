import { useEffect, useState, useCallback } from 'react';
import { shouldPromptInstall, isIos } from '../pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Drives the install nudge: decides whether to show it (mobile + not
// already installed), captures Android/Chrome's native install event so we
// can trigger it from our own button, and falls back to static
// instructions on iOS, which has no equivalent event or programmatic
// install API.
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldPromptInstall()) return;
    if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') return;

    // Android/Chrome: browser fires this instead of showing its own UI,
    // once install criteria (manifest, HTTPS, service worker) are met.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    // iOS Safari never fires beforeinstallprompt, so show our own
    // "here's how" card immediately instead of waiting for an event
    // that will never arrive.
    if (isIos()) {
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fires once install actually completes - covers both "installed via
    // our button" and "installed via the browser's own menu" cases.
    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredEvent(null);
      localStorage.setItem('pwa-installed', 'true');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }
    setDeferredEvent(null);
    setVisible(false);
  }, [deferredEvent]);

  const dismiss = useCallback(() => {
    setVisible(false);
    // Session-scoped on purpose: for an elderly/dementia-focused user base,
    // a single accidental dismiss shouldn't permanently hide this - they'll
    // just be asked again next visit rather than losing the option for good.
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  }, []);

  return {
    visible,
    promptInstall,
    dismiss,
    canUseNativePrompt: !!deferredEvent,
    isIos: isIos(),
  };
}
