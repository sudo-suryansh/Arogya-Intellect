import { useState } from 'react';
import { Link } from 'react-router-dom';
import couple from '../assets/language_selectionPage.png';
import bottomLandscape from '../assets/bottom.png';
import assameseIcon from '../assets/lang-icons/assamese.svg';
import hindiIcon from '../assets/lang-icons/hindi.svg';
import englishIcon from '../assets/lang-icons/english.svg';
import '../styles/language.css';

type LanguageCode = 'as' | 'en' | 'hi';

const LANGUAGES: { code: LanguageCode; nativeName: string; englishName: string; icon: string }[] = [
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', icon: assameseIcon },
  { code: 'en', nativeName: 'English', englishName: 'English', icon: englishIcon },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', icon: hindiIcon },
];

// Language selection screen - sits between SignIn ("Continue with Google")
// and Details (name/age/gender). UI ONLY for now: picking a card just sets
// local state below. It does NOT call i18n.changeLanguage() yet - see the
// TODO in handleContinue, which is exactly where that call belongs once
// src/i18n is wired in.
export default function Language() {
  const [selected, setSelected] = useState<LanguageCode | null>(null);
  const isComplete = selected !== null;

  const handleContinue = (e: React.MouseEvent) => {
    if (!isComplete) {
      e.preventDefault();
      return;
    }
    // TODO: once i18n is wired in, call i18n.changeLanguage(selected) here,
    // before/instead of relying on route navigation alone.
  };

  return (
    <main className="language flex min-h-dvh flex-col items-center justify-center">
      <div className="language__composition flex w-full flex-col items-center text-center">
        <h1 className="language__title">Choose Your Language</h1>

        {/* Pure-CSS crossfade: three stacked lines, each looping a 15s
            keyframe offset by 5s from the last, so exactly one is ever
            fully visible while its neighbor fades in/out underneath it.
            aria-label carries the one meaningful announcement for screen
            readers; the individual lines are hidden from the a11y tree so
            it doesn't read out three languages in a row. */}
        <div
          className="language__subtitle-cycle"
          aria-label="Select the language you are most comfortable with"
        >
          <span className="language__subtitle-line" lang="en" aria-hidden="true">
            Select the language you are most comfortable with
          </span>
          <span className="language__subtitle-line" lang="hi" aria-hidden="true">
            आप जिस भाषा में सबसे सहज हैं, उसे चुनें
          </span>
          <span className="language__subtitle-line" lang="as" aria-hidden="true">
            আপুনি আটাইতকৈ সহজ অনুভৱ কৰা ভাষাটো বাছক
          </span>
        </div>

        <div className="language__illustration-wrap">
          <img
            className="language__illustration"
            src={couple}
            alt="An elderly man and woman smiling warmly, one saying Hello and the other saying Nomoskar."
            width={1775}
            height={886}
          />
        </div>

        <div
          className="language__grid grid grid-cols-3 w-full"
          role="radiogroup"
          aria-label="Choose your language"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={selected === lang.code}
              className={`language__card flex flex-col items-center${
                selected === lang.code ? ' is-selected' : ''
              }`}
              onClick={() => setSelected(lang.code)}
            >
              {selected === lang.code && (
                <span className="language__check" aria-hidden="true">
                  ✓
                </span>
              )}
              <span className="language__icon-tile">
                <img src={lang.icon} alt="" aria-hidden="true" />
              </span>
              <span className="language__card-native">{lang.nativeName}</span>
              <span className="language__card-english">{lang.englishName}</span>
            </button>
          ))}
        </div>

        <Link
          to={isComplete ? '/details' : '#'}
          aria-disabled={!isComplete}
          className={`language__continue inline-flex items-center justify-center no-underline${
            isComplete ? '' : ' is-disabled'
          }`}
          onClick={handleContinue}
        >
          <span>Continue</span>
          <span className="language__continue-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <img
        className="language__bottom-landscape pointer-events-none select-none absolute"
        src={bottomLandscape}
        alt=""
        aria-hidden="true"
        width={2171}
        height={724}
      />
    </main>
  );
}