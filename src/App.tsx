import { Routes, Route } from 'react-router-dom';
import fast6Logo from './assets/fast6.png';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import Language from './pages/Language';
import Details from './pages/Details';
import GetStarted from './pages/GetStarted';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <a className="app-shell__team-link" href="/" aria-label="Fast6 home">
        <img className="app-shell__team-logo" src={fast6Logo} alt="Fast6" />
      </a>

      {/* Mobile-only "install as an app" nudge. Renders nothing on desktop
          and nothing once already running as an installed PWA - see
          shouldPromptInstall in src/pwa.ts. Sits outside <Routes> so it
          persists across every page rather than remounting on navigation. */}
      <InstallPwaPrompt />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/language" element={<Language />} />
        <Route path="/details" element={<Details />} />
        <Route path="/get-started" element={<GetStarted />} />
      </Routes>
    </div>
  );
}

export default App;
