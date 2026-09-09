import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import masorTeImg from '../assets/remember/masor-te.webp';
import '../styles/remember.css';

type Step = 'photo' | 'gandhi' | 'done';

// Normalizes for a forgiving compare: lowercase, trim, collapse whitespace.
// Elders shouldn't get marked wrong over a stray space or capital letter.
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const ANSWER = 'masor tenga';

const GANDHI_OPTIONS = [
  { id: 'oct2', labelKey: 'remember.gandhi.oct2', correct: true },
  { id: 'aug15', labelKey: 'remember.gandhi.aug15', correct: false },
  { id: 'jan26', labelKey: 'remember.gandhi.jan26', correct: false },
  { id: 'nov14', labelKey: 'remember.gandhi.nov14', correct: false },
] as const;

export default function Remember() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('photo');

  const [photoGuess, setPhotoGuess] = useState('');
  const [photoWrong, setPhotoWrong] = useState(false);

  const [gandhiWrongId, setGandhiWrongId] = useState<string | null>(null);

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalize(photoGuess) === ANSWER) {
      setPhotoWrong(false);
      setStep('gandhi');
    } else {
      setPhotoWrong(true);
    }
  };

  const handleGandhiPick = (optionId: string, correct: boolean) => {
    if (correct) {
      setGandhiWrongId(null);
      setStep('done');
      // Let the tick animation play, then head home.
      window.setTimeout(() => navigate('/home'), 1400);
    } else {
      setGandhiWrongId(optionId);
    }
  };

  return (
    <main key={step} className="remember flex h-dvh min-h-dvh flex-col items-center overflow-hidden">
      <div className="remember__composition flex w-full flex-col items-center text-center">
        {step !== 'done' && (
          <button
            type="button"
            className="remember__back"
            aria-label={t('remember.back')}
            onClick={() => navigate('/home')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {step === 'photo' && (
          <>
            <p className="remember__step-count">{t('remember.stepOf').replace('{n}', '1')}</p>
            <h1 className="remember__question">{t('remember.photoQuestion')}</h1>

            <div className="remember__image-wrap">
              <img className="remember__image" src={masorTeImg} alt="" />
            </div>

            <form className="remember__form flex w-full flex-col items-center" onSubmit={handlePhotoSubmit}>
              <input
                className={`remember__big-input${photoWrong ? ' is-shake' : ''}`}
                type="text"
                value={photoGuess}
                onChange={(e) => {
                  setPhotoGuess(e.target.value);
                  if (photoWrong) setPhotoWrong(false);
                }}
                placeholder={t('remember.photoPlaceholder')}
                autoFocus
                autoComplete="off"
                onAnimationEnd={() => setPhotoWrong(false && photoWrong)}
              />

              {photoWrong && <p className="remember__feedback is-wrong">{t('remember.tryAgain')}</p>}

              <button type="submit" className="remember__submit inline-flex items-center justify-center">
                {t('remember.check')}
              </button>
            </form>
          </>
        )}

        {step === 'gandhi' && (
          <>
            <p className="remember__step-count">{t('remember.stepOf').replace('{n}', '2')}</p>
            <h1 className="remember__question">{t('remember.gandhiQuestion')}</h1>

            <div className="remember__options flex w-full flex-col">
              {GANDHI_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`remember__option${gandhiWrongId === opt.id ? ' is-wrong is-shake' : ''}`}
                  onClick={() => handleGandhiPick(opt.id, opt.correct)}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>

            {gandhiWrongId && <p className="remember__feedback is-wrong">{t('remember.tryAgain')}</p>}
          </>
        )}

        {step === 'done' && (
          <div className="remember__done flex flex-col items-center">
            <svg className="remember__tick" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle className="remember__tick-circle" cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
              <path className="remember__tick-check" d="M24 41l11 11 21-23" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="remember__done-text">{t('remember.wellDone')}</p>
          </div>
        )}
      </div>
    </main>
  );
}