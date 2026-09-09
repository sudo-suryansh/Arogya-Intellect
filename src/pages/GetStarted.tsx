import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { resetProgress } from '../progress';
import '../styles/welcome.css'; // reuses .welcome__brand for the heading
import '../styles/get-started.css';

// Reached via the profile icon on Home. No account management yet - the
// only real action here is signing out, which mirrors SettingsMenu's
// handleSignOut: reset onboarding position (so reopening "/" doesn't
// bounce straight back), clear the languageSelected gate (so SettingsMenu
// hides again until Language is completed once more), then route back to
// Welcome. Reuses the settings.signOut string rather than adding a new
// translation key for the same label.
export default function GetStarted() {
  const { t, clearSelection } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = () => {
    resetProgress();
    clearSelection();
    navigate('/', { replace: true });
  };

  return (
    <main className="get-started flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="get-started__eyebrow">{t('getStarted.eyebrow')}</p>
      <h1 className="welcome__brand get-started__title">{t('getStarted.title')}</h1>
      <p className="get-started__body">{t('getStarted.body')}</p>
      <button type="button" className="get-started__signout" onClick={handleSignOut}>
        {t('settings.signOut')}
      </button>
    </main>
  );
}
