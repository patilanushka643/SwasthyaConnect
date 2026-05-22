import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const showCountdown = formatCountdown(otpCountdown);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex flex-col items-center pt-12 pb-4">
            <svg className="w-32 h-32 text-cyan-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" className="text-blue-600 stroke-2" />
            </svg>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-wide text-gray-800">Health Care</h1>
          </div>

          <div className="px-8 pb-10 pt-6">
            <div className="mb-6 border border-gray-400 rounded-lg px-4 py-3 shadow-sm bg-gray-50/50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input
                type={isOtpStep ? 'tel' : 'email'}
                inputMode={inputMode}
                value={inputValue}
                onChange={isOtpStep ? handleOtpChange : handleEmailChange}
                placeholder={inputPlaceholder}
                className="w-full bg-transparent text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
                maxLength={isOtpStep ? OTP_LENGTH : undefined}
                autoComplete={isOtpStep ? 'one-time-code' : 'email'}
              />
            </div>

            <button
              type="button"
              onClick={primaryButtonAction}
              disabled={primaryDisabled}
              className="mb-4 h-[72px] w-full rounded-[18px] bg-amber-500 text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)] transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {primaryButtonLabel}
            </button>

            {isOtpStep ? (
              <div className="mb-6 text-center text-[50px] font-normal leading-none text-[#6f6f6f]">{showCountdown}</div>
            ) : (
              <div className="flex items-center my-6 px-8">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-gray-400 text-sm font-medium uppercase tracking-wider">Or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            )}

            <button
              type="button"
              onClick={secondaryButtonAction}
              className="h-[72px] w-full rounded-[18px] bg-blue-900 text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)] transition hover:bg-blue-950"
            >
              {secondaryButtonLabel}
            </button>

            {(otpError || otpMessage) && (
              <p className="mt-5 text-center text-sm text-[#3947a8]">{otpError || otpMessage}</p>
            )}
          </div>
        </div>
    </div>
  );
}
