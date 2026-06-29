import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, CalendarDays, CheckCircle2, PieChart as PieChartIcon, Scale, Trophy, Users2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsService } from '../api/analyticsService';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';

const chartTooltip = {
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(11,16,24,0.92)',
  color: '#fff',
};

const taskPieColors = ['#32ff9d', '#ffd076'];
const workloadColor = '#4dd8ff';

const ManagerAnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [taskPerformance, setTaskPerformance] = useState(null);
  const [attendanceTrends, setAttendanceTrends] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [overviewResult, taskResult, attendanceResult, rankingResult, workloadResult] = await Promise.all([
          analyticsService.getTeamOverview(),
          analyticsService.getTaskPerformance(),
          analyticsService.getAttendanceTrends(),
          analyticsService.getPerformanceRanking(),
          analyticsService.getWorkload(),
        ]);

        if (overviewResult.success) setOverview(overviewResult.data || null);
        if (taskResult.success) setTaskPerformance(taskResult.data || null);
        if (attendanceResult.success) setAttendanceTrends(attendanceResult.data || null);
        if (rankingResult.success) setRanking(rankingResult.data || null);
        if (workloadResult.success) setWorkload(workloadResult.data || null);
      } catch (err) {
        setError('Team analytics could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 45000);
    return () => window.clearInterval(interval);
  }, []);

  const completionBarData = useMemo(
    () => (taskPerformance?.tasksCompletedPerEmployee || []).map((item) => ({
      name: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim() || 'Unknown',
      completed: item.value,
    })),
    [taskPerformance],
  );

  const taskStatusPieData = useMemo(
    () => [
      { name: 'Completed', value: taskPerformance?.totals?.completed || 0 },
      { name: 'Pending', value: taskPerformance?.totals?.pending || 0 },
    ],
    [taskPerformance],
  );

  const attendanceLineData = useMemo(
    () => (attendanceTrends?.trends || []).map((item) => ({
      date: item.date.slice(5),
      present: item.presentCount,
      absent: item.absentCount,
    })),
    [attendanceTrends],
  );

  const workloadData = useMemo(
    () => (workload?.workload || []).map((item) => ({
      name: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim() || 'Unknown',
      tasks: item.totalTasks,
      active: item.activeTasks,
    })),
    [workload],
  );

  const leaderboard = ranking?.rankings || [];

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Analytics"
        title="Track team performance through one focused analytics workspace."
        subtitle="This view combines task throughput, attendance rhythm, workload balance, and ranking signals for your own team only."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <StatCard label="Total employees" value={overview?.totalEmployees ?? '--'} hint="People in your current team" icon={Users2} accent="#4dd8ff" />
        <StatCard label="Tasks completed" value={overview?.completedTasks ?? '--'} hint="Closed team tasks" icon={CheckCircle2} accent="#32ff9d" />
        <StatCard label="Pending tasks" value={overview?.pendingTasks ?? '--'} hint="Tasks still in motion" icon={BarChart3} accent="#ffd076" />
        <StatCard label="Attendance %" value={overview ? `${Math.round((overview.averageAttendance || 0) * 100)}%` : '--'} hint="Last 30 days attendance rate" icon={Activity} accent="#8ab7ff" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Task performance" subtitle="Completed tasks per employee across your team." extra={<BarChart3 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-[340px]" />
          ) : !completionBarData.length ? (
            <EmptyState icon={BarChart3} title="No task activity yet" description="Once tasks are assigned and completed, this chart will show contribution by employee." />
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionBarData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar dataKey="completed" radius={[12, 12, 0, 0]} fill="#32ff9d" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Task split" subtitle="Completed versus pending work across your whole team." extra={<PieChartIcon className="h-4 w-4 text-[var(--accent-2)]" />} />
          {loading ? (
            <SkeletonBlock className="h-[340px]" />
          ) : !taskStatusPieData.some((item) => item.value > 0) ? (
            <EmptyState icon={PieChartIcon} title="No task totals yet" description="This chart appears as soon as your team starts receiving tasks." />
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusPieData} dataKey="value" innerRadius={70} outerRadius={112} paddingAngle={4}>
                    {taskStatusPieData.map((entry, index) => (
                      <Cell key={entry.name} fill={taskPieColors[index % taskPieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Attendance trends" subtitle="Last 30 days of present versus absent team counts." extra={<CalendarDays className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-[340px]" />
          ) : !attendanceLineData.length ? (
            <EmptyState icon={CalendarDays} title="No attendance data yet" description="The chart populates once your team has attendance records for the last 30 days." />
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceLineData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#32ff9d" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="absent" stroke="#ff6b81" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Performance leaderboard" subtitle="Ranked blend of completion and attendance for your team." extra={<Trophy className="h-4 w-4 text-[var(--accent-2)]" />} />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
          ) : !leaderboard.length ? (
            <EmptyState icon={Trophy} title="No rankings available yet" description="Rankings appear when the team has both tasks and attendance activity." />
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <motion.div key={entry.employee._id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">#{entry.rank} {entry.employee.firstName} {entry.employee.lastName}</p>
                      <p className="mt-1 text-sm text-[var(--text-body)]">{entry.employee.designation} • {entry.employee.department}</p>
                    </div>
                    <Pill tone={entry.rank === 1 ? 'green' : 'blue'}>{Math.round(entry.score * 100)} pts</Pill>
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Task completion {Math.round(entry.taskCompletionRate * 100)}% • Attendance {Math.round(entry.attendancePercentage * 100)}%
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>

      <div className="mt-6">
        <AppSurface className="p-6">
          <SurfaceHeader title="Workload distribution" subtitle="How tasks are spread across team members right now." extra={<Scale className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-[340px]" />
          ) : !workloadData.length ? (
            <EmptyState icon={Scale} title="No workload data yet" description="Once your team starts receiving tasks, this chart will show distribution across members." />
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9ab2', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Legend />
                  <Bar dataKey="tasks" name="Total tasks" radius={[12, 12, 0, 0]} fill={workloadColor} />
                  <Bar dataKey="active" name="Active tasks" radius={[12, 12, 0, 0]} fill="#ffd076" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default ManagerAnalyticsPage;
