import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, BriefcaseBusiness, CalendarClock, ChevronLeft, Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../api/employeeService';
import { activityService } from '../api/activityService';

const iconMap = {
  attendance: CalendarClock,
  task: BriefcaseBusiness,
  leave: Clock3,
};

const toneMap = {
  attendance: 'green',
  task: 'blue',
  leave: 'amber',
};

const roleBackLink = {
  admin: '/admin/employees',
  manager: '/manager/team',
  employee: '/employee/dashboard',
};

const roleShell = {
  admin: 'admin',
  manager: 'manager',
  employee: 'employee',
};

const ActivityTimelinePage = () => {
  const { employeeId: routeEmployeeId } = useParams();
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(routeEmployeeId || '');
  const [timeline, setTimeline] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveEmployeeId = async () => {
      if (routeEmployeeId) {
        setEmployeeId(routeEmployeeId);
        return;
      }

      if (!user?._id) return;

      const result = await employeeService.getEmployeeByUserId(user._id);
      if (result.success) {
        setEmployeeId(result.data._id);
      }
    };

    resolveEmployeeId().catch(() => setError('Unable to resolve the employee profile for this timeline.'));
  }, [routeEmployeeId, user]);

  useEffect(() => {
    if (!employeeId) return;

    const load = async () => {
      try {
        setLoading(true);
        const result = await activityService.getTimeline(employeeId, { limit: 50 });
        if (result.success) {
          setTimeline(result.data?.events || []);
          setSubject(result.data?.employee || null);
        }
      } catch (err) {
        setError('Activity history could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [employeeId]);

  const backTarget = useMemo(() => roleBackLink[user?.role] || '/employee/dashboard', [user]);
  const shellRole = useMemo(() => roleShell[user?.role] || 'employee', [user]);

  return (
    <AppShell userRole={shellRole}>
      <PageHeader
        eyebrow="Activity timeline"
        title="A cleaner chronological view of attendance, task progress, and leave decisions."
        subtitle="This merges the day-to-day signals that usually get scattered across the system into one readable stream."
      >
        <Link to={backTarget} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-body)]">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </PageHeader>

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <AppSurface className="p-6">
        <SurfaceHeader
          title={subject ? `${subject.firstName} ${subject.lastName}`.trim() || 'Employee timeline' : 'Employee timeline'}
          subtitle={subject ? `${subject.designation} • ${subject.department}` : 'Recent activity across attendance, tasks, and leave.'}
          extra={<Pill tone="blue">Latest 50 events</Pill>}
        />

        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : timeline.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" description="As attendance, task, and leave records are updated, they will appear here in one timeline." />
        ) : (
          <div className="space-y-4">
            {timeline.map((event, index) => {
              const Icon = iconMap[event.type] || Activity;
              return (
                <motion.div
                  key={`${event.type}-${event.metadata?.taskId || event.metadata?.leaveId || event.metadata?.attendanceId || index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.03 }}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/8">
                        <Icon className="h-5 w-5 text-[var(--accent-2)]" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold text-[var(--text-strong)]">{event.title}</p>
                          <Pill tone={toneMap[event.type] || 'dark'}>{event.type}</Pill>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{event.detail}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(event.ts).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AppSurface>
    </AppShell>
  );
};

export default ActivityTimelinePage;
