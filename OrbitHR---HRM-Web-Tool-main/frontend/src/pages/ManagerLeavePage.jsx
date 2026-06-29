import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, CheckCheck, ClipboardList, XCircle } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { leaveService } from '../api/leaveService';

const toneMap = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
  cancelled: 'dark',
};

const ManagerLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await leaveService.getTeamLeaves({
          status: statusFilter || undefined,
          limit: 100,
        });
        if (result.success) {
          setLeaves(result.data || []);
        }
      } catch (err) {
        setError('Team leave records could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter]);

  const summary = useMemo(() => ({
    pending: leaves.filter((leave) => leave.status === 'pending').length,
    approved: leaves.filter((leave) => leave.status === 'approved').length,
    rejected: leaves.filter((leave) => leave.status === 'rejected').length,
  }), [leaves]);

  const review = async (id, status) => {
    try {
      setReviewingId(id);
      const result = await leaveService.reviewLeave(id, { status });
      if (result.success) {
        setLeaves((prev) => prev.map((item) => (item._id === id ? result.data : item)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review this leave request.');
    } finally {
      setReviewingId('');
    }
  };

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Leave review"
        title="Review your team's time-off requests from a dedicated manager lane."
        subtitle="This pulls leave review out of the overview page so managers can scan and act on requests much faster."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Pending</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.pending}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Approved</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.approved}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Rejected</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{summary.rejected}</p></AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Filter requests" subtitle="Keep the review queue focused without hiding the full record." extra={<ClipboardList className="h-4 w-4 text-[var(--accent-2)]" />} />
        <div className="max-w-sm">
          <FloatingField label="Status filter" as="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Leave queue" subtitle="Requests from the employees in your scope, with review actions right where they belong." extra={<CalendarRange className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No leave requests found" description="Try another filter or wait for fresh leave requests from your team." />
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="rounded-[30px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-base font-bold text-[var(--text-strong)]">{leave.userId?.firstName} {leave.userId?.lastName}</p>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{leave.leaveType} • {leave.daysCount} days</p>
                    <p className="mt-2 text-sm text-[var(--text-body)]">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-body)]">{leave.reason}</p>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[auto_auto] xl:items-center">
                    <Pill tone={toneMap[leave.status] || 'dark'}>{leave.status}</Pill>
                    {leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <ActionButton tone="primary" onClick={() => review(leave._id, 'approved')} disabled={reviewingId === leave._id}>
                          <CheckCheck className="h-4 w-4" />
                          Approve
                        </ActionButton>
                        <ActionButton tone="danger" onClick={() => review(leave._id, 'rejected')} disabled={reviewingId === leave._id}>
                          <XCircle className="h-4 w-4" />
                          Reject
                        </ActionButton>
                      </div>
                    ) : null}
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

export default ManagerLeavePage;
