import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import '../styles/welcome.css'; // reuses .welcome__brand for the heading
import '../styles/get-started.css';

// Placeholder-only screen for the /get-started route. This file is meant
// to be replaced entirely once the next stage of the app is built -
// nothing here is shared by welcome.css, so swapping it out later is a
// clean, single-file/route change. Ported from the original
// get-started.html (inline <style> block migrated to get-started.css +
// Tailwind utilities).
export default function GetStarted() {
  const { t } = useLanguage();

  return (
    <main className="get-started flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="get-started__eyebrow">{t('getStarted.eyebrow')}</p>
      <h1 className="welcome__brand get-started__title">{t('getStarted.title')}</h1>
      <p className="get-started__body">{t('getStarted.body')}</p>
      <Link to="/" className="get-started__back inline-flex items-center no-underline">
        {t('getStarted.back')}
      </Link>
    </main>
  );
}
