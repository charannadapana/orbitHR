import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Building2,
  Clock3,
  Megaphone,
  Send,
  Sparkles,
  Users2,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, MiniChartLegend, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { analyticsService } from '../api/analyticsService';
import { dashboardService } from '../api/dashboardService';
import { announcementService } from '../api/announcementService';
import { staggerChild, staggerParent } from '../lib/motion';

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [draft, setDraft] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryResult, announcementsResult, analyticsResult] = await Promise.all([
          dashboardService.getAdminSummary(),
          announcementService.getAnnouncements(),
          analyticsService.getAdminAnalytics(),
        ]);

        if (summaryResult.success) setSummary(summaryResult.data);
        if (announcementsResult.success) setAnnouncements(announcementsResult.data || []);
        if (analyticsResult.success) setAnalytics(analyticsResult.data || null);
      } catch (err) {
        setError('Unable to load admin insights right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const cards = summary?.cards || {};

  const attendanceData = useMemo(() => {
    const raw = summary?.attendanceToday || {};
    return [
      { name: 'Present', value: raw.present || 0, color: '#32ff9d' },
      { name: 'Absent', value: raw.absent || 0, color: '#ff6b81' },
      { name: 'Late', value: raw.late || 0, color: '#ffd076' },
      { name: 'Half Day', value: raw.halfDay || 0, color: '#4dd8ff' },
      { name: 'On Leave', value: raw.onLeave || 0, color: '#8ab7ff' },
    ];
  }, [summary]);

  const leaveData = useMemo(() => {
    const raw = summary?.leaveStatus || {};
    return [
      { name: 'Pending', value: raw.pending || 0, color: '#ffd076' },
      { name: 'Approved', value: raw.approved || 0, color: '#32ff9d' },
      { name: 'Rejected', value: raw.rejected || 0, color: '#ff6b81' },
      { name: 'Cancelled', value: raw.cancelled || 0, color: '#8b9ab2' },
    ];
  }, [summary]);

  const activityCurve = attendanceData.map((item, index) => ({
    name: item.name,
    volume: item.value,
    glow: Math.max(1, item.value + index * 2),
  }));

  const topSkills = summary?.topSkills || [];
  const analyticsLeaderboard = analytics?.leaderboard || [];
  const analyticsTrend = analytics?.trends || [];

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    if (!draft.title || !draft.message) return;

    try {
      setPosting(true);
      const result = await announcementService.createAnnouncement(draft);
      if (result.success) {
        setAnnouncements((prev) => [result.data, ...prev]);
        setDraft({ title: '', message: '' });
      }
    } catch (err) {
      setError('Broadcast could not be published.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Executive dashboard"
        title="Orchestrate the whole organization from one immersive control room."
        subtitle="Monitor workforce health, attendance pressure, leave demand, and capability coverage without losing the premium SaaS polish."
      />

      {error ? (
        <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {[
          { label: 'Total workforce', value: cards.totalEmployees ?? '--', hint: 'Company-wide active records', icon: Users2, accent: '#4dd8ff' },
          { label: 'Active today', value: cards.activeEmployees ?? '--', hint: 'People currently clocked in', icon: Activity, accent: '#32ff9d' },
          { label: 'Pending leaves', value: cards.pendingLeaves ?? '--', hint: 'Requests waiting for review', icon: Clock3, accent: '#ffd076' },
          { label: 'Skill modules', value: cards.totalSkills ?? '--', hint: 'Library coverage across roles', icon: Sparkles, accent: '#8ab7ff' },
        ].map((item) => (
          <motion.div key={item.label} variants={staggerChild}>
            <StatCard {...item} trend="Live telemetry" />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Attendance pulse" subtitle="Today’s workforce distribution with a softer, premium motion profile." extra={<Pill tone="green">Real time</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : (
            <>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityCurve}>
                    <defs>
                      <linearGradient id="attendance-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4dd8ff" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#4dd8ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                    <Area type="monotone" dataKey="glow" stroke="#4dd8ff" strokeWidth={2.5} fill="url(#attendance-fill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <MiniChartLegend items={attendanceData.map((item) => ({ label: `${item.name} ${item.value}`, color: item.color }))} />
            </>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Leave mix" subtitle="Operational pressure across current request statuses." extra={<Pill tone="amber">Review queue</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : (
            <>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveData} dataKey="value" innerRadius={72} outerRadius={110} paddingAngle={5}>
                      {leaveData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <MiniChartLegend items={leaveData.map((item) => ({ label: `${item.name} ${item.value}`, color: item.color }))} />
            </>
          )}
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Top competencies" subtitle="Which skills are defining your organization right now." extra={<Building2 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
            </div>
          ) : topSkills.length === 0 ? (
            <EmptyState icon={Sparkles} title="No skill telemetry yet" description="Once employees are assigned skills, this panel turns into a capability heat zone." />
          ) : (
            <div className="space-y-4">
              {topSkills.slice(0, 5).map((skill, index) => {
                const pct = Math.min(100, (skill.assignedCount / 10) * 100);
                return (
                  <div key={skill._id || skill.name} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{skill._id || skill.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{skill.assignedCount} team members endorsed</p>
                      </div>
                      <Pill tone={index % 2 === 0 ? 'blue' : 'green'}>{pct}% reach</Pill>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: index * 0.08 }}
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#4dd8ff,#32ff9d)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Broadcast center" subtitle="Post crisp updates into the workspace with minimal friction." extra={<Megaphone className="h-4 w-4 text-[var(--accent-2)]" />} />
          <form onSubmit={submitAnnouncement} className="grid gap-4 md:grid-cols-[0.9fr_1.1fr_auto]">
            <FloatingField
              label="Headline"
              placeholder="Quarterly planning sync"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
            <FloatingField
              label="Message"
              as="textarea"
              rows={1}
              placeholder="Share the update everyone needs right now."
              value={draft.message}
              onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
              className="resize-none"
            />
            <div className="flex items-end">
              <ActionButton type="submit" disabled={posting} className="w-full md:w-auto">
                <Send className="h-4 w-4" />
                {posting ? 'Sending...' : 'Publish'}
              </ActionButton>
            </div>
          </form>

          <div className="mt-6 grid gap-3">
            {announcements.length === 0 ? (
              <EmptyState icon={Megaphone} title="No broadcasts yet" description="Announcements published here become the pulse feed for the rest of the organization." />
            ) : (
              announcements.slice(0, 5).map((item) => (
                <motion.div key={item._id} whileHover={{ y: -2 }} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{item.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Delivery trend" subtitle="Organization-wide completion rhythm for the selected month." extra={<Pill tone="green">Analytics</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : analyticsTrend.length === 0 ? (
            <EmptyState icon={Activity} title="No delivery data yet" description="Task completions will appear here as the month develops." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsTrend}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                  <Bar dataKey="tasksCompleted" radius={[10, 10, 0, 0]} fill="#32ff9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Top performers" subtitle="Ranked by task completion and attendance score." />
          {loading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
            </div>
          ) : analyticsLeaderboard.length === 0 ? (
            <EmptyState icon={Users2} title="No leaderboard yet" description="Once work and attendance records accumulate, this surface becomes your performance board." />
          ) : (
            <div className="space-y-4">
              {analyticsLeaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.employee._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">#{index + 1} {entry.employee.firstName} {entry.employee.lastName}</p>
                      <p className="mt-1 text-sm text-[var(--text-body)]">{entry.employee.department} • {entry.employee.designation}</p>
                    </div>
                    <Pill tone={index === 0 ? 'green' : 'blue'}>{Math.round(entry.score * 100)} score</Pill>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Tasks {Math.round(entry.taskCompletionRate * 100)}% • Attendance {Math.round(entry.attendancePercentage * 100)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default AdminDashboardPage;
