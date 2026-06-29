import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, LockKeyhole, Mail, UserRound, Users } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { ElevatedSurface, FloatingField, Segmented } from '../components/ui/saas';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../api/teamService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [portal, setPortal] = useState('employee');
  const [teamOptions, setTeamOptions] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    teamName: '',
  });

  useEffect(() => {
    const loadTeamOptions = async () => {
      try {
        const result = await teamService.getTeamOptions();
        if (result.success) {
          setTeamOptions(result.data || []);
        }
      } catch (err) {
        setTeamOptions([]);
      }
    };

    loadTeamOptions();
  }, []);

  const managerTeamOptions = useMemo(() => teamOptions || [], [teamOptions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (portal === 'manager' && !formData.teamName) {
      setError('Please select a team for the manager account.');
      return;
    }

    const result = await register({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      role: portal,
      teamName: portal === 'manager' ? formData.teamName : undefined,
    });
    if (!result.success) {
      setError(result.error || 'Unable to create account.');
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
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <ElevatedSurface className="grid w-full max-w-6xl gap-8 rounded-[40px] p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="glass-panel rounded-[34px] p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--accent-2)]">Portal onboarding</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-4xl">Create your OrbitHR profile</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">
              Start with a polished workspace identity and step into a modern employee operating system built for momentum.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Role-based dashboards with immersive analytics',
                'Shared visual system across attendance, leave, skills, and payroll',
                'Responsive workspace that feels premium on mobile and desktop',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[24px] bg-white/5 p-4">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <p className="text-sm text-[var(--text-body)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] p-2 sm:p-4">
            <div className="mb-8 flex items-center justify-between">
              <Link to="/login" className="text-sm font-semibold text-[var(--text-body)] transition hover:text-[var(--text-strong)]">
                Back to sign in
              </Link>
              <img src="/orbithr.png" alt="OrbitHR" className="h-10 w-10" />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-strong)] sm:text-3xl">Choose your entry point</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
                Create an employee or manager account with the right team workflow from the first step. Managers claim a predefined team, and employees join later through approval.
              </p>
            </div>

            <Segmented
              value={portal}
              onChange={setPortal}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
              ]}
              className="mb-6"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FloatingField
                  label="First name"
                  icon={UserRound}
                  placeholder="Aarav"
                  value={formData.firstName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))}
                  required
                />
                <FloatingField
                  label="Last name"
                  icon={Users}
                  placeholder="Sharma"
                  value={formData.lastName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))}
                  required
                />
              </div>

              <FloatingField
                label="Work email"
                icon={Mail}
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                required
              />

              {portal === 'manager' ? (
                <FloatingField
                  label="Select team"
                  icon={Building2}
                  as="select"
                  value={formData.teamName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, teamName: event.target.value }))}
                  required
                >
                  <option value="">Choose your team</option>
                  {managerTeamOptions.map((team) => (
                    <option key={team.name} value={team.name} disabled={team.hasManager}>
                      {team.name}{team.hasManager ? ' (Already assigned)' : ''}
                    </option>
                  ))}
                </FloatingField>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <FloatingField
                  label="Password"
                  icon={LockKeyhole}
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <FloatingField
                  label="Confirm password"
                  icon={LockKeyhole}
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(event) => setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  required
                />
              </div>

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
                {loading ? 'Creating account...' : `Create ${portal} workspace`}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
          </div>
        </ElevatedSurface>
      </div>
    </AppLayout>
  );
};

export default RegisterPage;
