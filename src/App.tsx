import { Routes, Route } from 'react-router-dom';
import fast6Logo from './assets/fast6.png';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import Language from './pages/Language';
import Details from './pages/Details';
import GetStarted from './pages/GetStarted';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import SettingsMenu from './components/SettingsMenu';
import ProgressTracker from './components/ProgressTracker';
import { LanguageProvider } from './i18n/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <div className="app-shell">
        <a className="app-shell__team-link" href="/" aria-label="Fast6 home">
          <img className="app-shell__team-logo" src={fast6Logo} alt="Fast6" />
        </a>

        {/* Mobile-only "install as an app" nudge. Renders nothing on desktop
            and nothing once already running as an installed PWA - see
            shouldPromptInstall in src/pwa.ts. Sits outside <Routes> so it
            persists across every page rather than remounting on navigation. */}
        <InstallPwaPrompt />

        {/* Top-right language/settings switcher. Renders nothing until the
            user has picked a language on the Language page (page 3), so it
            first appears on Details (page 4) and stays available on every
            page after that - see the languageSelected guard in
            SettingsMenu.tsx. Also sits outside <Routes> so it persists. */}
        <SettingsMenu />

        {/* Renders nothing - tracks how far the user has gotten through the
            onboarding flow and resumes there on a fresh app open. See
            src/progress.ts (ROUTE_ORDER is the single place to touch when a
            new page joins the flow) and ProgressTracker.tsx for how. */}
        <ProgressTracker />

        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/language" element={<Language />} />
          <Route path="/details" element={<Details />} />
          <Route path="/get-started" element={<GetStarted />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;
