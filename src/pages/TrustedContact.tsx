import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import ContactOtpForm from '../components/ContactOtpForm';
import contactIcon from '../assets/contact.svg';
import '../styles/trusted-contact.css';

// Final onboarding step, reached from either CaregiverDetails (OTP path)
// or AshaIntro (skip path). No skip option here - mandatory.
export default function TrustedContact() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="trusted-contact flex min-h-dvh flex-col items-center justify-center">
      <div className="trusted-contact__composition flex w-full flex-col items-center text-center">
        <span className="trusted-contact__icon-tile" aria-hidden="true">
            <img src={contactIcon} alt="" width={24} height={24} />
        </span>

        <h1 className="trusted-contact__title">{t('trustedContact.title')}</h1>
        <p className="trusted-contact__subtitle">{t('trustedContact.subtitle')}</p>

        <ContactOtpForm namespace="trustedContact" onVerified={() => navigate('/home')} />
      </div>
    </main>
  );
}