import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Users2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { attendanceService } from '../api/attendanceService';

const localDateValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const toneMap = {
  present: 'green',
  late: 'amber',
  'half-day': 'blue',
  absent: 'red',
  'on-leave': 'dark',
};

const formatDuration = (hours = 0) => {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const hr = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${String(hr).padStart(2, '0')}h ${String(min).padStart(2, '0')}m`;
};

const ManagerAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await attendanceService.getTeamAttendance({
          status: statusFilter || undefined,
          limit: 100,
        });
        if (result.success) {
          setRecords(result.data || []);
        }
      } catch (err) {
        setError('Team attendance records could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60000);
    return () => window.clearInterval(interval);
  }, [statusFilter]);

  const todayKey = localDateValue();
  const todayRecords = useMemo(
    () => records.filter((record) => localDateValue(new Date(record.date)) === todayKey),
    [records, todayKey],
  );

  const summary = useMemo(() => ({
    present: todayRecords.filter((record) => record.status === 'present').length,
    late: todayRecords.filter((record) => record.status === 'late').length,
    live: todayRecords.filter((record) => record.checkInAt && !record.checkOutAt).length,
  }), [todayRecords]);

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Attendance records"
        title="Track your team's live check-ins, check-outs, and worked hours from one manager view."
        subtitle="This gives managers a real operational lane for today's attendance progress instead of a static after-the-fact log."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Present</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.present}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Late</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.late}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Currently working</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.live}</p></AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Attendance lane" subtitle="A manager-friendly log of today's work session progress." extra={<CalendarClock className="h-4 w-4 text-[var(--accent-2)]" />} />
        <div className="max-w-sm">
          <FloatingField label="Status filter" as="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half-day">Half day</option>
            <option value="absent">Absent</option>
            <option value="on-leave">On leave</option>
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Today's team records" subtitle="See who is already checked in, who has checked out, and how many hours have been logged." extra={<Users2 className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        ) : todayRecords.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No attendance records found" description="Once team members check in, their live workday status will appear here." />
        ) : (
          <div className="space-y-4">
            {todayRecords.map((record) => (
              <div key={record._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-strong)]">{record.userId?.firstName} {record.userId?.lastName}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {record.checkInTime || '--'} in • {record.checkOutTime || 'Working now'} out • {formatDuration(record.workingHours ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Pill tone={toneMap[record.status] || 'dark'}>{record.status}</Pill>
                    <Pill tone={record.checkInAt && !record.checkOutAt ? 'blue' : 'dark'}>
                      {record.checkInAt && !record.checkOutAt ? 'checked in' : 'checked out'}
                    </Pill>
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

export default ManagerAttendancePage;
