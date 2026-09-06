import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/sign-in.css';

// Sign-in / sign-up screen, shown after Welcome's "Get Started" CTA.
// The Google button is a placeholder for now - it navigates to /language
// (then on to /details) rather than triggering real OAuth, until the
// backend's redirect-based Google sign-in is wired in.
export default function SignIn() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <main className="signin flex min-h-dvh flex-col items-center justify-center">
      <div className="signin__composition flex w-full flex-col items-center text-center">
        <div className="signin__logo-wrap">
          <img
            className="w-full h-auto"
            src={logo}
            alt="Arogya Intellect logo"
            width={1402}
            height={1122}
          />
        </div>

        <h1 className="signin__title">Let's get you set up</h1>

        <p className="signin__subtitle">
          Sign up securely with your Google account - no new passwords to remember.
        </p>

        <Link
          to="/language"
          className={`signin__google inline-flex items-center justify-center no-underline${
            isPressed ? ' is-pressed' : ''
          }`}
          onPointerDown={() => setIsPressed(true)}
          onPointerUp={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          onPointerCancel={() => setIsPressed(false)}
        >
          <svg className="signin__google-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.3 35.4 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </Link>

        <Link to="/" className="signin__back inline-flex items-center no-underline">
          ← Back
        </Link>
      </div>
    </main>
  );
}
