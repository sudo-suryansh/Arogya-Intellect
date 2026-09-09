import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import en from './locales/en.json';
import hi from './locales/hi.json';
import as_ from './locales/as.json';

// Add a language by (1) adding its code here, (2) dropping a
// locales/<code>.json file with the same key shape as en.json, and
// (3) adding it to DICTIONARIES and to the LANGUAGE_OPTIONS list in
// components/SettingsMenu.tsx (and Language.tsx's LANGUAGES array).
export type LanguageCode = 'as' | 'en' | 'hi';

type Dictionary = Record<string, unknown>;

const DICTIONARIES: Record<LanguageCode, Dictionary> = { en, hi, as: as_ };
const DEFAULT_LANGUAGE: LanguageCode = 'en';

const STORAGE_LANGUAGE_KEY = 'fast6.language';
const STORAGE_SELECTED_KEY = 'fast6.languageSelected';

// "Smart alias" lookup: keys are dot-paths into the JSON dictionary, e.g.
// t('language.title'). This is what makes adding new copy painless -
// nest a new key anywhere in the JSON and reference it the same way,
// no code changes needed here. Falls back to English, then to the raw
// key itself, so a missing translation never renders blank.
function resolveKey(dict: Dictionary, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as Dictionary)) {
      return (node as Dictionary)[part];
    }
    return undefined;
  }, dict);
}

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_LANGUAGE_KEY);
  return stored && stored in DICTIONARIES ? (stored as LanguageCode) : DEFAULT_LANGUAGE;
}

function readStoredSelected(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_SELECTED_KEY) === '1';
}

interface LanguageContextValue {
  language: LanguageCode;
  /** Has the user completed the picker on the Language page (page 3)?
   *  Gates the SettingsMenu icon - see App.tsx. */
  languageSelected: boolean;
  /** markSelected defaults to true; the picker on Language.tsx and the
   *  SettingsMenu switcher both just want "pick + remember" behavior. */
  setLanguage: (code: LanguageCode, markSelected?: boolean) => void;
  /** Un-does languageSelected (used by Sign out) so SettingsMenu hides
   *  again until the Language page is completed once more. Leaves the
   *  last-used language code alone - just flips the gate back off. */
  clearSelection: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);
  const [languageSelected, setLanguageSelected] = useState<boolean>(readStoredSelected);

  // Keeps <html lang="..."> honest for screen readers/browser features,
  // independent of anything InstallPwaPrompt or routing does.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode, markSelected = true) => {
    setLanguageState(code);
    window.localStorage.setItem(STORAGE_LANGUAGE_KEY, code);
    if (markSelected) {
      setLanguageSelected(true);
      window.localStorage.setItem(STORAGE_SELECTED_KEY, '1');
    }
  }, []);

  const clearSelection = useCallback(() => {
    setLanguageSelected(false);
    window.localStorage.removeItem(STORAGE_SELECTED_KEY);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const value =
        resolveKey(DICTIONARIES[language], key) ?? resolveKey(DICTIONARIES[DEFAULT_LANGUAGE], key);
      return typeof value === 'string' ? value : key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, languageSelected, setLanguage, clearSelection, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
