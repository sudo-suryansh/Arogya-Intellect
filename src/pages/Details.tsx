import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useLanguage } from '../i18n/LanguageContext';
import '../styles/details.css';

// Stable codes, not display text - the display label is looked up via
// t(`details.genders.${code}`) below, so which language is active never
// changes what actually gets stored in state (or, later, sent to a
// backend). Previously this stored the English label itself ('Female'),
// which would have silently changed meaning if it were saved while a
// different language was active.
const GENDER_CODES = ['female', 'male', 'preferNotToSay'] as const;

// Name / age / gender screen, shown right after the Google sign-in step.
// No backend save yet - Continue just navigates once all fields are filled.
export default function Details() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const isComplete = name.trim().length > 0 && age !== '' && gender !== '';

  return (
    <main className="details flex min-h-dvh flex-col items-center justify-center">
      <div className="details__composition flex w-full flex-col items-center text-center">
        <div className="details__logo-wrap">
          <img
            className="w-full h-auto"
            src={logo}
            alt="Arogya Intellect logo"
            width={1402}
            height={1122}
          />
        </div>

        <h1 className="details__title">{t('details.title')}</h1>
        <p className="details__subtitle">{t('details.subtitle')}</p>

        <form className="details__form flex w-full flex-col" onSubmit={(e) => e.preventDefault()}>
          <label className="details__field">
            <span className="details__label">{t('details.nameLabel')}</span>
            <input
              className="details__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('details.namePlaceholder')}
              autoComplete="name"
            />
          </label>

          <label className="details__field">
            <span className="details__label">{t('details.ageLabel')}</span>
            <select
              className="details__input details__select"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="" disabled>
                {t('details.agePlaceholder')}
              </option>
              {Array.from({ length: 83 }, (_, i) => i + 18).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="details__field">
            <span className="details__label">{t('details.genderLabel')}</span>
            <div className="details__pill-group" role="radiogroup" aria-label={t('details.genderLabel')}>
              {GENDER_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={gender === code}
                  className={`details__pill${gender === code ? ' is-selected' : ''}`}
                  onClick={() => setGender(code)}
                >
                  {t(`details.genders.${code}`)}
                </button>
              ))}
            </div>
          </div>

          <Link
            to={isComplete ? '/get-started' : '#'}
            aria-disabled={!isComplete}
            className={`details__continue inline-flex items-center justify-center no-underline${
              isComplete ? '' : ' is-disabled'
            }`}
            onClick={(e) => {
              if (!isComplete) e.preventDefault();
            }}
          >
            {t('details.continue')}
          </Link>
        </form>
      </div>
    </main>
  );
}
