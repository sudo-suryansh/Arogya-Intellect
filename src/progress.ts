// ==========================================================================
// Onboarding-flow resume tracking
//
// Persists how far the user has gotten through the app's linear onboarding
// flow (Welcome -> SignIn -> Language -> Details -> GetStarted, in that
// order) so that reopening the app continues from the right page instead
// of restarting at Welcome every time.
//
// This tracks POSITION ONLY - never form data. No name, age, gender, or
// which language was picked lives here (language has its own persistence
// in i18n/LanguageContext.tsx, for a different reason - remembering the
// UI language, not onboarding position).
//
// Adding a new page to the flow later: add its path to ROUTE_ORDER below,
// in the same position it appears in App.tsx's <Routes> block. That's the
// only change needed anywhere - ProgressTracker.tsx and the resume
// redirect both derive everything from this one array.
// ==========================================================================

export const ROUTE_ORDER = ['/', '/sign-in', '/language', '/details', '/get-started'] as const;

const STORAGE_KEY = 'fast6.furthestStepIndex';

function readStoredIndex(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeStoredIndex(index: number): void {
  window.localStorage.setItem(STORAGE_KEY, String(index));
}

// Records that the user has reached `path`. Only ever moves the saved
// progress forward - visiting an earlier page (e.g. a "Back" link) never
// erases how far they'd already gotten.
export function markVisited(path: string): void {
  const index = ROUTE_ORDER.indexOf(path as (typeof ROUTE_ORDER)[number]);
  if (index === -1) return; // not a tracked flow page - ignore
  const current = readStoredIndex();
  if (index > current) writeStoredIndex(index);
}

// Where should a fresh visit to "/" jump to? null if there's no saved
// progress yet (or the furthest reached is still Welcome itself).
export function getResumePath(): string | null {
  const index = readStoredIndex();
  if (index <= 0) return null;
  return ROUTE_ORDER[index] ?? null;
}

// Wipes saved onboarding position - used by Sign out, so a later reload
// of "/" doesn't just bounce the user straight back to where they were.
export function resetProgress(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
