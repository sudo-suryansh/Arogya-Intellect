import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getResumePath, markVisited } from '../progress';

// Mounted once in App.tsx, outside <Routes>, next to InstallPwaPrompt and
// SettingsMenu - same "persists across every page, renders nothing"
// pattern. Two jobs:
//
// 1. On every navigation, record how far the user has gotten (see
//    progress.ts - position only, no form data).
// 2. Exactly once, on initial app load, if the user lands on "/" and has
//    saved progress beyond it, redirect straight to where they left off.
//    The "exactly once" part matters: it only fires on a fresh mount
//    (app opened/reloaded), so an in-session "<- Back to Welcome" link
//    still works normally instead of being bounced right back.
export default function ProgressTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasCheckedResume = useRef(false);

  useEffect(() => {
    if (hasCheckedResume.current) return;
    hasCheckedResume.current = true;

    if (location.pathname === '/') {
      const resumePath = getResumePath();
      if (resumePath && resumePath !== '/') {
        navigate(resumePath, { replace: true });
      }
    }
    // Intentionally empty deps - this must only ever run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname]);

  return null;
}
