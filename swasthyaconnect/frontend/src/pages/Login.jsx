import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'patient',
    name: '',
    specialization: '',
    phone: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const routeByRole = (role) => {
    if (role === 'doctor') navigate('/doctor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/patient');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = isSignup
        ? await signup({
            email: form.email,
            password: form.password,
            role: form.role,
            name: form.name,
            specialization: form.specialization,
            phone: form.phone,
          })
        : await login(form.email, form.password);

      routeByRole(user.role);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Authentication failed.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-login-gradient">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-white/30 bg-white/70 p-8 shadow-xl backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-700">AIIMS Inspired HMS</p>
            <h1 className="text-4xl font-black leading-tight text-slate-900">SwasthyaConnect</h1>
            <p className="text-base text-slate-700">
              Unified OPD, clinical workflows, pharmacy logistics, and emergency triage on one secure operational platform.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="rounded-xl bg-white/80 px-4 py-3">Live token queue and doctor waitlist orchestration</li>
              <li className="rounded-xl bg-white/80 px-4 py-3">Digital prescription and medical timeline continuity</li>
              <li className="rounded-xl bg-white/80 px-4 py-3">Emergency and inventory command center for administrators</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">{isSignup ? 'Create Account' : 'Sign In'}</h2>
              <button
                type="button"
                onClick={() => setIsSignup((prev) => !prev)}
                className="text-sm font-semibold text-cyan-700 hover:text-cyan-600"
              >
                {isSignup ? 'Use Login' : 'Create New'}
              </button>
            </div>

            <div className="space-y-4">
              {isSignup && (
                <>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="input-field"
                  />
                  <select name="role" value={form.role} onChange={handleChange} className="input-field" required>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                  {form.role === 'doctor' && (
                    <input
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="Specialization"
                      className="input-field"
                    />
                  )}
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="input-field" />
                </>
              )}

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="input-field"
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                minLength={8}
                required
                className="input-field"
              />
            </div>

            {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isSignup ? 'Register & Continue' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
