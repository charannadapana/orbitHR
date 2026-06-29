import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, Plus, Search, Trash2, UserRoundPen } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { employeeService } from '../api/employeeService';

const departmentOptions = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Legal', 'Management', 'Sales'];

const statusTone = {
  active: 'green',
  inactive: 'red',
  'on-leave': 'amber',
};

const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await employeeService.getAllEmployees({ search, department: department || undefined, status: status || undefined, limit: 100 });
        if (result.success) setEmployees(result.data || []);
      } catch (err) {
        setError('Unable to fetch employee records.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, department, status]);

  const departmentCount = useMemo(() => new Set(employees.map((employee) => employee.department).filter(Boolean)).size, [employees]);

  const deleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError('Unable to delete employee.');
    }
  };

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Employee management"
        title="A cleaner, card-table hybrid for browsing, filtering, and acting on your workforce."
        subtitle="Search and scan profiles quickly, then jump into detail, editing, or department planning without the old density problem."
      >
        <ActionButton onClick={() => navigate('/admin/employees/new')}>
          <Plus className="h-4 w-4" />
          Add employee
        </ActionButton>
      </PageHeader>

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Headcount</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{employees.length}</p>
        </AppSurface>
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Active now</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{employees.filter((employee) => employee.status === 'active').length}</p>
        </AppSurface>
        <AppSurface className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Departments represented</p>
          <p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{departmentCount}</p>
        </AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Smart filters" subtitle="Progressive filtering for people ops work without burying the main list." extra={<Filter className="h-4 w-4 text-[var(--accent-2)]" />} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.85fr_0.85fr]">
          <FloatingField label="Search" icon={Search} placeholder="Search by email or designation" value={search} onChange={(event) => setSearch(event.target.value)} />
          <FloatingField label="Department" as="select" value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">All departments</option>
            {departmentOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FloatingField>
          <FloatingField label="Status" as="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On leave</option>
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Workforce directory" subtitle="Designed for scanning, with action affordances surfaced only when useful." />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState icon={Search} title="No matching employees" description="Try broadening the filters or add the first record for this segment." />
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <div key={employee._id} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(77,216,255,.2),rgba(50,255,157,.18))] text-lg font-bold text-[var(--text-strong)]">
                      {(employee.userId?.firstName?.[0] || employee.email?.[0] || 'E').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--text-strong)]">{employee.userId?.firstName} {employee.userId?.lastName}</p>
                      <p className="text-sm text-[var(--text-body)]">{employee.email}</p>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-4 xl:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Department</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{employee.department || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Designation</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{employee.designation || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Status</p>
                      <div className="mt-2">
                        <Pill tone={statusTone[employee.status] || 'dark'}>{employee.status || 'unknown'}</Pill>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Joined</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">
                        {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ActionButton tone="secondary" onClick={() => navigate(`/admin/employees/${employee._id}`)} className="px-4">
                      <Eye className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton tone="secondary" onClick={() => navigate(`/admin/employees/${employee._id}/edit`)} className="px-4">
                      <UserRoundPen className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => deleteEmployee(employee._id)} className="px-4">
                      <Trash2 className="h-4 w-4" />
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppSurface>
    </AppShell>
  );
};

export default EmployeeListPage;
