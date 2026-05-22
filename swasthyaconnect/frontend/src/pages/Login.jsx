import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MedicalLogo } from '../components/UiIcons';

const OTP_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const remaining = String(safeSeconds % 60).padStart(2, '0');

  return `${minutes}:${remaining}`;
};

export default function Login() {
  const navigate = useNavigate();
  const {
    step,
    email,
    otpCode,
    otpRole,
    otpCountdown,
    otpError,
    otpMessage,
    loading,
    isAuthenticated,
    setEmail,
    setOtpCode,
    requestOtp,
    verifyOtp,
    resetOtpFlow,
  } = useAuth() || {};

  const safeStep = Number(step) || 1;
  const safeEmail = useMemo(() => String(email || ''), [email]);
  const safeOtpCode = useMemo(() => String(otpCode || ''), [otpCode]);
  const isOtpStep = safeStep === 2;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (event) => {
    setEmail?.(event?.target?.value || '');
  };

  const handleOtpChange = (event) => {
    setOtpCode?.(String(event?.target?.value || '').replace(/\D/g, '').slice(0, OTP_LENGTH));
  };

  const handleRequestOtp = async (role) => {
    if (loading) {
      return;
    }

    const normalizedEmail = String(safeEmail || '').trim();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      console.error('[Login] Invalid email submitted for OTP request:', normalizedEmail);
      return;
    }

    try {
      console.debug('[Login] Requesting OTP', { email: normalizedEmail, role });
      await requestOtp?.({ email: normalizedEmail, role });
    } catch (error) {
      console.error('[Login] OTP request failed:', error);
      // The context already stores the error message for display.
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) {
      return;
    }

    try {
      await verifyOtp?.({ otpCode: safeOtpCode, email: safeEmail, role: otpRole });
      navigate('/dashboard', { replace: true });
    } catch (_error) {
      // The context already stores the error message for display.
    }
  };

  const handleEnterAgain = () => {
    resetOtpFlow?.();
  };

  const showCountdown = isOtpStep ? formatCountdown(otpCountdown) : 'Or';
  const primaryButtonLabel = isOtpStep ? 'Login' : 'Login as Patient';
  const secondaryButtonLabel = isOtpStep ? 'Enter again' : 'Staff Login';
  const secondaryButtonAction = isOtpStep ? handleEnterAgain : () => handleRequestOtp('staff');
  const primaryButtonAction = isOtpStep ? handleVerifyOtp : () => handleRequestOtp('patient');
  const inputPlaceholder = isOtpStep ? 'Enter 6-digit OTP' : 'Enter your email address...';
  const inputValue = isOtpStep ? safeOtpCode : safeEmail;
  const inputMode = isOtpStep ? 'numeric' : 'email';
  const primaryDisabled =
    loading ||
    (isOtpStep && String(safeOtpCode || '').length !== OTP_LENGTH) ||
    (!isOtpStep && !EMAIL_PATTERN.test(String(safeEmail || '').trim()));

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-[7px] py-[10px] sm:px-4">
      <div className="flex min-h-[745px] w-full max-w-[430px] flex-col items-center overflow-hidden rounded-[18px] bg-white px-6 pt-[82px] pb-10 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="mb-[98px] flex h-[170px] w-[170px] items-center justify-center rounded-[22px] bg-white">
          <MedicalLogo style={{ width: '154px', height: '154px' }} />
        </div>

        <div className="mb-[86px] flex w-full items-end gap-[10px] px-1">
          <div className="h-[28px] w-[62px] shrink-0" aria-hidden="true" />
          <div className="flex-1 pb-[2px]">
            <input
              type={isOtpStep ? 'tel' : 'email'}
              inputMode={inputMode}
              value={inputValue}
              onChange={isOtpStep ? handleOtpChange : handleEmailChange}
              placeholder={inputPlaceholder}
              className="w-full border-b border-[#737373] bg-transparent pb-2 text-[20px] leading-none text-[#a3a3a3] placeholder:text-[#a3a3a3] focus:outline-none"
              maxLength={isOtpStep ? OTP_LENGTH : undefined}
              autoComplete={isOtpStep ? 'one-time-code' : 'email'}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={primaryButtonAction}
          disabled={primaryDisabled}
          className="mb-[34px] h-[72px] w-full rounded-[18px] bg-[#f4a307] text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)] disabled:opacity-70"
        >
          {primaryButtonLabel}
        </button>

        <div className="mb-[26px] text-[50px] font-normal leading-none text-[#6f6f6f]">{showCountdown}</div>

        <button
          type="button"
          onClick={secondaryButtonAction}
          className="h-[72px] w-full rounded-[18px] bg-[#3947a8] text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)]"
        >
          {secondaryButtonLabel}
        </button>

        {(otpError || otpMessage) && (
          <p className="mt-5 text-center text-sm text-[#3947a8]">{otpError || otpMessage}</p>
        )}
      </div>
    </div>
  );
}
