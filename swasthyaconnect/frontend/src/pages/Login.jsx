import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 180;

const formatCountdown = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const Login = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [challengeId, setChallengeId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [countdownSeconds, setCountdownSeconds] = useState(RESEND_SECONDS);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const otpRefs = useRef([]);

  const normalizedMobileNumber = useMemo(() => mobileNumber.replace(/\D/g, '').slice(0, 10), [mobileNumber]);

  useEffect(() => {
    if (step !== 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCountdownSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [step]);

  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const resetToFirstScreen = () => {
    setStep(1);
    setSelectedRole('patient');
    setChallengeId('');
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
    setCountdownSeconds(RESEND_SECONDS);
    setOnboardingRequired(false);
    setError('');
    setStatusMessage('');
  };

  const routeByRole = (role) => {
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  const handleMobileChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
  };

  const fillOtpDigit = (index, value) => {
    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);
  };

  const handleOtpChange = (index, value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const digit = digitsOnly.slice(-1);
    fillOtpDigit(index, digit);

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (!pastedDigits) {
      return;
    }

    event.preventDefault();
    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] || '');
    setOtpDigits(nextDigits);
    const lastIndex = Math.min(pastedDigits.length, OTP_LENGTH) - 1;
    otpRefs.current[lastIndex]?.focus();
  };

  const requestMobileOtp = async (role) => {
    const currentMobileNumber = normalizedMobileNumber;

    if (currentMobileNumber.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setStatusMessage('');

    try {
      const response = await requestOtp({
        mobileNumber: `+91${currentMobileNumber}`,
        role,
      });

      setSelectedRole(role);
      setChallengeId(response.challengeId);
      setOnboardingRequired(Boolean(response.onboardingRequired));
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
      setCountdownSeconds(response.resendAfterSeconds || RESEND_SECONDS);
      setStep(2);
      setStatusMessage(`OTP sent to +91 ${currentMobileNumber}.`);
    } catch (requestError) {
      const retryAfterSeconds = requestError?.response?.data?.retryAfterSeconds;
      setError(requestError?.response?.data?.message || 'Unable to request OTP.');
      if (retryAfterSeconds) {
        setCountdownSeconds(retryAfterSeconds);
      }
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const otpValue = otpDigits.join('');
    if (otpValue.length !== OTP_LENGTH) {
      setError('Enter the 6-digit OTP to continue.');
      return;
    }

    setError('');
    setStatusMessage('');

    try {
      const response = await verifyOtp({
        challengeId,
        otp: otpValue,
        mobileNumber: `+91${normalizedMobileNumber}`,
        role: selectedRole,
      });

      routeByRole(response.user.role);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'OTP verification failed.');
    }
  };

  const handleResendOtp = async () => {
    if (countdownSeconds > 0) {
      return;
    }

    await requestMobileOtp(selectedRole);
  };

  const otpValue = otpDigits.join('');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#f8fcff_0%,_#eefbf8_55%,_#fdf7e8_100%)] text-slate-900">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_32px_100px_-36px_rgba(15,23,42,0.45)] backdrop-blur xl:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                AIIMS-inspired Digital Front Door
              </div>

              <div className="max-w-xl space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">SwasthyaConnect</h1>
                <p className="max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                  Institutional login flow for patients and medical staff with mobile OTP verification, role-aware onboarding,
                  and a clean, low-friction entry point for clinical operations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Role-aware access</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Separate patient and staff journeys from the first tap.</p>
                </article>
                <article className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">OTP throttle</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Resend cooldown protects against brute-force retries.</p>
                </article>
                <article className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Onboarding fallback</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">New role-specific users are created safely on verification.</p>
                </article>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white shadow-lg shadow-cyan-950/10">
                  SC
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-700">Trusted clinical access</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Minimal friction for reception, OPD, and staff credential verification.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_32px_100px_-36px_rgba(15,23,42,0.45)] backdrop-blur xl:p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg shadow-cyan-950/10">
                    SC
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Enter your mobile number</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    We will send a one-time code and route you based on the role you choose.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="mobileNumber">
                    Mobile number
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                    <div className="flex items-center border-r border-slate-200 px-4 text-sm font-semibold text-slate-500">
                      +91
                    </div>
                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={normalizedMobileNumber}
                      onChange={handleMobileChange}
                      inputMode="numeric"
                      placeholder="9876543210"
                      className="w-full bg-transparent px-4 py-4 text-base font-semibold tracking-[0.16em] text-slate-900 outline-none placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Default country code is +91. Enter a 10-digit mobile number.</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => requestMobileOtp('patient')}
                    disabled={loading}
                    className="w-full rounded-2xl bg-cyan-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Login as Patient
                  </button>

                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span>Or</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={() => requestMobileOtp('doctor')}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="block">Staff Login</span>
                    <span className="mt-1 block text-xs font-medium uppercase tracking-[0.26em] text-slate-500">
                      Doctor / Medical Staff
                    </span>
                  </button>
                </div>

                {statusMessage && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {statusMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyOtp} onPaste={handleOtpPaste}>
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg shadow-cyan-950/10">
                    SC
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Verify OTP</h2>
                  <p className="text-sm leading-6 text-slate-500">Please enter OTP received on your mobile number</p>
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <span>{selectedRole === 'doctor' ? 'Staff Login' : 'Patient Login'}</span>
                    <span className="text-slate-300">•</span>
                    <span>+91 {normalizedMobileNumber}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-center gap-3 sm:gap-4">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(node) => {
                          otpRefs.current[index] = node;
                        }}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="h-14 w-12 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-bold tracking-[0.2em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 sm:h-16 sm:w-14"
                        maxLength={1}
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-500">Enter the 6-digit code to continue securely.</p>
                </div>

                {onboardingRequired && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This is a new role-specific profile. We will create the user record after OTP verification.
                  </div>
                )}

                {statusMessage && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {statusMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpValue.length !== OTP_LENGTH}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Login'}
                </button>

                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetToFirstScreen}
                    className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
                  >
                    Enter again
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdownSeconds > 0 || loading}
                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {countdownSeconds > 0 ? `Resend OTP in ${formatCountdown(countdownSeconds)}` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
