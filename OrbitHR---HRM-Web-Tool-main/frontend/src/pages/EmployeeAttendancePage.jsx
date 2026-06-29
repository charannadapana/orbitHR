import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, LogIn, LogOut, TimerReset } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { attendanceService } from '../api/attendanceService';
import { employeeService } from '../api/employeeService';
import { useAuth } from '../contexts/AuthContext';

const pad = (value) => String(value).padStart(2, '0');

const formatDuration = (hours) => {
  const totalMinutes = Math.max(0, Math.round((hours || 0) * 60));
  const hr = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${pad(hr)}h ${pad(min)}m`;
};

const EmployeeAttendancePage = () => {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [workingHoursLive, setWorkingHoursLive] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAttendance = async () => {
    const employeeResult = await employeeService.getEmployeeByUserId(user?._id);
    if (!employeeResult.success) {
      throw new Error('Employee profile missing');
    }

    const employeeId = employeeResult.data._id;
    const [recordResult, summaryResult, todayResult] = await Promise.all([
      attendanceService.getAttendance({ limit: 120 }),
      attendanceService.getEmployeeAttendanceSummary(employeeId, year, month),
      attendanceService.getMyTodayAttendance(),
    ]);

    if (recordResult.success) setRecords(recordResult.data || []);
    if (summaryResult.success) setSummary(summaryResult.data?.summary || null);
    if (todayResult.success) setTodayRecord(todayResult.data || null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await loadAttendance();
      } catch (err) {
        setError('Attendance history could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [month, year, user]);

  useEffect(() => {
    if (!todayRecord?.checkInAt || todayRecord?.checkOutAt) {
      setWorkingHoursLive(todayRecord?.workingHours || 0);
      return undefined;
    }

    const tick = () => {
      const diff = (Date.now() - new Date(todayRecord.checkInAt).getTime()) / (1000 * 60 * 60);
      setWorkingHoursLive(Math.max(0, diff));
    };

    tick();
    const interval = window.setInterval(tick, 60000);
    return () => window.clearInterval(interval);
  }, [todayRecord]);

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2026, index, 1).toLocaleString('en-US', { month: 'long' }) }));
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const heatCells = useMemo(() => records.slice(0, 35), [records]);

  const handleCheckIn = async () => {
    try {
      setSubmitting(true);
      setError('');
      const result = await attendanceService.checkIn();
      if (result.success) {
        setTodayRecord(result.data);
        await loadAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      setError('');
      const result = await attendanceService.checkOut();
      if (result.success) {
        setTodayRecord(result.data);
        await loadAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check out.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentHours = todayRecord?.checkOutAt ? (todayRecord?.workingHours || 0) : workingHoursLive;
  const hasCheckedIn = Boolean(todayRecord?.checkInAt);
  const hasCheckedOut = Boolean(todayRecord?.checkOutAt);

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Attendance journal"
        title="Track your workday with live check-in and check-out, not just static attendance records."
        subtitle="Start the day, end the day, and let the system calculate worked hours and attendance value automatically."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Today</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{todayRecord?.status || 'idle'}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Check in</p><p className="mt-3 text-2xl font-extrabold text-[var(--text-strong)]">{todayRecord?.checkInTime || '--'}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Check out</p><p className="mt-3 text-2xl font-extrabold text-[var(--text-strong)]">{todayRecord?.checkOutTime || '--'}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Worked hours</p><p className="mt-3 text-2xl font-extrabold text-[var(--text-strong)]">{formatDuration(currentHours)}</p></AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Today's work session" subtitle="Your primary attendance action now lives here." extra={<Clock3 className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <SkeletonBlock className="h-32" />
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-lg font-bold text-[var(--text-strong)]">{new Date().toLocaleDateString()}</p>
              <p className="mt-2 text-sm text-[var(--text-body)]">
                {hasCheckedOut
                  ? `You worked ${formatDuration(currentHours)} today.`
                  : hasCheckedIn
                    ? `You are currently checked in. Live worked time: ${formatDuration(currentHours)}.`
                    : 'You have not checked in yet today.'}
              </p>
              {todayRecord?.status ? <div className="mt-3"><Pill tone={todayRecord.status === 'present' ? 'green' : todayRecord.status === 'late' ? 'amber' : todayRecord.status === 'half-day' ? 'blue' : 'dark'}>{todayRecord.status}</Pill></div> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={handleCheckIn} disabled={submitting || hasCheckedIn}>
                <LogIn className="h-4 w-4" />
                {submitting && !hasCheckedIn ? 'Checking in...' : 'Check in'}
              </ActionButton>
              <ActionButton tone="secondary" onClick={handleCheckOut} disabled={submitting || !hasCheckedIn || hasCheckedOut}>
                <LogOut className="h-4 w-4" />
                {submitting && hasCheckedIn && !hasCheckedOut ? 'Checking out...' : 'Check out'}
              </ActionButton>
            </div>
          </div>
        )}
      </AppSurface>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Present</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary?.present ?? '--'}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Late</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary?.late ?? '--'}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Hours this month</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{formatDuration(summary?.workingHoursTotal ?? 0)}</p></AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Attendance heatmap" subtitle="A compact month view for quick pattern recognition." extra={<CalendarDays className="h-4 w-4 text-[var(--accent)]" />} />
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <FloatingField label="Month" as="select" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FloatingField>
          <FloatingField label="Year" as="select" value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {yearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </FloatingField>
        </div>
        {loading ? (
          <SkeletonBlock className="h-40" />
        ) : (
          <div className="grid grid-cols-7 gap-3 sm:grid-cols-8 lg:grid-cols-10">
            {heatCells.map((record) => (
              <div key={record._id} className="aspect-square rounded-[22px] p-3 text-xs text-[var(--text-strong)]" style={{ background: record.status === 'present' ? 'rgba(50,255,157,0.18)' : record.status === 'late' ? 'rgba(255,208,118,0.18)' : record.status === 'half-day' ? 'rgba(77,216,255,0.16)' : 'rgba(255,107,129,0.16)' }}>
                <div className="flex h-full flex-col justify-between">
                  <span>{new Date(record.date).getDate()}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{record.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Daily records" subtitle="Individual attendance entries when you need exact times and hours." extra={<TimerReset className="h-4 w-4 text-[var(--accent-2)]" />} />
        {loading ? (
          <div className="space-y-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
        ) : records.length === 0 ? (
          <EmptyState icon={TimerReset} title="No attendance records" description="Your attendance records will appear here once the month has entries." />
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-strong)]">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{record.notes || 'No notes added'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill tone={record.status === 'present' ? 'green' : record.status === 'late' ? 'amber' : record.status === 'half-day' ? 'blue' : 'dark'}>{record.status}</Pill>
                    <span className="text-sm text-[var(--text-body)]">{record.checkInTime || '--'} to {record.checkOutTime || '--'} • {formatDuration(record.workingHours || 0)}</span>
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

export default EmployeeAttendancePage;
