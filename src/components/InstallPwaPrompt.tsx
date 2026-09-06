import { useInstallPrompt } from '../hooks/useInstallPrompt';
import '../styles/install-pwa-prompt.css';

// Mobile-only install nudge. Renders nothing on desktop and nothing once
// the app is already running as an installed PWA - see shouldPromptInstall
// in src/pwa.ts for the exact condition.
export default function InstallPwaPrompt() {
  const { visible, promptInstall, dismiss, canUseNativePrompt, isIos } = useInstallPrompt();

  if (!visible) return null;

  return (
    <div className="install-pwa" role="dialog" aria-label="Install app">
      <div className="install-pwa__card">
        <p className="install-pwa__title">Add Arogya Intellect to your Home Screen</p>

        {isIos ? (
          <p className="install-pwa__body">
            Tap the Share icon <span aria-hidden="true">⬆️</span>, then choose
            "Add to Home Screen" so it opens like an app next time.
          </p>
        ) : (
          <p className="install-pwa__body">
            Install it for quicker access and a smoother, full-screen experience.
          </p>
        )}

        <div className="install-pwa__actions">
          {canUseNativePrompt && (
            <button type="button" className="install-pwa__install" onClick={promptInstall}>
              Install
            </button>
          )}
          <button type="button" className="install-pwa__dismiss" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
