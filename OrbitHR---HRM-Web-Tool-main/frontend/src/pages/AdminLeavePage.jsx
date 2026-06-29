import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCheck, ClipboardList, XCircle } from 'lucide-react';
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

const AdminLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await leaveService.getLeaves({ status: statusFilter || undefined, limit: 100 });
        if (result.success) setLeaves(result.data || []);
      } catch (err) {
        setError('Leave requests could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter]);

  const counts = useMemo(
    () => ({
      pending: leaves.filter((item) => item.status === 'pending').length,
      approved: leaves.filter((item) => item.status === 'approved').length,
      rejected: leaves.filter((item) => item.status === 'rejected').length,
    }),
    [leaves],
  );

  const review = async (id, status) => {
    try {
      setUpdatingId(id);
      const result = await leaveService.reviewLeave(id, { status });
      if (result.success) setLeaves((prev) => prev.map((item) => (item._id === id ? result.data : item)));
    } catch (err) {
      setError('Unable to update leave status.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Leave management"
        title="A timeline-first leave review flow with much clearer status hierarchy."
        subtitle="See who is out, what needs a decision, and where pressure is building across the organization."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Pending</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{counts.pending}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Approved</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{counts.approved}</p></AppSurface>
        <AppSurface className="p-5"><p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Rejected</p><p className="mt-3 text-4xl font-extrabold text-[var(--text-strong)]">{counts.rejected}</p></AppSurface>
      </div>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Review lane" subtitle="Keep the queue tight and searchable without drowning the page in controls." extra={<ClipboardList className="h-4 w-4 text-[var(--accent-2)]" />} />
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
        <SurfaceHeader title="Leave timeline" subtitle="A softer timeline layout with visible actions only where they matter." extra={<CalendarClock className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No leave requests in this lane" description="Try another filter to inspect a different set of requests." />
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="rounded-[30px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 h-14 w-14 rounded-[22px] bg-[linear-gradient(135deg,rgba(77,216,255,.18),rgba(50,255,157,.12))] text-center text-lg font-bold leading-[56px] text-[var(--text-strong)]">
                      {(leave.userId?.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--text-strong)]">{leave.userId?.firstName} {leave.userId?.lastName}</p>
                      <p className="mt-1 text-sm text-[var(--text-body)]">{leave.leaveType} leave</p>
                      <p className="mt-2 text-sm text-[var(--text-body)]">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} • {leave.daysCount} days
                      </p>
                    </div>
                  </div>

                  <div className="grid flex-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
                    <div className="rounded-[22px] bg-black/10 px-4 py-3 text-sm text-[var(--text-body)]">{leave.reason}</div>
                    <div>
                      <Pill tone={toneMap[leave.status] || 'dark'}>{leave.status}</Pill>
                    </div>
                    {leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <ActionButton tone="primary" onClick={() => review(leave._id, 'approved')} disabled={updatingId === leave._id}>
                          <CheckCheck className="h-4 w-4" />
                          Approve
                        </ActionButton>
                        <ActionButton tone="danger" onClick={() => review(leave._id, 'rejected')} disabled={updatingId === leave._id}>
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

export default AdminLeavePage;
