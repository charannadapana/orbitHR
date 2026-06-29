import { useEffect, useState } from 'react';
import { CalendarClock, CreditCard, Landmark, ReceiptText } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { payrollService } from '../api/payrollService';

const formatDuration = (hours = 0) => {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const hr = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${String(hr).padStart(2, '0')}h ${String(min).padStart(2, '0')}m`;
};

const ManagerPayrollPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await payrollService.getTeamPayslips(year, month);
        if (result.success) {
          setPayslips(result.data || []);
        }
      } catch (err) {
        setError('Team payroll estimates could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [year, month]);

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2026, index, 1).toLocaleString('en-US', { month: 'long' }) }));
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Payroll tracking"
        title="Review team payslips generated from worked hours, attendance value, and approved leave."
        subtitle="This gives managers a month-level payroll estimate lane based on the real attendance workflow, not manual guesswork."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <AppSurface className="p-6">
        <SurfaceHeader title="Payroll cycle" subtitle="Pick the month and year to review generated team payouts." extra={<CreditCard className="h-4 w-4 text-[var(--accent)]" />} />
        <div className="grid gap-4 md:grid-cols-2">
          <FloatingField label="Month" as="select" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FloatingField>
          <FloatingField label="Year" as="select" value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {yearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Team payslips" subtitle="Estimated payout cards derived from attendance hours and approved paid leave." extra={<Pill tone="green">Computed</Pill>} />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : payslips.length === 0 ? (
          <EmptyState icon={ReceiptText} title="No payroll estimates yet" description="Once the team has attendance or leave data for this cycle, payslips will show up here." />
        ) : (
          <div className="space-y-4">
            {payslips.map((payslip) => (
              <div key={payslip.employeeId} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-base font-bold text-[var(--text-strong)]">{payslip.employee.firstName} {payslip.employee.lastName}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{payslip.employee.designation} • {payslip.employee.department}</p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Worked {formatDuration(payslip.totalWorkedHours)} • {payslip.totalPayableDays} payable days • {payslip.paidLeaveDaysInMonth} paid leave days
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-[22px] bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Base</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">${payslip.baseSalary}</p>
                    </div>
                    <div className="rounded-[22px] bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Worked</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">{formatDuration(payslip.totalWorkedHours)}</p>
                    </div>
                    <div className="rounded-[22px] bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Payable</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">{payslip.totalPayableDays}</p>
                    </div>
                    <div className="rounded-[22px] bg-[linear-gradient(135deg,rgba(77,216,255,.12),rgba(50,255,157,.08))] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Final</p>
                      <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">${payslip.finalSalary}</p>
                    </div>
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

export default ManagerPayrollPage;
