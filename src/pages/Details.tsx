import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/details.css';

const GENDERS = ['Female', 'Male', 'Prefer not to say'];

// Name / age / gender screen, shown right after the Google sign-in step.
// No backend save yet - Continue just navigates once all fields are filled.
export default function Details() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const isComplete = name.trim().length > 0 && age !== '' && gender !== '';

  return (
    <main className="details flex min-h-dvh flex-col items-center justify-center">
      <div className="details__composition flex w-full flex-col items-center text-center">
        <div className="details__logo-wrap">
          <img
            className="w-full h-auto"
            src={logo}
            alt="Arogya Intellect logo"
            width={1402}
            height={1122}
          />
        </div>

        <h1 className="details__title">Tell us a little about you</h1>
        <p className="details__subtitle">This helps us personalize Arogya Intellect for you.</p>

        <form className="details__form flex w-full flex-col" onSubmit={(e) => e.preventDefault()}>
          <label className="details__field">
            <span className="details__label">Name</span>
            <input
              className="details__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className="details__field">
            <span className="details__label">Age</span>
            <select
              className="details__input details__select"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="" disabled>
                Select your age
              </option>
              {Array.from({ length: 83 }, (_, i) => i + 18).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="details__field">
            <span className="details__label">Gender</span>
            <div className="details__pill-group" role="radiogroup" aria-label="Gender">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={gender === g}
                  className={`details__pill${gender === g ? ' is-selected' : ''}`}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Link
            to={isComplete ? '/get-started' : '#'}
            aria-disabled={!isComplete}
            className={`details__continue inline-flex items-center justify-center no-underline${
              isComplete ? '' : ' is-disabled'
            }`}
            onClick={(e) => {
              if (!isComplete) e.preventDefault();
            }}
          >
            Continue
          </Link>
        </form>
      </div>
    </main>
  );
}