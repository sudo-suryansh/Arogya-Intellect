import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import ContactOtpForm from '../components/ContactOtpForm';
import heartAnimation from '../assets/heart.gif';
import '../styles/caregiver-details.css';

// Sits right after Details in the onboarding flow. Verifying OTP sends
// the user to TrustedContact; skipping sends them to the ASHA reassurance
// screen first, which itself continues on to TrustedContact.
export default function CaregiverDetails() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="caregiver flex min-h-dvh flex-col items-center justify-center">
      <div className="caregiver__composition flex w-full flex-col items-center text-center">
        <div className="caregiver__hero-wrap">
          <img
            className="caregiver__hero"
            src={heartAnimation}
            alt=""
            aria-hidden="true"
          />
        </div>

        <h1 className="caregiver__title">{t('caregiver.title')}</h1>
        <p className="caregiver__subtitle">{t('caregiver.subtitle')}</p>

        <ContactOtpForm
          namespace="caregiver"
          onVerified={() => navigate('/trusted-contact')}
          showSkip
          onSkip={() => navigate('/asha-intro')}
        />
      </div>
    </main>
  );
}