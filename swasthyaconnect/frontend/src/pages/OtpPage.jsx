import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AiimsLogo } from '../components/UiIcons';

const OTP_LENGTH = 6;

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export default function OtpPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const phone = useMemo(() => String(state?.phone || '').replace(/\D/g, '').slice(0, 10), [state?.phone]);
  const role = state?.role || 'patient';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(180);

  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true });
      return undefined;
    }

    setCountdown(180);
    return undefined;
  }, [navigate, phone, role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const verifyCode = (event) => {
    event.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      setError('Enter the 6-digit OTP to continue.');
      return;
    }

    setError('');
    setSession({
      token: 'mock-swasthya-session',
      user: {
        id: 'mock-user',
        role,
        name: role === 'staff' ? 'Staff' : 'Patient',
        mobileNumber: phone,
      },
    });

    navigate('/dashboard', { replace: true });
  };

  const handleResend = () => {
    if (countdown > 0) {
      return;
    }

    setError('');
    setOtp('');
    setCountdown(180);
  };

  const resendText = countdown > 0 ? `Resend OTP in ${formatTime(countdown)}` : 'Resend OTP';

  return (
    <div className="min-h-screen bg-white px-6 pb-10 pt-6 sm:px-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center bg-white pt-8">
        <div className="mb-[78px] h-[136px] w-[136px]">
          <AiimsLogo style={{ width: '136px', height: '136px' }} />
        </div>

        <p className="mb-[82px] px-2 text-center text-[19px] leading-[1.65] text-[#3947a8]">
          Please enter OTP received on your mobile number
        </p>

        <form onSubmit={verifyCode} className="w-full px-2">
          <div className="mb-4 border-b border-[#6d6d6d] pb-3">
            <input
              type="tel"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
              placeholder=""
              className="w-full bg-transparent text-center text-[21px] tracking-[0.62em] text-[#1f2937] focus:outline-none"
              maxLength={OTP_LENGTH}
              autoComplete="one-time-code"
            />
          </div>

          <div className="mb-7 flex items-center justify-between text-[17px] font-semibold">
            <button type="button" onClick={() => setOtp('')} className="font-[Georgia] italic text-[#1593aa]">
              Enter again
            </button>

            <button type="button" onClick={handleResend} className="font-[Georgia] italic text-[#a01414]">
              {resendText}
            </button>
          </div>

          <button
            type="submit"
            className="h-[74px] w-full rounded-[18px] bg-[#f3a40b] text-[24px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)]"
          >
            Login
          </button>
        </form>

        {error && <p className="mt-5 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}