import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import '../styles/contact-otp-form.css';

type Step = 'form' | 'otp';

const DEMO_OTP = '0000';
const PHONE_LENGTH = 10;

interface ContactOtpFormProps {
  /** i18n key prefix - e.g. 'caregiver' or 'trustedContact'. Looks up
      `${namespace}.nameLabel`, `${namespace}.sendOtp`, etc. */
  namespace: string;
  onVerified: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

// Shared name + phone + OTP flow, used by CaregiverDetails and
// TrustedContact. No backend yet - "sending" an OTP just moves to the
// otp step, and the only code that verifies is the hardcoded DEMO_OTP
// below. Swap handleSendOtp/handleVerify for real API calls later.
export default function ContactOtpForm({
  namespace,
  onVerified,
  showSkip = false,
  onSkip,
}: ContactOtpFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  const isFormComplete = name.trim().length > 0 && phone.length === PHONE_LENGTH;
  const isOtpComplete = otp.length === DEMO_OTP.length;

  const handleSendOtp = () => {
    if (!isFormComplete) return;
    setOtpError(false);
    setOtp('');
    setStep('otp');
  };

  const handleVerify = () => {
    if (!isOtpComplete) return;
    if (otp === DEMO_OTP) {
      setOtpError(false);
      onVerified();
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="contact-otp-form flex w-full flex-col">
      {step === 'form' ? (
        <>
          <label className="contact-otp-form__field">
            <span className="contact-otp-form__label">{t(`${namespace}.nameLabel`)}</span>
            <input
              className="contact-otp-form__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(`${namespace}.namePlaceholder`)}
              autoComplete="name"
            />
          </label>

          <label className="contact-otp-form__field">
            <span className="contact-otp-form__label">{t(`${namespace}.numberLabel`)}</span>
            <input
              className="contact-otp-form__input"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))
              }
              placeholder={t(`${namespace}.numberPlaceholder`)}
              autoComplete="tel"
            />
          </label>

          <button
            type="button"
            className={`contact-otp-form__cta${isFormComplete ? '' : ' is-disabled'}`}
            disabled={!isFormComplete}
            onClick={handleSendOtp}
          >
            {t(`${namespace}.sendOtp`)}
          </button>
        </>
      ) : (
        <>
          <p className="contact-otp-form__otp-sent">
            {t(`${namespace}.otpSentTo`)} +91 {phone}
          </p>

          <label className="contact-otp-form__field">
            <span className="contact-otp-form__label">{t(`${namespace}.otpLabel`)}</span>
            <input
              className="contact-otp-form__input contact-otp-form__otp-input"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, DEMO_OTP.length));
                setOtpError(false);
              }}
              placeholder={t(`${namespace}.otpPlaceholder`)}
              autoComplete="one-time-code"
            />
          </label>

          {/* Demo build only - no SMS backend yet, so the hint tells
              testers/judges the code to type. Remove once real SMS is wired up. */}
          <p className="contact-otp-form__otp-hint">{t(`${namespace}.otpHint`)}</p>

          {otpError && (
            <p className="contact-otp-form__otp-error" role="alert">
              {t(`${namespace}.otpError`)}
            </p>
          )}

          <button
            type="button"
            className={`contact-otp-form__cta${isOtpComplete ? '' : ' is-disabled'}`}
            disabled={!isOtpComplete}
            onClick={handleVerify}
          >
            {t(`${namespace}.verify`)}
          </button>

          <button type="button" className="contact-otp-form__link-btn" onClick={() => setStep('form')}>
            {t(`${namespace}.changeNumber`)}
          </button>
        </>
      )}

      {showSkip && (
        <button type="button" className="contact-otp-form__skip" onClick={onSkip}>
          {t(`${namespace}.skip`)}
        </button>
      )}
    </div>
  );
}