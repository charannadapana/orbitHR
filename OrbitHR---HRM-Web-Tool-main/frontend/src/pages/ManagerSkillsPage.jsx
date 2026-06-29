import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Users2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { skillService } from '../api/skillService';
import { teamService } from '../api/teamService';

const ManagerSkillsPage = () => {
  const [team, setTeam] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [filters, setFilters] = useState({ search: '', level: '' });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const teamResult = await teamService.getMyManagedTeam();
      const members = teamResult.success ? teamResult.data?.members || [] : [];
      setTeam(members);

      if (members.length) {
        setSelectedEmployeeId((current) => current || members[0]._id);
        const results = await Promise.all(
          members.map(async (member) => {
            const result = await skillService.getEmployeeSkills(member._id);
            return [member._id, result.success ? result.data || [] : []];
          }),
        );

        setAssignments(Object.fromEntries(results));
      } else {
        setAssignments({});
      }
    } catch (err) {
      setError('Team skill visibility could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedAssignments = useMemo(() => {
    const employeeSkills = assignments[selectedEmployeeId] || [];
    return employeeSkills.filter((assignment) => {
      const matchesSearch = !filters.search.trim()
        || assignment.skillId?.name?.toLowerCase().includes(filters.search.trim().toLowerCase())
        || assignment.skillId?.category?.toLowerCase().includes(filters.search.trim().toLowerCase());
      const matchesLevel = !filters.level || String(assignment.proficiencyLevel) === String(filters.level);
      return matchesSearch && matchesLevel;
    });
  }, [assignments, filters.level, filters.search, selectedEmployeeId]);

  const teamInsights = useMemo(() => {
    const allAssignments = Object.values(assignments).flat();
    const primaryCount = allAssignments.filter((assignment) => assignment.isPrimary).length;
    const expertCount = allAssignments.filter((assignment) => assignment.proficiencyLevel >= 4).length;
    return {
      totalAssignments: allAssignments.length,
      primaryCount,
      expertCount,
    };
  }, [assignments]);

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Team skills"
        title="Review your team’s capability map without taking ownership away from employee profiles."
        subtitle="Managers get read-only visibility into skills across their own team, with filters that make staffing and planning much easier."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Team roster" subtitle="Choose a team member to inspect their current skill profile." extra={<Users2 className="h-4 w-4 text-[var(--accent)]" />} />
          {loading ? (
            <SkeletonBlock className="h-80" />
          ) : team.length === 0 ? (
            <EmptyState icon={Users2} title="No team members yet" description="As soon as employees join and build out their profiles, you will see their skills here." />
          ) : (
            <div className="space-y-3">
              {team.map((member) => {
                const active = selectedEmployeeId === member._id;
                const memberSkills = assignments[member._id] || [];

                return (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(member._id)}
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                      active
                        ? 'border-cyan-300/30 bg-white/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">
                          {member.userId?.firstName} {member.userId?.lastName}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{member.designation || member.department}</p>
                      </div>
                      <Pill tone="blue">{memberSkills.length} skills</Pill>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {memberSkills.slice(0, 3).map((assignment) => (
                        <Pill key={assignment._id} tone="dark" className="normal-case tracking-normal text-[11px]">
                          {assignment.skillId?.name}
                        </Pill>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </AppSurface>

        <div className="space-y-6">
          <AppSurface className="p-6">
            <SurfaceHeader title="Capability snapshot" subtitle="A quick read on total mapped skills, advanced capability depth, and primary expertise." extra={<Sparkles className="h-4 w-4 text-[var(--accent-2)]" />} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Mapped skills</p>
                <p className="mt-3 text-3xl font-bold text-[var(--text-strong)]">{teamInsights.totalAssignments}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Primary strengths</p>
                <p className="mt-3 text-3xl font-bold text-[var(--text-strong)]">{teamInsights.primaryCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Advanced / expert</p>
                <p className="mt-3 text-3xl font-bold text-[var(--text-strong)]">{teamInsights.expertCount}</p>
              </div>
            </div>
          </AppSurface>

          <AppSurface className="p-6">
            <SurfaceHeader title="Visible skills" subtitle="Read-only visibility with useful filters for planning, staffing, and reviews." extra={<Search className="h-4 w-4 text-[var(--accent)]" />} />
            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <FloatingField label="Search skill or category" value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="React, data, design systems..." />
              <FloatingField label="Minimum level view" as="select" value={filters.level} onChange={(event) => setFilters((prev) => ({ ...prev, level: event.target.value }))}>
                <option value="">All levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </FloatingField>
            </div>

            {loading ? (
              <SkeletonBlock className="h-80" />
            ) : selectedAssignments.length === 0 ? (
              <EmptyState icon={Sparkles} title="No matching skills" description="Try a different team member or loosen the current filters." />
            ) : (
              <div className="space-y-4">
                {selectedAssignments.map((assignment) => (
                  <div key={assignment._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{assignment.skillId?.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{assignment.skillId?.category}</p>
                      </div>
                      <Pill tone="blue">Level {assignment.proficiencyLevel}</Pill>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4dd8ff,#32ff9d)]" style={{ width: `${(assignment.proficiencyLevel / 5) * 100}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-body)]">
                      <span>{assignment.yearsOfExperience} years experience</span>
                      {assignment.isPrimary ? <Pill tone="green" className="normal-case tracking-normal text-[11px]">Primary skill</Pill> : null}
                    </div>
                    {assignment.notes ? <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{assignment.notes}</p> : null}
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

export default ManagerSkillsPage;
