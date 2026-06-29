import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { ElevatedSurface, FloatingField } from '../components/ui/saas';
import { useAuth } from '../contexts/AuthContext';

const metrics = [
  { label: 'Live sync', value: '24/7' },
  { label: 'Team visibility', value: '360' },
  { label: 'Operational lag', value: '-42%' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
      return;
    }

    const nextPath =
      result.user?.role === 'admin'
        ? '/admin/dashboard'
        : result.user?.role === 'manager'
          ? '/manager/dashboard'
          : '/employee/dashboard';

    navigate(nextPath, { replace: true });
  };

  return (
    <AppLayout>
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden px-10 py-10 lg:flex">
          <div className="glass-panel-strong animate-pan relative flex w-full flex-col justify-between rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(77,216,255,.14),rgba(50,255,157,.08),rgba(255,255,255,.04))] p-10">
            <div className="flex items-center gap-3">
              <img src="/orbithr.png" alt="OrbitHR" className="h-11 w-11" />
              <div>
                <p className="text-2xl font-extrabold text-[var(--text-strong)]">OrbitHR</p>
                <p className="text-xs uppercase tracking-[0.34em] text-[var(--text-muted)]">People Operating System</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--accent-2)]">Premium HR control room</p>
              <h1 className="text-5xl font-extrabold leading-tight text-gradient">
                The employee platform that finally feels as sharp as the team behind it.
              </h1>
              <p className="mt-6 text-base leading-7 text-[var(--text-body)]">
                Track workforce health, operational rhythm, leave pressure, and growth signals in one immersive workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="glass-panel rounded-[28px] p-5">
                  <p className="text-3xl font-extrabold text-[var(--text-strong)]">{metric.value}</p>
                  <p className="mt-2 text-sm text-[var(--text-body)]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <ElevatedSurface className="w-full max-w-xl rounded-[36px] p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--text-body)] transition hover:text-[var(--text-strong)]">
                <img src="/orbithr.png" alt="OrbitHR" className="h-9 w-9 lg:hidden" />
                OrbitHR portal
              </Link>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Secure access
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-4xl">Welcome back</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
                Sign in to review live workforce performance, attendance patterns, and your latest operational updates.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingField
                label="Work email"
                icon={Mail}
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
              <FloatingField
                label="Password"
                icon={LockKeyhole}
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                required
              />

              {error ? (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </motion.div>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(135deg,#4dd8ff,#32ff9d)] text-sm font-bold text-slate-950 shadow-[0_20px_50px_rgba(50,255,157,0.18)] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Enter workspace'}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>

            <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-400/12 p-2 text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm text-[var(--text-body)]">Managed access with role-aware routes and protected sessions.</p>
              </div>
              <Link to="/register" className="text-sm font-semibold text-[var(--accent-2)] transition hover:text-[var(--text-strong)]">
                Create account
              </Link>
            </div>
          </ElevatedSurface>
        </section>
      </div>
    </AppLayout>
  );
};

export default LoginPage;
