import { useEffect, useState } from 'react';
import { CalendarClock, CreditCard, Landmark, ReceiptText } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { payrollService } from '../api/payrollService';

const EmployeePayrollPage = () => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const result = await payrollService.getMyPayslip(now.getFullYear(), now.getMonth() + 1);
        if (result.success) setPayslip(result.data);
      } catch (err) {
        setError('Payroll data is unavailable for this cycle.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Payroll suite"
        title="Review your latest payout breakdown with a cleaner, more legible financial surface."
        subtitle="Payslip information stays minimal, calm, and easy to verify on both desktop and mobile."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <StatCard label="Final salary" value={payslip ? `$${payslip.finalSalary}` : '--'} hint="Current estimate for this month" icon={CreditCard} accent="#32ff9d" />
        <StatCard label="Base salary" value={payslip ? `$${payslip.baseSalary}` : '--'} hint="Configured salary basis" icon={Landmark} accent="#4dd8ff" />
        <StatCard label="Paid leave days" value={payslip?.paidLeaveDaysInMonth ?? '--'} hint="Included in this cycle" icon={CalendarClock} accent="#ffd076" />
        <StatCard label="Worked hours" value={payslip ? `${payslip.totalWorkedHours ?? 0}h` : '--'} hint="Tracked from check-in and check-out" icon={ReceiptText} accent="#8ab7ff" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Payslip summary" subtitle="A minimal card-based breakdown of how the estimate was produced." extra={<Pill tone="green">Current cycle</Pill>} />
          {loading ? (
            <SkeletonBlock className="h-[340px]" />
          ) : !payslip ? (
            <EmptyState icon={CreditCard} title="No payroll record yet" description="Once a payslip is generated for this month, it will appear here automatically." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(77,216,255,.14),rgba(50,255,157,.08))] p-6">
                <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">Estimated take-home</p>
                <p className="mt-3 text-5xl font-extrabold text-[var(--text-strong)]">${payslip.finalSalary}</p>
                <p className="mt-3 text-sm text-[var(--text-body)]">This view reflects current attendance and payable leave records.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Formula</p>
                  <p className="mt-3 text-lg font-bold text-[var(--text-strong)]">
                    ${payslip.baseSalary} / {payslip.totalDaysInMonth} x {payslip.totalPayableDays}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Cycle coverage</p>
                  <p className="mt-3 text-lg font-bold text-[var(--text-strong)]">{payslip.totalPayableDays} payable days</p>
                </div>
              </div>
            </div>
          )}
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Component snapshot" subtitle="Fast-glance cards for the main values you would cross-check in a payslip." />
          {loading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
            </div>
          ) : !payslip ? (
            <EmptyState icon={ReceiptText} title="Awaiting payroll data" description="This panel fills in once a current cycle record is available." />
          ) : (
            <div className="space-y-4">
              {[
                ['Worked hours', payslip.totalWorkedHours],
                ['Effective present days', payslip.effectivePresentDays],
                ['Paid leave days', payslip.paidLeaveDaysInMonth],
                ['Total payable days', payslip.totalPayableDays],
                ['Days in month', payslip.totalDaysInMonth],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-3 text-2xl font-bold text-[var(--text-strong)]">{value}</p>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default EmployeePayrollPage;
