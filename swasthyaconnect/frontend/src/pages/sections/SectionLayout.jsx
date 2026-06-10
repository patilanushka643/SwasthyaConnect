import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AiimsLogo, MenuIcon, ShareIcon } from '../../components/UiIcons';

const SectionLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth() || {};

  const handleLogout = () => {
    logout?.();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-[#1f2937]">
      <div className="sticky top-0 z-30">
        <div className="h-[44px] bg-[#3947a8]" />
        <div className="border-b border-black/5 bg-white px-4 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-[980px] items-center justify-between">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-black">
              <MenuIcon className="h-7 w-7" />
            </button>

            <div className="flex items-center gap-2 pl-1">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-white p-0.5">
                <AiimsLogo style={{ width: '36px', height: '36px' }} />
              </div>
              <div className="text-center leading-none">
                <p className="font-[Georgia] text-[22px] font-bold text-black">SwasthyaConnect</p>
              </div>
            </div>

            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-black">
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[980px] px-4 py-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-700/50 w-fit cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <section className="overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/95 shadow-[0_24px_90px_rgba(2,6,23,0.45)]">
          <div className="border-b border-slate-700 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">{subtitle}</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          </div>
          <div className="px-5 py-5 sm:px-6">{children}</div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white shadow-[0_-3px_14px_rgba(0,0,0,0.08)]">
        <div className="mx-auto grid max-w-[980px] grid-cols-3 px-2 py-2 text-center font-[Georgia] text-[13px] font-semibold text-[#36439a]">
          <button type="button" className="flex flex-col items-center gap-1" onClick={() => navigate('/dashboard')}>
            <span className="text-[28px] leading-none text-[#36439a]">+</span>
            <span>Dashboard</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1" onClick={() => window.open('https://aiimsbhopal.edu.in', '_blank', 'noopener,noreferrer')}>
            <span className="text-[28px] leading-none text-[#5b5b5b]">▲</span>
            <span className="text-[#5b5b5b]">Hospital</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1" onClick={handleLogout}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#707070] text-[16px] leading-none text-[#707070]">×</span>
            <span className="text-[#5b5b5b]">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionLayout;