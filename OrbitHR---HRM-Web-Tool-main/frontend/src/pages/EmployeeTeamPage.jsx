import { useEffect, useMemo, useState } from 'react';
import { Building2, Send, ShieldCheck, UserRoundCheck, Users2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { teamService } from '../api/teamService';

const EmployeeTeamPage = () => {
  const [teamOptions, setTeamOptions] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [optionsResult, teamResult] = await Promise.all([
        teamService.getTeamOptions(),
        teamService.getMyEmployeeTeam(),
      ]);

      if (optionsResult.success) {
        setTeamOptions(optionsResult.data || []);
      }
      if (teamResult.success) {
        setTeamInfo(teamResult.data || null);
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

  const availableTeams = useMemo(
    () => (teamOptions || []).filter((team) => team.teamId && team.hasManager),
    [teamOptions],
  );

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!selectedTeamId) {
      setError('Please choose a team before sending the request.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const result = await teamService.createJoinRequest(selectedTeamId);
      if (result.success) {
        await load();
        setSelectedTeamId('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your join request.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentTeam = teamInfo?.team || null;
  const pendingRequest = teamInfo?.joinRequest || null;

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Team hub"
        title="See your reporting lane, manager ownership, and team join status in one place."
        subtitle="This keeps the employee-side team workflow simple: pick a team, request access, and track approval without hunting through the app."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="My team" subtitle="Your current placement, reporting manager, and roster context." extra={<Users2 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-56" />
          ) : currentTeam ? (
            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Assigned team</p>
                    <p className="mt-2 text-2xl font-extrabold text-[var(--text-strong)]">{currentTeam.name}</p>
                    <p className="mt-3 text-sm text-[var(--text-body)]">
                      Managed by {currentTeam.managerId?.firstName} {currentTeam.managerId?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{currentTeam.managerId?.email}</p>
                  </div>
                  <Pill tone="green">Active</Pill>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(currentTeam.members || []).map((member) => (
                  <div key={member._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-[var(--text-strong)]">
                      {member.userId?.firstName} {member.userId?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{member.designation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={Building2} title="No team assigned yet" description="Use the join request panel to request a spot in one of the manager-owned teams." />
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Join request" subtitle="Request access to a manager-owned team and track the outcome." extra={<ShieldCheck className="h-4 w-4 text-[var(--accent-2)]" />} />
          {loading ? (
            <SkeletonBlock className="h-56" />
          ) : currentTeam ? (
            <EmptyState icon={UserRoundCheck} title="You are already on a team" description="Your team assignment is active, so no additional request is needed right now." />
          ) : pendingRequest ? (
            <div className="rounded-[28px] border border-amber-300/16 bg-amber-300/8 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Pending request</p>
              <p className="mt-3 text-2xl font-extrabold text-[var(--text-strong)]">{pendingRequest.teamId?.name}</p>
              <p className="mt-3 text-sm text-[var(--text-body)]">
                Waiting for {pendingRequest.teamId?.managerId?.firstName} {pendingRequest.teamId?.managerId?.lastName} to review your request.
              </p>
              <div className="mt-4">
                <Pill tone="amber">{pendingRequest.status}</Pill>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <FloatingField
                label="Choose a team"
                as="select"
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                required
              >
                <option value="">Select a manager-owned team</option>
                {availableTeams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name}
                  </option>
                ))}
              </FloatingField>

              {availableTeams.length === 0 ? (
                <EmptyState icon={Building2} title="No open teams yet" description="Managers need to register and claim a predefined team before employees can request access." />
              ) : (
                <ActionButton type="submit" disabled={submitting}>
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending request...' : 'Send join request'}
                </ActionButton>
              )}
            </form>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default EmployeeTeamPage;
