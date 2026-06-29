import { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarCheck2, CreditCard, Megaphone, Sparkles, Target, TimerReset } from 'lucide-react';
import { Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, MiniChartLegend, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { dashboardService } from '../api/dashboardService';
import { announcementService } from '../api/announcementService';
import { payrollService } from '../api/payrollService';
import { teamService } from '../api/teamService';

const EmployeeDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [payslip, setPayslip] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const date = new Date();
        const [summaryResult, announcementResult, payrollResult, teamResult] = await Promise.all([
          dashboardService.getEmployeeSummary(),
          announcementService.getAnnouncements(),
          payrollService.getMyPayslip(date.getFullYear(), date.getMonth() + 1),
          teamService.getMyEmployeeTeam(),
        ]);

        if (summaryResult.success) setSummary(summaryResult.data);
        if (announcementResult.success) setAnnouncements(announcementResult.data || []);
        if (payrollResult.success) setPayslip(payrollResult.data);
        if (teamResult.success) setTeamInfo(teamResult.data || null);
      } catch (err) {
        setError('Your dashboard data could not be fully loaded.');
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
    const raw = summary?.attendanceSummary || {};
    return [
      { name: 'Present', value: raw.present || 0, color: '#32ff9d' },
      { name: 'Late', value: raw.late || 0, color: '#ffd076' },
      { name: 'Half Day', value: raw.halfDay || 0, color: '#4dd8ff' },
      { name: 'Leave', value: raw.onLeave || 0, color: '#8ab7ff' },
      { name: 'Absent', value: raw.absent || 0, color: '#ff6b81' },
    ].filter((item) => item.value > 0);
  }, [summary]);

  const skillRadar = useMemo(
    () => (summary?.topSkills || []).map((skill) => ({ skill: skill.name, value: skill.level || 0 })),
    [summary],
  );

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Personal workspace"
        title="See your performance rhythm, skill growth, and payroll readiness in one place."
        subtitle="A calmer employee dashboard with premium motion, better hierarchy, and all the essentials surfaced right where you need them."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <StatCard label="Attendance this month" value={cards.attendanceThisMonth ?? '--'} hint="Days recorded as present" icon={CalendarCheck2} accent="#4dd8ff" trend="Steady pulse" />
        <StatCard label="Approved leaves" value={cards.approvedLeaves ?? '--'} hint="Time off already cleared" icon={TimerReset} accent="#32ff9d" trend="Healthy balance" />
        <StatCard label="Pending requests" value={cards.pendingLeaves ?? '--'} hint="Items awaiting approval" icon={Target} accent="#ffd076" trend="Needs follow-up" />
        <StatCard label="Skill count" value={cards.skillsCount ?? '--'} hint="Capabilities mapped to your profile" icon={Sparkles} accent="#8ab7ff" trend="Profile growth" />
      </div>

      <div className="mt-6">
        <AppSurface className="p-6">
          <SurfaceHeader title="Team status" subtitle="Your current team assignment and manager visibility from the dashboard." extra={<Building2 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-36" />
          ) : teamInfo?.team ? (
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Current team</p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--text-strong)]">{teamInfo.team.name}</p>
                <p className="mt-2 text-sm text-[var(--text-body)]">
                  Manager: {teamInfo.team.managerId?.firstName} {teamInfo.team.managerId?.lastName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone="green">Assigned</Pill>
                <Link to="/employee/team" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-body)]">
                  Open team hub
                </Link>
              </div>
            </div>
          ) : teamInfo?.joinRequest ? (
            <div className="flex flex-col gap-4 rounded-[28px] border border-amber-300/16 bg-amber-300/8 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Pending request</p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--text-strong)]">{teamInfo.joinRequest.teamId?.name}</p>
                <p className="mt-2 text-sm text-[var(--text-body)]">Waiting for manager approval.</p>
              </div>
              <Link to="/employee/team" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-body)]">
                Track request
              </Link>
            </div>
          ) : (
            <EmptyState icon={Building2} title="No team connection yet" description="You can request to join a team from the team hub once a manager has claimed it." />
          )}
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Attendance composition" subtitle="Your distribution across attendance states this month." extra={<Pill tone="blue">Monthly</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : attendanceData.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="No attendance data yet" description="As records come in, this panel turns into a quick visual pulse of your month." />
          ) : (
            <>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceData} dataKey="value" innerRadius={70} outerRadius={112} paddingAngle={4}>
                      {attendanceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <MiniChartLegend items={attendanceData.map((item) => ({ label: `${item.name} ${item.value}`, color: item.color }))} />
            </>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Skill radar" subtitle="Your strongest capabilities mapped in a cleaner competency view." extra={<Pill tone="green">Growing</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : skillRadar.length === 0 ? (
            <EmptyState icon={Sparkles} title="No skill endorsements yet" description="Once skills are assigned, this radar becomes your growth map." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#b9c3d1', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#4dd8ff" fill="#4dd8ff" fillOpacity={0.28} strokeWidth={2.5} />
                  <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,16,24,0.92)', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AppSurface>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Notice stream" subtitle="Announcements that matter to your day, presented without clutter." extra={<Megaphone className="h-4 w-4 text-[var(--accent-2)]" />} />
          <div className="grid gap-3">
            {loading ? (
              <>
                <SkeletonBlock className="h-20" />
                <SkeletonBlock className="h-20" />
              </>
            ) : announcements.length === 0 ? (
              <EmptyState icon={Megaphone} title="No fresh announcements" description="Company updates will appear here as soon as they are posted." />
            ) : (
              announcements.slice(0, 4).map((item) => (
                <div key={item._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{item.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Payroll preview" subtitle="Your current compensation snapshot for this cycle." extra={<CreditCard className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-[280px]" />
          ) : !payslip ? (
            <EmptyState icon={CreditCard} title="No payslip available yet" description="This panel updates as payroll data becomes available for the selected month." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-emerald-300/16 bg-[linear-gradient(135deg,rgba(77,216,255,.12),rgba(50,255,157,.08))] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">Estimated take-home</p>
                <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">${payslip.finalSalary}</p>
                <p className="mt-2 text-sm text-[var(--text-body)]">Based on recorded payable days and current attendance.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Base salary</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--text-strong)]">${payslip.baseSalary}</p>
                </div>
                <div className="rounded-[24px] bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Payable days</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--text-strong)]">{payslip.totalPayableDays}</p>
                </div>
              </div>
            </div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default EmployeeDashboardPage;
