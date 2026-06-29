import { useEffect, useMemo, useState } from 'react';
import { Building2, Users2, Waves, Workflow } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { employeeService } from '../api/employeeService';

const palette = ['#4dd8ff', '#32ff9d', '#ffd076', '#8ab7ff', '#ff8ab0', '#c7ff79'];

const AdminDepartmentsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [employeesResult, statsResult] = await Promise.all([
          employeeService.getAllEmployees({ limit: 200 }),
          employeeService.getEmployeeStats(),
        ]);
        if (employeesResult.success) setEmployees(employeesResult.data || []);
        if (statsResult.success) setStats(statsResult.data || null);
      } catch (err) {
        setError('Department insights are temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const departments = useMemo(() => {
    const groups = new Map();
    employees.forEach((employee) => {
      const key = employee.department || 'Unassigned';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(employee);
    });

    return Array.from(groups.entries()).map(([name, members], index) => ({
      name,
      members,
      headcount: members.length,
      activeCount: members.filter((member) => member.status === 'active').length,
      lead: members[0]?.reportingTo?.userId?.firstName || members[0]?.userId?.firstName || 'TBD',
      color: palette[index % palette.length],
    }));
  }, [employees]);

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Department workspace"
        title="View the company as living teams instead of a flat list."
        subtitle="This card-based department board makes org structure easier to scan, compare, and act on without adding backend complexity."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Departments</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{departments.length}</p>
        </AppSurface>
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Total employees</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{stats?.totalEmployees ?? employees.length}</p>
        </AppSurface>
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Active today</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{employees.filter((employee) => employee.status === 'active').length}</p>
        </AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Department board" subtitle="Each team gets its own premium card with headcount, staffing health, and sample members." extra={<Workflow className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
        ) : departments.length === 0 ? (
          <EmptyState icon={Building2} title="No departments yet" description="As employees are added with department assignments, this board fills in automatically." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <div key={department.name} className="card-hover rounded-[30px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-[var(--text-strong)]">{department.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">Lead signal: {department.lead}</p>
                  </div>
                  <div className="rounded-[20px] p-3" style={{ background: `${department.color}1a` }}>
                    <Building2 className="h-5 w-5" style={{ color: department.color }} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Headcount</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--text-strong)]">{department.headcount}</p>
                  </div>
                  <div className="rounded-[22px] bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Active</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--text-strong)]">{department.activeCount}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Pill tone="blue">{department.members.length > 6 ? 'Scaled team' : 'Focused team'}</Pill>
                  <div className="flex -space-x-2">
                    {department.members.slice(0, 4).map((member) => (
                      <div key={member._id} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bg-root)] bg-white/10 text-xs font-bold text-[var(--text-strong)]">
                        {(member.userId?.firstName?.[0] || member.email?.[0] || 'E').toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-[var(--accent-2)]" />
                    <p className="text-sm font-semibold text-[var(--text-strong)]">Sample roster</p>
                  </div>
                  <div className="space-y-2">
                    {department.members.slice(0, 3).map((member) => (
                      <div key={member._id} className="flex items-center justify-between rounded-[18px] bg-black/10 px-3 py-2">
                        <span className="text-sm text-[var(--text-body)]">{member.userId?.firstName} {member.userId?.lastName}</span>
                        <span className="text-xs text-[var(--text-muted)]">{member.designation || 'Role pending'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppSurface>

      {stats?.byDepartment?.length ? (
        <AppSurface className="mt-6 p-6">
          <SurfaceHeader title="Department density" subtitle="A compact visual strip for quick comparison across team size distribution." extra={<Waves className="h-4 w-4 text-[var(--accent-2)]" />} />
          <div className="space-y-4">
            {stats.byDepartment.map((item, index) => {
              const color = palette[index % palette.length];
              const width = `${Math.max(8, (item.count / stats.totalEmployees) * 100)}%`;
              return (
                <div key={item._id} className="rounded-[24px] bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--text-strong)]">{item._id}</p>
                    <p className="text-sm text-[var(--text-body)]">{item.count} people</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full" style={{ width, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AppSurface>
      ) : null}
    </AppShell>
  );
};

export default AdminDepartmentsPage;
