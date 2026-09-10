import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import gamesIcon from '../assets/games-icon.svg';
import remindersIcon from '../assets/reminders-icon.svg';
import rememberIcon from '../assets/remember-icon.svg';
import arogyaAiIcon from '../assets/arogya-ai.svg';
import sosIcon from '../assets/sos-call.svg';
import '../styles/home.css';

const SOS_HOLD_MS = 3000;

// Reads the name Details.tsx now stashes in localStorage on Continue.
// Falls back to a name-less greeting if it's not there yet.
function useUserName(): string | null {
  const [name] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem('fast6.userName'),
  );
  return name && name.length > 0 ? name : null;
}

type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

function getGreetingPeriod(hour: number): GreetingPeriod {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const name = useUserName();
  const [period, setPeriod] = useState<GreetingPeriod>(() => getGreetingPeriod(new Date().getHours()));

  // Re-check every minute so a session left open across a boundary
  // (11:59am -> 12:00pm) flips without a reload.
  useEffect(() => {
    const id = window.setInterval(() => setPeriod(getGreetingPeriod(new Date().getHours())), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const greeting = useMemo(() => {
    const base = t(`home.greeting.${period}`);
    return name ? `${base}, ${name}!` : `${base}!`;
  }, [t, period, name]);

  const actions = [
    { key: 'games', icon: gamesIcon, labelKey: 'home.games', path: '/get-started' },
    { key: 'reminders', icon: remindersIcon, labelKey: 'home.reminders', path: '/reminders' },
    { key: 'remember', icon: rememberIcon, labelKey: 'home.remember', path: '/remember' },
    { key: 'arogya-ai', icon: arogyaAiIcon, labelKey: 'home.arogyaAi', path: '/get-started' },
  ] as const;

  // ---- Hold-to-call SOS ---------------------------------------------
  // Fill is driven straight on the DOM node via a CSS custom property
  // every animation frame (not React state) so the 3s hold stays at
  // 60fps with no re-render cost. React state only tracks the coarse
  // "is anyone holding / did it just complete" flags the UI needs.
  const sosFillRef = useRef<HTMLSpanElement>(null);
  const sosOverlayRef = useRef<HTMLDivElement>(null);
  const sosButtonRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const hasNavigatedRef = useRef(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const setFillProgress = (value: number) => {
    sosOverlayRef.current?.style.setProperty('--sos-progress', String(value));
  };

  const tick = (timestamp: number) => {
    if (startRef.current === null) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;
    const progress = Math.min(elapsed / SOS_HOLD_MS, 1);
    setFillProgress(progress);

    if (progress >= 1) {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        setIsComplete(true);
        // Small delay so the completion pulse is actually visible
        // before the route change unmounts this page.
        window.setTimeout(() => navigate('/get-started'), 320);
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startHold = () => {
    if (hasNavigatedRef.current) return;
     // Anchor the circular reveal to wherever the SOS button actually sits
    // (it can be scrolled anywhere on this page), and size it to the
    // furthest viewport corner so full-cover always looks complete
    // regardless of screen size or where the button is.
    const btn = sosButtonRef.current;
    const overlay = sosOverlayRef.current;
    if (btn && overlay) {
      const rect = btn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(originX, window.innerWidth - originX),
        Math.max(originY, window.innerHeight - originY),
      );
      overlay.style.setProperty('--sos-origin-x', `${originX}px`);
      overlay.style.setProperty('--sos-origin-y', `${originY}px`);
      overlay.style.setProperty('--sos-max-radius', `${maxRadius}px`);
      overlay.style.transition = 'none';
    }
    startRef.current = null;
    setIsHolding(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setIsHolding(false);
    if (sosOverlayRef.current) {
      sosOverlayRef.current.style.transition = 'clip-path 320ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      setFillProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main className="home min-h-dvh flex flex-col items-center relative">
      {/* Fixed top-right, sized and positioned to match SettingsMenu's
          gear exactly (same clamp() size, same top offset) and sit just
          to its left - see the comment in home.css if it ever drifts. */}
      <button
        type="button"
        ref={sosButtonRef}
        className="home__profile-btn"
        aria-label={t('home.profile')}
        onClick={() => navigate('/get-started')}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 19.2c1.4-3.3 4.3-5 7.5-5s6.1 1.7 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
       {/* Full-screen circular reveal, anchored to the SOS button's
           current position. clip-path radius is driven by --sos-progress
           every animation frame from startHold/tick above - the same
           0-to-1 hold value, now expanding a circle instead of filling a
           bar. Fixed + high z-index so it covers the whole page
           (SettingsMenu, InstallPwaPrompt, everything) regardless of
           scroll position. */}
       <div className="home__sos-overlay" ref={sosOverlayRef} aria-hidden="true" />

      {/* No brand row here on purpose - just the greeting, left-aligned. */}
      <div className="home__composition flex flex-col items-start text-left w-full">
        <h1 className="home__greeting">{greeting}</h1>
        <p className="home__subtitle">{t('home.subtitle')}</p>

        <nav className="home__actions flex flex-col w-full" aria-label={t('home.actionsLabel')}>
          {actions.map(({ key, icon, labelKey, path }) => (
            <button
              key={key}
              type="button"
              className="home__action"
              onClick={() => navigate(path)}
            >
              <span className="home__action-icon-wrap">
                <img className="home__action-icon" src={icon} alt="" />
              </span>
              <span className="home__action-label">{t(labelKey)}</span>
              <svg className="home__action-chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </nav>

      </div>

      {/* Keep the emergency action at the bottom, immediately above the
          lower-priority coming-soon message. */}
      <button
        type="button"
        className={`home__sos${isHolding ? ' is-holding' : ''}${isComplete ? ' is-complete' : ''}`}
        aria-label={t('home.sosHoldLabel')}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) startHold();
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') cancelHold();
        }}
      >
        <span className="home__sos-fill" ref={sosFillRef} aria-hidden="true" />
        <span className="home__sos-icon-wrap">
          <img className="home__sos-icon" src={sosIcon} alt="" />
        </span>
        <span className="home__sos-label">{t('home.sos')}</span>
        <svg className="home__sos-chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className="home__coming-soon">{t('home.comingSoon')}</p>
    </main>
  );
}