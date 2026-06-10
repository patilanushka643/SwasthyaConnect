import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AiimsLogo, MenuIcon, ShareIcon, TileIcon } from '../components/UiIcons';

const dashboardCards = [
  { label: 'Book Appointment', tone: 'bg-[#edf2e5]', icon: 'appointment', path: '/dashboard/book-appointment' },
  { label: 'My Appointments', tone: 'bg-[#f4efeb]', icon: 'appointment', path: '/dashboard/my-appointments' },
  { label: 'Daksh', tone: 'bg-[#f2ecfa]', icon: 'info', path: '/dashboard/daksh' },
  { label: 'eVisit', tone: 'bg-[#eaf4fc]', icon: 'info', path: '/dashboard/evisit' },
  { label: 'eVisit History', tone: 'bg-[#f7eaf4]', icon: 'history', path: '/dashboard/evisit-history' },
  { label: 'Lab Reports', tone: 'bg-[#f5f7fb]', icon: 'lab', path: '/dashboard/lab-reports' },
];

const DashboardCard = ({ label, tone, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-[176px] rounded-[20px] px-4 py-4 text-left shadow-[0_3px_10px_rgba(0,0,0,0.12)] ${tone} cursor-pointer transition-opacity hover:opacity-90 active:opacity-95`}
  >
    <div className="flex h-full flex-col items-center justify-between py-1">
      <div className="flex h-[84px] w-full items-start justify-center pt-1">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-transparent text-slate-900">
          <TileIcon type={icon} className="h-[62px] w-[62px]" />
        </div>
      </div>
      <p className="px-1 text-center font-[Georgia] text-[19px] font-bold leading-[1.02] text-[#36439a]">{label}</p>
    </div>
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-[#1f2937]">
      <div className="sticky top-0 z-30">
        <div className="h-[44px] bg-[#3947a8]" />
        <div className="border-b border-black/5 bg-white px-4 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-[430px] items-center justify-between">
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

      <main className="mx-auto w-full max-w-[430px] px-2 pt-1">
        <section className="grid grid-cols-2 gap-x-3 gap-y-4 pt-0">
          {dashboardCards.map((card) => (
            <DashboardCard key={card.label} {...card} onClick={() => navigate(card.path)} />
          ))}
        </section>

        <div className="h-6" />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white shadow-[0_-3px_14px_rgba(0,0,0,0.08)]">
        <div className="mx-auto grid max-w-[430px] grid-cols-3 px-2 py-2 text-center font-[Georgia] text-[13px] font-semibold text-[#36439a]">
          <button type="button" className="flex flex-col items-center gap-1" onClick={() => navigate('/login')}>
            <span className="text-[28px] leading-none text-[#36439a]">+</span>
            <span>Switch Patient</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1" onClick={() => window.open('https://aiimsbhopal.edu.in', '_blank', 'noopener,noreferrer')}>
            <span className="text-[28px] leading-none text-[#5b5b5b]">▲</span>
            <span className="text-[#5b5b5b]">Navigate to Hospital</span>
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

export default Dashboard;