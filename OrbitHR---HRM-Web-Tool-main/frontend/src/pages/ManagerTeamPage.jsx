import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Sparkles, UserRoundPlus, Users2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { attendanceService } from '../api/attendanceService';
import { leaveService } from '../api/leaveService';
import { skillService } from '../api/skillService';
import { teamService } from '../api/teamService';

const ManagerTeamPage = () => {
  const [teamInfo, setTeamInfo] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [skillMap, setSkillMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState('');
  const [requestActionId, setRequestActionId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [teamResult, attendanceResult, leaveResult] = await Promise.all([
        teamService.getMyManagedTeam(),
        attendanceService.getTeamAttendance({ limit: 50 }),
        leaveService.getTeamLeaves({ limit: 50 }),
      ]);

      const nextTeam = teamResult.success ? teamResult.data || null : null;
      setTeamInfo(nextTeam);
      if (attendanceResult.success) setAttendance(attendanceResult.data || []);
      if (leaveResult.success) setLeaves(leaveResult.data || []);

      const members = nextTeam?.members || [];
      if (members.length) {
        const skillResults = await Promise.all(
          members.map(async (member) => {
            try {
              const result = await skillService.getEmployeeSkills(member._id);
              return [member._id, result.success ? result.data || [] : []];
            } catch (err) {
              return [member._id, []];
            }
          }),
        );
        setSkillMap(Object.fromEntries(skillResults));
      } else {
        setSkillMap({});
      }
    } catch (err) {
      setError('Team workspace could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reviewLeave = async (id, status) => {
    try {
      setReviewingId(id);
      const result = await leaveService.reviewLeave(id, { status });
      if (result.success) {
        setLeaves((prev) => prev.map((item) => (item._id === id ? result.data : item)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this leave request.');
    } finally {
      setReviewingId('');
    }
  };

  const reviewJoinRequest = async (id, status) => {
    try {
      setRequestActionId(id);
      const result = await teamService.reviewJoinRequest(id, status);
      if (result.success) {
        await load();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review this join request.');
    } finally {
      setRequestActionId('');
    }
  };

  const members = teamInfo?.members || [];
  const pendingRequests = useMemo(
    () => (teamInfo?.pendingRequests || []).filter((request) => request.status === 'pending'),
    [teamInfo],
  );

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Team operations"
        title="Own your team like a real manager: approve join requests, track capacity, and manage mapped skills."
        subtitle="This board now runs on explicit team ownership instead of loose reporting fallbacks, so every action stays scoped to your actual members."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <StatCard label="Managed team" value={teamInfo?.name || '--'} hint="Predefined team you own" icon={Users2} accent="#4dd8ff" />
        <StatCard label="Members" value={members.length} hint="Approved team members" icon={Users2} accent="#32ff9d" />
        <StatCard label="Pending requests" value={pendingRequests.length} hint="Waiting for your decision" icon={UserRoundPlus} accent="#ffd076" />
        <StatCard label="Open leaves" value={leaves.filter((item) => item.status === 'pending').length} hint="Requests needing review" icon={CalendarClock} accent="#8ab7ff" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Team members" subtitle="Approved roster with skills, timelines, documents, and status." extra={<Users2 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
          ) : members.length === 0 ? (
            <EmptyState icon={Users2} title="No approved team members yet" description="Once you approve join requests, people will appear here with their attendance, leave, and skill context." />
          ) : (
            <div className="grid gap-4">
              {members.map((member) => {
                const memberSkills = skillMap[member._id] || [];
                return (
                  <div key={member._id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{member.userId?.firstName} {member.userId?.lastName}</p>
                        <p className="mt-1 text-sm text-[var(--text-body)]">{member.designation} • {member.department}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{member.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {memberSkills.length ? memberSkills.slice(0, 4).map((skill) => (
                            <Pill key={skill._id} tone="blue">{skill.skillId?.name}</Pill>
                          )) : <Pill tone="dark">No skills mapped</Pill>}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        <Pill tone={member.status === 'active' ? 'green' : 'dark'}>{member.status}</Pill>
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/manager/team/${member._id}/timeline`} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-body)]">
                            Timeline
                          </Link>
                          <Link to={`/manager/team/${member._id}/documents`} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-body)]">
                            Docs
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AppSurface>

        <div className="space-y-6">
          <AppSurface className="p-6">
            <SurfaceHeader title="Join requests" subtitle="Approve or reject incoming requests for your team." extra={<UserRoundPlus className="h-4 w-4 text-[var(--accent-2)]" />} />
            {loading ? (
              <div className="space-y-4"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
            ) : pendingRequests.length === 0 ? (
              <EmptyState icon={UserRoundPlus} title="No pending join requests" description="Employees who request this team will show up here for review." />
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">
                          {request.employeeId?.userId?.firstName} {request.employeeId?.userId?.lastName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-body)]">{request.employeeId?.designation || 'Unassigned'}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{request.employeeId?.userId?.email}</p>
                      </div>
                      <Pill tone="amber">{request.status}</Pill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => reviewJoinRequest(request._id, 'approved')}
                        disabled={requestActionId === request._id}
                        className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewJoinRequest(request._id, 'rejected')}
                        disabled={requestActionId === request._id}
                        className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-rose-300 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppSurface>

          <AppSurface className="p-6">
            <SurfaceHeader title="Recent leave pressure" subtitle="Pending leave requests from your approved members." extra={<CalendarClock className="h-4 w-4 text-[var(--accent)]" />} />
            {loading ? (
              <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
            ) : leaves.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No leave requests" description="Approved, pending, and rejected leave items from your team appear here." />
            ) : (
              <div className="space-y-4">
                {leaves.slice(0, 5).map((leave) => (
                  <div key={leave._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{leave.userId?.firstName} {leave.userId?.lastName}</p>
                        <p className="mt-1 text-sm text-[var(--text-body)]">{leave.leaveType} • {leave.daysCount} days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={leave.status === 'approved' ? 'green' : leave.status === 'pending' ? 'amber' : leave.status === 'rejected' ? 'red' : 'dark'}>{leave.status}</Pill>
                        {leave.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => reviewLeave(leave._id, 'approved')}
                              disabled={reviewingId === leave._id}
                              className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => reviewLeave(leave._id, 'rejected')}
                              disabled={reviewingId === leave._id}
                              className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-rose-300 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppSurface>

          <AppSurface className="p-6">
            <SurfaceHeader title="Attendance signals" subtitle="Recent check-in activity from approved members." extra={<Sparkles className="h-4 w-4 text-[var(--accent-2)]" />} />
            {loading ? (
              <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
            ) : attendance.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No attendance records" description="Attendance entries will show up here as the team checks in." />
            ) : (
              <div className="space-y-4">
                {attendance.slice(0, 5).map((record) => (
                  <div key={record._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{record.userId?.firstName} {record.userId?.lastName}</p>
                        <p className="mt-1 text-sm text-[var(--text-body)]">
                          {record.checkInTime || '--'} to {record.checkOutTime || 'Working'}
                        </p>
                      </div>
                      <Pill tone={record.status === 'present' ? 'green' : record.status === 'late' ? 'amber' : 'dark'}>
                        {record.workingHours || 0}h
                      </Pill>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppSurface>
        </div>
      </div>
    </AppShell>
  );
};

export default ManagerTeamPage;
