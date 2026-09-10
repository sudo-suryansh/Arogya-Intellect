import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import ashaImage from '../assets/asha.png';
import '../styles/asha-intro.css';

// Shown only on the "skip caregiver" path. Pure reassurance screen -
// no form, just the staggered text/image/button reveal, then on to
// TrustedContact same as the OTP-verified path.
export default function AshaIntro() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="asha-intro flex min-h-dvh flex-col items-center justify-center text-center">
      <div className="asha-intro__composition flex w-full flex-col items-center">
        <p className="asha-intro__text">{t('ashaIntro.reassurance')}</p>

        <div className="asha-intro__image-wrap">
          {/* TODO: set width/height once asha.png's real dimensions are known,
              same as couple/bottomLandscape in Language.tsx, to avoid layout shift. */}
          <img className="asha-intro__image" src={ashaImage} alt={t('ashaIntro.imageAlt')} />
        </div>

        <button type="button" className="asha-intro__continue" onClick={() => navigate('/trusted-contact')}>
          <span>{t('ashaIntro.continue')}</span>
          <span className="asha-intro__continue-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}