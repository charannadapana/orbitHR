import { useEffect, useState } from 'react';
import { CheckCircle2, ListTodo, TimerReset, UserRoundPlus, Users2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { analyticsService } from '../api/analyticsService';
import { attendanceService } from '../api/attendanceService';
import { taskService } from '../api/taskService';
import { teamService } from '../api/teamService';

const localDateValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const ManagerDashboardPage = () => {
  const [team, setTeam] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [teamResult, taskResult, attendanceResult, analyticsResult] = await Promise.all([
          teamService.getMyManagedTeam(),
          taskService.getManagerTasks(),
          attendanceService.getTeamAttendance({ limit: 200 }),
          analyticsService.getManagerAnalytics(),
        ]);

        if (teamResult.success) {
          setTeamInfo(teamResult.data || null);
          setTeam(teamResult.data?.members || []);
        }
        if (taskResult.success) setTasks(taskResult.data || []);
        if (attendanceResult.success) setAttendance(attendanceResult.data || []);
        if (analyticsResult.success) setAnalytics(analyticsResult.data || null);
      } catch (err) {
        setError('Manager insights could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const todayKey = localDateValue();
  const todayAttendance = attendance.filter((item) => localDateValue(new Date(item.date)) === todayKey);
  const presentToday = todayAttendance.filter((item) => item.status === 'present' || item.status === 'late').length;
  const leaderboard = analytics?.leaderboard || [];
  const trendData = analytics?.trends || [];
  const pendingRequests = (teamInfo?.pendingRequests || []).filter((item) => item.status === 'pending');

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Manager cockpit"
        title="Lead the team with a workspace that surfaces people, priorities, and momentum together."
        subtitle="A tighter manager overview for headcount, attendance, tasks, and leaderboard signals, with less friction between observation and action."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <StatCard label="Team size" value={team.length} hint="Direct reports right now" icon={Users2} accent="#4dd8ff" />
        <StatCard label="Present today" value={presentToday} hint="People checked in now" icon={TimerReset} accent="#32ff9d" />
        <StatCard label="Open tasks" value={tasks.filter((task) => task.status !== 'completed').length} hint="Pending and in progress" icon={ListTodo} accent="#ffd076" />
        <StatCard label="Completed tasks" value={tasks.filter((task) => task.status === 'completed').length} hint="Delivery count to date" icon={CheckCircle2} accent="#8ab7ff" />
        <StatCard label="Join requests" value={pendingRequests.length} hint="Waiting for approval" icon={UserRoundPlus} accent="#ff9d4d" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Team pulse" subtitle="A cleaner roster snapshot with role and status cues." />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
          ) : team.length === 0 ? (
            <EmptyState icon={Users2} title="No team members yet" description="Once reports are assigned to you, this panel turns into a live people snapshot." />
          ) : (
            <div className="space-y-4">
              {team.map((member) => (
                <div key={member._id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{member.userId?.firstName} {member.userId?.lastName}</p>
                      <p className="mt-1 text-sm text-[var(--text-body)]">{member.designation} • {member.department}</p>
                    </div>
                    <Pill tone={member.status === 'active' ? 'green' : 'dark'}>{member.status}</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Task stream" subtitle="Recent assignments stay readable and action-oriented." />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
          ) : tasks.length === 0 ? (
            <EmptyState icon={ListTodo} title="No tasks assigned yet" description="As soon as tasks are created, this turns into a progress stream for the team." />
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 6).map((task) => (
                <div key={task._id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--text-body)]">{task.description || 'No description provided.'}</p>
                    </div>
                    <Pill tone={task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'amber' : 'dark'}>{task.status}</Pill>
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">Assigned to {task.assignedTo?.email || 'team member'} • due {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Performance curve" subtitle="Daily completion and attendance momentum across the current month." extra={<Pill tone="blue">Analytics</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : trendData.length === 0 ? (
            <EmptyState icon={ListTodo} title="No analytics yet" description="Once tasks and attendance records accumulate, this turns into a live performance curve." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="manager-trend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#32ff9d" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#32ff9d" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                  <Area type="monotone" dataKey="tasksCompleted" stroke="#32ff9d" strokeWidth={2.5} fill="url(#manager-trend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Leaderboard" subtitle="Who is converting work and attendance into the strongest monthly score." />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
          ) : leaderboard.length === 0 ? (
            <EmptyState icon={Users2} title="No ranked employees yet" description="The leaderboard appears as soon as the team has task and attendance data." />
          ) : (
            <div className="space-y-4">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.employee._id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">#{index + 1} {entry.employee.firstName} {entry.employee.lastName}</p>
                      <p className="mt-1 text-sm text-[var(--text-body)]">{entry.employee.designation} • {entry.employee.department}</p>
                    </div>
                    <Pill tone={index === 0 ? 'green' : 'blue'}>{Math.round(entry.score * 100)} score</Pill>
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Tasks {Math.round(entry.taskCompletionRate * 100)}% • Attendance {Math.round(entry.attendancePercentage * 100)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>

      <div className="mt-6">
        <AppSurface className="p-6">
          <SurfaceHeader title="Join requests" subtitle="New employees waiting to join your team." extra={<Pill tone="amber">{pendingRequests.length} pending</Pill>} />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
          ) : pendingRequests.length === 0 ? (
            <EmptyState icon={UserRoundPlus} title="No join requests right now" description="When employees request access to your team, they will show up here and in the team operations page." />
          ) : (
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request._id} className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-strong)]">
                      {request.employeeId?.userId?.firstName} {request.employeeId?.userId?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{request.employeeId?.userId?.email}</p>
                  </div>
                  <Link to="/manager/team" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-body)]">
                    Review in team ops
                  </Link>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default ManagerDashboardPage;
