import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import gamesIcon from '../assets/games-icon.svg';
import remindersIcon from '../assets/reminders-icon.svg';
import rememberIcon from '../assets/remember-icon.svg';
import '../styles/home.css';

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
  ] as const;
  return (
    <main className="home min-h-dvh h-dvh overflow-hidden flex flex-col items-center relative">
      {/* Fixed top-right, sized and positioned to match SettingsMenu's
          gear exactly (same clamp() size, same top offset) and sit just
          to its left - see the comment in home.css if it ever drifts. */}
      <button
        type="button"
        className="home__profile-btn"
        aria-label={t('home.profile')}
        onClick={() => navigate('/get-started')}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 19.2c1.4-3.3 4.3-5 7.5-5s6.1 1.7 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

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

      <p className="home__coming-soon">{t('home.comingSoon')}</p>
    </main>
  );
}
