import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import welcomePage from '../assets/welcomePage.png';
import pointerArrow from '../assets/arrow.png';
import '../styles/welcome.css';

// Welcome / get-started screen.
//
// This is a direct port of the original static index.html + welcome.css +
// welcome.js. Layout/composition is unchanged; only the parts that were
// static (non-fluid, non-token, non-breakpoint-dependent) were lifted into
// Tailwind utility classes, alongside the original BEM class names, which
// still carry the fluid clamp()-based spacing/type, the custom breakpoints,
// and the entrance animation - see src/styles/welcome.css.
export default function Welcome() {
  // Small tactile press state beyond :active, for browsers/input methods
  // where :active timing feels abrupt (some touchscreens release it early).
  // Mirrors the pointer event listeners from the original welcome.js.
  const [isPressed, setIsPressed] = useState(false);


  return (
    <main className="welcome flex min-h-dvh flex-col items-center justify-center">
      <div className="welcome__composition flex w-full flex-col items-center text-center">
        <div className="welcome__logo-wrap">
          <img
            className="w-full h-auto"
            src={logo}
            alt="Arogya Intellect logo"
            width={1402}
            height={1122}
          />
        </div>

        <h1 className="welcome__brand">Arogya Intellect</h1>

        <p className="welcome__tagline">Brighter Days, Together</p>

        <div className="welcome__illustration-wrap">
          <img
            className="welcome__illustration"
            src={welcomePage}
            alt="An illustrated North-Eastern Indian village by a river, with a suspension bridge, thatched houses, a waterfall, and a hillside monastery."
            width={1536}
            height={1024}
          />
        </div>

        <p className="welcome__description">Cognitive Care for Elderly Well-being</p>

        <div className="welcome__cta-wrap relative inline-flex">
          <Link
            to="/sign-in"
            className={`welcome__cta inline-flex items-center justify-center border-0 text-white no-underline cursor-pointer${
              isPressed ? ' is-pressed' : ''
            }`}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            onPointerLeave={() => setIsPressed(false)}
            onPointerCancel={() => setIsPressed(false)}
          >
            <span>Get Started</span>
            <span className="welcome__cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          {/* Decorative hand-drawn pointer arrow. Absolutely positioned so it
              never affects button/document layout; purely visual, hence
              aria-hidden + empty alt. Its "draw-in" animation lives in
              welcome.css (.welcome__cta-pointer). */}
          <img
            className="welcome__cta-pointer pointer-events-none select-none absolute"
            src={pointerArrow}
            alt=""
            aria-hidden="true"
          />
        </div>

        <p className="welcome__footer">
          Healthy Minds
          <br />
          Stronger Communities
        </p>
      </div>
    </main>
  );
}