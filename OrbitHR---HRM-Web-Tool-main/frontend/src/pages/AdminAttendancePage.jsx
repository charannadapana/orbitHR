import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, CalendarRange, Flame, PlusCircle } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, Segmented, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { attendanceService } from '../api/attendanceService';
import { employeeService } from '../api/employeeService';

const localDateValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const statusColors = {
  present: '#32ff9d',
  absent: '#ff6b81',
  late: '#ffd076',
  'half-day': '#4dd8ff',
  'on-leave': '#8ab7ff',
};

const AdminAttendancePage = () => {
  const today = localDateValue();
  const [tab, setTab] = useState('records');
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [filters, setFilters] = useState({ employeeId: '', status: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({
    employeeId: '',
    date: today,
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const result = await employeeService.getAllEmployees({ limit: 100 });
        if (result.success) setEmployees(result.data || []);
      } catch (err) {
        setError('Unable to load employees for attendance.');
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const result = await attendanceService.getAttendance({
          employeeId: filters.employeeId || undefined,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: 120,
        });
        if (result.success) setRecords(result.data || []);
      } catch (err) {
        setError('Unable to load attendance records.');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [filters]);

  const statusCounts = useMemo(() => {
    return records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});
  }, [records]);

  const submitAttendance = async (event) => {
    event.preventDefault();
    try {
      setMarking(true);
      const result = await attendanceService.markAttendance(form);
      if (result.success) {
        setRecords((prev) => [result.data, ...prev]);
        setTab('records');
        setForm({ employeeId: '', date: today, status: 'present', checkInTime: '', checkOutTime: '', notes: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark attendance.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Attendance studio"
        title="Track operational presence with a more visual, less spreadsheet-like workflow."
        subtitle="Mark records quickly, then switch into a heatmap-inspired stream that makes status distribution easier to read."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'records', label: 'Records' },
            { value: 'mark', label: 'Mark attendance' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        {['present', 'late', 'half-day', 'on-leave', 'absent'].map((status) => (
          <AppSurface key={status} className="p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{status}</p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--text-strong)]">{statusCounts[status] || 0}</p>
          </AppSurface>
        ))}
      </div>

      {tab === 'mark' ? (
        <AppSurface className="mt-6 p-6">
          <SurfaceHeader title="Mark attendance" subtitle="A calmer form with stronger hierarchy and touch-friendly controls." extra={<PlusCircle className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={submitAttendance} className="grid gap-4 md:grid-cols-2">
            <FloatingField label="Employee" as="select" value={form.employeeId} onChange={(event) => setForm((prev) => ({ ...prev, employeeId: event.target.value }))} required>
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>{employee.email} - {employee.designation}</option>
              ))}
            </FloatingField>
            <FloatingField label="Date" type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} required />
            <FloatingField label="Status" as="select" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half-day">Half day</option>
              <option value="on-leave">On leave</option>
              <option value="absent">Absent</option>
            </FloatingField>
            <FloatingField label="Check in" type="time" value={form.checkInTime} onChange={(event) => setForm((prev) => ({ ...prev, checkInTime: event.target.value }))} />
            <FloatingField label="Check out" type="time" value={form.checkOutTime} onChange={(event) => setForm((prev) => ({ ...prev, checkOutTime: event.target.value }))} />
            <FloatingField label="Notes" as="textarea" rows={3} className="resize-none md:col-span-2" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            <div className="md:col-span-2">
              <ActionButton type="submit" disabled={marking}>
                {marking ? 'Saving...' : 'Save attendance'}
              </ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : (
        <>
          <AppSurface className="mt-6 p-6">
            <SurfaceHeader title="Filters" subtitle="Keep the record view lightweight and progressive." extra={<CalendarRange className="h-4 w-4 text-[var(--accent-2)]" />} />
            <div className="grid gap-4 md:grid-cols-4">
              <FloatingField label="Employee" as="select" value={filters.employeeId} onChange={(event) => setFilters((prev) => ({ ...prev, employeeId: event.target.value }))}>
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>{employee.email}</option>
                ))}
              </FloatingField>
              <FloatingField label="Status" as="select" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="">All statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half day</option>
                <option value="on-leave">On leave</option>
                <option value="absent">Absent</option>
              </FloatingField>
              <FloatingField label="Start date" type="date" value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
              <FloatingField label="End date" type="date" value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
            </div>
          </AppSurface>

          <AppSurface className="mt-6 p-6">
            <SurfaceHeader title="Attendance stream" subtitle="Heatmap-flavored cards make it easier to scan records than a flat table." extra={<CalendarCheck2 className="h-4 w-4 text-[var(--accent)]" />} />
            {loading ? (
              <div className="space-y-4">
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
              </div>
            ) : records.length === 0 ? (
              <EmptyState icon={Flame} title="No attendance records found" description="Try broadening the date range or removing status filters." />
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <div key={record._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-3 rounded-full" style={{ background: statusColors[record.status] || '#8b9ab2' }} />
                        <div>
                          <p className="text-base font-bold text-[var(--text-strong)]">
                            {record.userId?.firstName} {record.userId?.lastName}
                          </p>
                          <p className="text-sm text-[var(--text-body)]">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-4 xl:grid-cols-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Status</p>
                          <div className="mt-2"><Pill tone="dark">{record.status}</Pill></div>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Check in</p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{record.checkInTime || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Check out</p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{record.checkOutTime || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Notes</p>
                          <p className="mt-2 text-sm text-[var(--text-body)]">{record.notes || 'No notes added'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppSurface>
        </>
      )}
    </AppShell>
  );
};

export default AdminAttendancePage;
