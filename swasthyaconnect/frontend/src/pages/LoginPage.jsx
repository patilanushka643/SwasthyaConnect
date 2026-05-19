import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalLogo } from '../components/UiIcons';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const goToOtp = (role = 'patient') => {
    const normalizedPhone = String(phone || '').replace(/\D/g, '').slice(0, 10);

    if (!normalizedPhone) {
      return;
    }

    navigate('/otp', {
      state: {
        phone: normalizedPhone,
        role,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-[7px] py-[10px] sm:px-4">
      <div className="flex min-h-[745px] w-full max-w-[430px] flex-col items-center overflow-hidden rounded-[18px] bg-white px-6 pt-[82px] pb-10 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="mb-[98px] flex h-[170px] w-[170px] items-center justify-center rounded-[22px] bg-white">
          <MedicalLogo style={{ width: '154px', height: '154px' }} />
        </div>

        <div className="mb-[86px] flex w-full items-end gap-[10px] px-1">
          <span className="pb-1 text-[22px] font-bold leading-none text-[#f2a20b]">+91</span>
          <div className="flex-1 pb-[2px]">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your mobile number t..."
              className="w-full border-b border-[#737373] bg-transparent pb-2 text-[20px] leading-none text-[#a3a3a3] placeholder:text-[#a3a3a3] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => goToOtp('patient')}
          className="mb-[34px] h-[72px] w-full rounded-[18px] bg-[#f4a307] text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)]"
        >
          Login as Patient
        </button>

        <div className="mb-[26px] text-[50px] font-normal leading-none text-[#6f6f6f]">Or</div>

        <button
          type="button"
          onClick={() => goToOtp('staff')}
          className="h-[72px] w-full rounded-[18px] bg-[#3947a8] text-[22px] font-medium text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)]"
        >
          Staff Login
        </button>
      </div>
    </div>
  );
}