import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  patient: [
    { label: 'Patient Dashboard', to: '/patient' },
    { label: 'Book OPD Slot', to: '/patient#booking' },
  ],
  doctor: [
    { label: 'Doctor Dashboard', to: '/doctor' },
    { label: 'Live Queue', to: '/doctor#queue' },
  ],
  admin: [
    { label: 'Admin Dashboard', to: '/admin' },
    { label: 'Operations Hub', to: '/admin#ops' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-full max-w-72 border-r border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="px-6 py-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-700">SwasthyaConnect</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">AIIMS Care Grid</h1>
        <p className="mt-4 text-sm text-slate-600">
          Logged in as <span className="font-semibold text-slate-900">{user?.name}</span>
        </p>
        <p className="text-xs uppercase tracking-wider text-slate-500">{user?.role}</p>
      </div>
      <nav className="space-y-2 px-4 pb-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
