import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import '../styles/reminders.css';

type Reminder = {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
};

type Step = 'list' | 'title' | 'date' | 'time';

const STORAGE_KEY = 'fast6.reminders';

function loadReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReminders(reminders: Reminder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortReminders(list: Reminder[]): Reminder[] {
  return [...list].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

export default function Reminders() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState<Reminder[]>(() => sortReminders(loadReminders()));
  const [step, setStep] = useState<Step>('list');

  // Only used while walking through the add flow - cleared on cancel or save.
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const resetDraft = () => {
    setDraftTitle('');
    setDraftDate('');
    setDraftTime('');
  };

  const handleStartAdd = () => setStep('title');

  const handleCancel = () => {
    resetDraft();
    setStep('list');
  };

  const handleSave = () => {
    const next: Reminder = {
      id: makeId(),
      title: draftTitle.trim(),
      date: draftDate,
      time: draftTime,
    };
    const updated = sortReminders([...reminders, next]);
    setReminders(updated);
    saveReminders(updated);
    resetDraft();
    setStep('list');
  };

  const handleRemove = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const formatWhen = (r: Reminder) => {
    const d = new Date(`${r.date}T${r.time}`);
    if (Number.isNaN(d.getTime())) return `${r.date} ${r.time}`;
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // ---- Step screens: one question, one big Next button ----

  if (step === 'title' || step === 'date' || step === 'time') {
    const stepNumber = step === 'title' ? 1 : step === 'date' ? 2 : 3;
    const canProceed =
      (step === 'title' && draftTitle.trim().length > 0) ||
      (step === 'date' && draftDate !== '') ||
      (step === 'time' && draftTime !== '');

    const handleNext = () => {
      if (!canProceed) return;
      if (step === 'title') setStep('date');
      else if (step === 'date') setStep('time');
      else handleSave();
    };

    const handleBack = () => {
      if (step === 'title') handleCancel();
      else if (step === 'date') setStep('title');
      else setStep('date');
    };

    return (
      <main
        key={step}
        className="reminders reminders--step flex h-dvh min-h-dvh flex-col items-center overflow-hidden"
      >
        <div className="reminders__composition reminders__composition--step flex w-full flex-col items-start text-left">
          <button
            type="button"
            className="reminders__back"
            aria-label={t('reminders.back')}
            onClick={handleBack}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="reminders__step-count">{t('reminders.stepOf').replace('{n}', String(stepNumber))}</p>

          <div className="reminders__step-body flex w-full flex-col items-start justify-center">
            {step === 'title' && (
              <>
                <h1 className="reminders__step-question">{t('reminders.step1Question')}</h1>
                <input
                  className="reminders__big-input"
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={t('reminders.titlePlaceholder')}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
              </>
            )}

            {step === 'date' && (
              <>
                <h1 className="reminders__step-question">{t('reminders.step2Question')}</h1>
                <input
                  className="reminders__big-input"
                  type="date"
                  value={draftDate}
                  min={todayStr}
                  onChange={(e) => setDraftDate(e.target.value)}
                  autoFocus
                />
              </>
            )}

            {step === 'time' && (
              <>
                <h1 className="reminders__step-question">{t('reminders.step3Question')}</h1>
                <input
                  className="reminders__big-input"
                  type="time"
                  value={draftTime}
                  onChange={(e) => setDraftTime(e.target.value)}
                  autoFocus
                />
              </>
            )}
          </div>

          <button
            type="button"
            className={`reminders__next inline-flex items-center justify-center${canProceed ? '' : ' is-disabled'}`}
            disabled={!canProceed}
            onClick={handleNext}
          >
            {step === 'time' ? t('reminders.save') : t('reminders.next')}
          </button>
        </div>
      </main>
    );
  }

  // ---- List screen ----

  return (
    <main className="reminders flex h-dvh min-h-dvh flex-col items-center overflow-hidden">
      <div className="reminders__composition flex w-full flex-col items-start text-left">
        <button
          type="button"
          className="reminders__back"
          aria-label={t('reminders.back')}
          onClick={() => navigate('/home')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="reminders__title">{t('reminders.title')}</h1>
        <p className="reminders__subtitle">{t('reminders.subtitle')}</p>

        <button type="button" className="reminders__add-cta flex w-full items-center justify-center" onClick={handleStartAdd}>
          <span className="reminders__add-cta-icon" aria-hidden="true">+</span>
          <span>{t('reminders.addReminder')}</span>
        </button>

        <ul className="reminders__list flex w-full flex-col" aria-label={t('reminders.listLabel')}>
          {reminders.length === 0 && (
            <li className="reminders__empty">{t('reminders.emptyState')}</li>
          )}
          {reminders.map((r) => (
            <li key={r.id} className="reminders__item flex w-full items-center">
              <div className="reminders__item-text flex flex-col">
                <span className="reminders__item-title">{r.title}</span>
                <span className="reminders__item-when">{formatWhen(r)}</span>
              </div>
              <button
                type="button"
                className="reminders__remove"
                aria-label={t('reminders.removeLabel')}
                onClick={() => handleRemove(r.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}