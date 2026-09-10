import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { resetProgress } from '../progress';
import '../styles/welcome.css'; // reuses .welcome__brand for the heading
import '../styles/get-started.css';

// Reached via the profile icon on Home. No account management yet - the
// only real actions here are going back to Home (no state change) and
// signing out (mirrors SettingsMenu's handleSignOut: reset onboarding
// position so reopening "/" doesn't bounce straight back, clear the
// languageSelected gate so SettingsMenu hides again until Language is
// completed once more, then route to Welcome). Reuses getStarted.home and
// settings.signOut rather than adding new translation keys for either.
export default function GetStarted() {
  const { t, clearSelection } = useLanguage();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/home');
  };

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

      <div className="get-started__actions flex flex-col items-center">
        <button type="button" className="get-started__signout" onClick={handleSignOut}>
          {t('settings.signOut')}
        </button>
        <button type="button" className="get-started__back" onClick={handleBackToHome}>
          {t('getStarted.home')}
        </button>
      </div>
    </main>
  );
}