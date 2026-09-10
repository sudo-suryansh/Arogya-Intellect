import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import masorTeImg from '../assets/remember/masor-te.webp';
import '../styles/remember.css';

// ==========================================================================
// Question bank
//
// The engine below (shuffling, scoring, right/wrong UX) doesn't care how
// many questions are here or what mix of types - it always shows 5,
// shuffled fresh each time this page mounts (= each session).
//
// 'photo' and 'gandhi' are the two original questions, ported over with
// the exact same copy, images, and right/wrong behavior they already had.
// The other three are common Indian civic/national-symbol facts. Text
// answers are compared case/whitespace-loosely (see normalize()), same
// as the photo question always has been.
// ==========================================================================

type TextQuestion = {
  id: string;
  type: 'text';
  questionKey: string;
  placeholderKey: string;
  imageSrc?: string;
  imageAlt?: string;
  answer: string;
};

type ChoiceQuestion = {
  id: string;
  type: 'choice';
  questionKey: string;
  options: { id: string; labelKey: string; correct: boolean }[];
};

type Question = TextQuestion | ChoiceQuestion;

const QUESTION_BANK: Question[] = [
  {
    id: 'photo',
    type: 'text',
    questionKey: 'remember.photoQuestion',
    placeholderKey: 'remember.photoPlaceholder',
    imageSrc: masorTeImg,
    imageAlt: '',
    answer: 'masor tenga',
  },
  {
    id: 'gandhi',
    type: 'choice',
    questionKey: 'remember.gandhiQuestion',
    options: [
      { id: 'oct2', labelKey: 'remember.gandhi.oct2', correct: true },
      { id: 'aug15', labelKey: 'remember.gandhi.aug15', correct: false },
      { id: 'jan26', labelKey: 'remember.gandhi.jan26', correct: false },
      { id: 'nov14', labelKey: 'remember.gandhi.nov14', correct: false },
    ],
  },
  // --- Indian civic/national-symbol facts - the kind of thing meant by
  // "everyone knows this" for this audience. Kept deliberately simple and
  // unambiguous (official national symbols, the capital) rather than
  // anything with regional variation or debate, since a wrong "correct"
  // answer here is worse than no question at all. ---
  {
    id: 'nationalAnimal',
    type: 'text',
    questionKey: 'remember.nationalAnimalQuestion',
    placeholderKey: 'remember.nationalAnimalPlaceholder',
    answer: 'tiger',
  },
  {
    id: 'capital',
    type: 'choice',
    questionKey: 'remember.capitalQuestion',
    options: [
      { id: 'newDelhi', labelKey: 'remember.capital.newDelhi', correct: true },
      { id: 'mumbai', labelKey: 'remember.capital.mumbai', correct: false },
      { id: 'kolkata', labelKey: 'remember.capital.kolkata', correct: false },
      { id: 'chennai', labelKey: 'remember.capital.chennai', correct: false },
    ],
  },
  {
    id: 'nationalBird',
    type: 'text',
    questionKey: 'remember.nationalBirdQuestion',
    placeholderKey: 'remember.nationalBirdPlaceholder',
    answer: 'peacock',
  },
];

const SCORE_HISTORY_KEY = 'fast6.rememberScores';
const MAX_HISTORY = 20;

// Normalizes for a forgiving compare: lowercase, trim, collapse whitespace.
// Elders shouldn't get marked wrong over a stray space or capital letter.
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadScoreHistory(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SCORE_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function saveScoreHistory(history: number[]): void {
  window.localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
}

export default function Remember() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Shuffled exactly once, on mount - reopening this page (a new session)
  // reshuffles, since the component remounts fresh from Home each time.
  const [questions] = useState<Question[]>(() => shuffle(QUESTION_BANK).slice(0, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakeOnCurrent, setMistakeOnCurrent] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  const [textGuess, setTextGuess] = useState('');
  const [textWrong, setTextWrong] = useState(false);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Called the moment a question is answered correctly (from either
  // question type below). wasCorrectFirstTry decides whether it counts
  // toward the score - getting it right on a retry still lets you
  // proceed, it just doesn't add a point, same idea as a quiz.
  const advance = (wasCorrectFirstTry: boolean) => {
    if (isLast) {
      const finalScore = wasCorrectFirstTry ? score + 1 : score;
      const history = loadScoreHistory();
      setPreviousScore(history.length > 0 ? history[history.length - 1] : null);
      saveScoreHistory([...history, finalScore]);
      if (wasCorrectFirstTry) setScore(finalScore);
      setFinished(true);
      return;
    }

    if (wasCorrectFirstTry) setScore((s) => s + 1);
    setCurrentIndex((i) => i + 1);
    setMistakeOnCurrent(false);
    setTextGuess('');
    setTextWrong(false);
    setWrongOptionId(null);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (current.type !== 'text') return;
    if (normalize(textGuess) === current.answer) {
      setTextWrong(false);
      advance(!mistakeOnCurrent);
    } else {
      setTextWrong(true);
      setMistakeOnCurrent(true);
    }
  };

  const handleChoicePick = (optionId: string, correct: boolean) => {
    if (correct) {
      setWrongOptionId(null);
      advance(!mistakeOnCurrent);
    } else {
      setWrongOptionId(optionId);
      setMistakeOnCurrent(true);
    }
  };

  const delta = previousScore === null ? null : score - previousScore;

  return (
    <main
      key={finished ? 'done' : current.id}
      className="remember flex h-dvh min-h-dvh flex-col items-center overflow-hidden"
    >
      <div className="remember__composition flex w-full flex-col items-center text-center">
        {!finished && (
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

        {!finished && (
          <p className="remember__step-count">
            {t('remember.stepOf')
              .replace('{n}', String(currentIndex + 1))
              .replace('{total}', String(questions.length))}
          </p>
        )}

        {!finished && current.type === 'text' && (
          <>
            <h1 className="remember__question">{t(current.questionKey)}</h1>

            {current.imageSrc && (
              <div className="remember__image-wrap">
                <img className="remember__image" src={current.imageSrc} alt={current.imageAlt ?? ''} />
              </div>
            )}

            <form className="remember__form flex w-full flex-col items-center" onSubmit={handleTextSubmit}>
              <input
                className={`remember__big-input${textWrong ? ' is-shake' : ''}`}
                type="text"
                value={textGuess}
                onChange={(e) => {
                  setTextGuess(e.target.value);
                  if (textWrong) setTextWrong(false);
                }}
                placeholder={t(current.placeholderKey)}
                autoFocus
                autoComplete="off"
                onAnimationEnd={() => setTextWrong(false && textWrong)}
              />

              {textWrong && <p className="remember__feedback is-wrong">{t('remember.tryAgain')}</p>}

              <button type="submit" className="remember__submit inline-flex items-center justify-center">
                {t('remember.check')}
              </button>
            </form>
          </>
        )}

        {!finished && current.type === 'choice' && (
          <>
            <h1 className="remember__question">{t(current.questionKey)}</h1>

            <div className="remember__options flex w-full flex-col">
              {current.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`remember__option${wrongOptionId === opt.id ? ' is-wrong is-shake' : ''}`}
                  onClick={() => handleChoicePick(opt.id, opt.correct)}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>

            {wrongOptionId && <p className="remember__feedback is-wrong">{t('remember.tryAgain')}</p>}
          </>
        )}

        {finished && (
          <div className="remember__done flex flex-col items-center">
            <svg className="remember__tick" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle className="remember__tick-circle" cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
              <path className="remember__tick-check" d="M24 41l11 11 21-23" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="remember__done-text">{t('remember.wellDone')}</p>

            <p className="remember__score">
              {t('remember.scoreLine')
                .replace('{score}', String(score))
                .replace('{total}', String(questions.length))}
            </p>

            <p className="remember__score-delta">
              {previousScore === null
                ? t('remember.firstSession')
                : delta === 0
                  ? t('remember.sameAsLastTime')
                  : delta! > 0
                    ? t('remember.improvedBy').replace('{n}', String(delta))
                    : t('remember.droppedBy').replace('{n}', String(Math.abs(delta!)))}
            </p>

            <button
              type="button"
              className="remember__continue inline-flex items-center justify-center"
              onClick={() => navigate('/home')}
            >
              {t('common.continue')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
