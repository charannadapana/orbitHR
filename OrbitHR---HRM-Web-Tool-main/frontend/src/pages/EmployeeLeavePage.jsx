import { useEffect, useState } from 'react';
import { CalendarRange, SendHorizonal } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { leaveService } from '../api/leaveService';
import { employeeService } from '../api/employeeService';
import { useAuth } from '../contexts/AuthContext';

const EmployeeLeavePage = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const result = await leaveService.getLeaves({ limit: 100 });
      if (result.success) setLeaves(result.data || []);
    } catch (err) {
      setError('Leave history could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const employeeResult = await employeeService.getEmployeeByUserId(user?._id);
        if (employeeResult.success) setEmployeeId(employeeResult.data._id);
        await loadLeaves();
      } catch (err) {
        setError('Your employee profile is not ready for leave requests.');
        setLoading(false);
      }
    };

    init();
  }, [user]);

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const result = await leaveService.requestLeave({ ...form, employeeId });
      if (result.success) {
        setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        setLeaves((prev) => [result.data, ...prev]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelLeave = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await leaveService.deleteLeave(id);
      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
    } catch (err) {
      setError('Unable to cancel leave request.');
    }
  };

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Leave planner"
        title="Submit, review, and manage time off in a calmer timeline-based experience."
        subtitle="The redesigned leave flow prioritizes the request form, then turns history into an easier-to-read status timeline."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AppSurface className="p-6">
          <SurfaceHeader title="Request leave" subtitle="A focused request panel with less clutter and stronger field rhythm." extra={<SendHorizonal className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={submitLeave} className="grid gap-4">
            <FloatingField label="Leave type" as="select" value={form.leaveType} onChange={(event) => setForm((prev) => ({ ...prev, leaveType: event.target.value }))}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
              <option value="other">Other</option>
            </FloatingField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingField label="Start date" type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} required />
              <FloatingField label="End date" type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} required />
            </div>
            <FloatingField label="Reason" as="textarea" rows={4} className="resize-none" value={form.reason} onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))} required />
            <ActionButton type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit request'}</ActionButton>
          </form>
        </AppSurface>

        <AppSurface className="p-6">
          <SurfaceHeader title="Leave timeline" subtitle="Past and pending requests presented as a softer, more informative sequence." extra={<CalendarRange className="h-4 w-4 text-[var(--accent-2)]" />} />
          {loading ? (
            <div className="space-y-4"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
          ) : leaves.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No leave requests yet" description="Your submitted leave requests will appear here once the first one is created." />
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-base font-bold capitalize text-[var(--text-strong)]">{leave.leaveType} leave</p>
                      <p className="mt-2 text-sm text-[var(--text-body)]">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} • {leave.daysCount || '--'} days
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-body)]">{leave.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Pill tone={leave.status === 'approved' ? 'green' : leave.status === 'pending' ? 'amber' : leave.status === 'rejected' ? 'red' : 'dark'}>{leave.status}</Pill>
                      {leave.status === 'pending' ? <ActionButton tone="danger" onClick={() => cancelLeave(leave._id)}>Cancel</ActionButton> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      </div>
    </AppShell>
  );
};

export default EmployeeLeavePage;
