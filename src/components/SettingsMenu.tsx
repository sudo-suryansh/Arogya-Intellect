import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Adjust this import to match wherever your settings SVG actually lives -
// this assumes it's saved alongside the other icons in src/assets/.
import settingsIcon from '../assets/settings.svg';
import { useLanguage, type LanguageCode } from '../i18n/LanguageContext';
import { resetProgress } from '../progress';
import '../styles/settings.css';

// Keep in sync with the LANGUAGES array in pages/Language.tsx - same
// codes/names, just without the icon (the trigger button doesn't need
// per-language artwork, only the initial picker does).
const LANGUAGE_OPTIONS: { code: LanguageCode; nativeName: string; englishName: string }[] = [
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
];

// Top-right settings icon that opens a small language switcher + sign out.
// Gated on languageSelected so it's invisible on Welcome / SignIn /
// Language (pages 1-3) and only appears from Details (page 4) onward,
// once the user has actually picked a language for the first time.
export default function SettingsMenu() {
  const { language, languageSelected, setLanguage, clearSelection, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!languageSelected) return null;

  // Resets onboarding position (so reopening "/" doesn't bounce straight
  // back) and the languageSelected gate (so this menu hides again until
  // Language is completed once more), then routes to Welcome. There's no
  // real backend session yet - this is local-state-only "sign out" until
  // real auth is wired in.
  const handleSignOut = () => {
    setIsOpen(false);
    resetProgress();
    clearSelection();
    navigate('/', { replace: true });
  };

  return (
    <div className="settings-menu" ref={rootRef}>
      <button
        type="button"
        className="settings-menu__trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('settings.title')}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={settingsIcon} alt="" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="settings-menu__panel" role="menu">
          <p className="settings-menu__heading">{t('settings.language')}</p>
          <ul className="settings-menu__list">
            {LANGUAGE_OPTIONS.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={language === option.code}
                  className={`settings-menu__option${
                    language === option.code ? ' is-active' : ''
                  }`}
                  onClick={() => {
                    setLanguage(option.code);
                    setIsOpen(false);
                  }}
                >
                  <span className="settings-menu__option-native">{option.nativeName}</span>
                  <span className="settings-menu__option-english">{option.englishName}</span>
                  {language === option.code && (
                    <span className="settings-menu__check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="settings-menu__divider" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="settings-menu__signout"
            onClick={handleSignOut}
          >
            {t('settings.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
