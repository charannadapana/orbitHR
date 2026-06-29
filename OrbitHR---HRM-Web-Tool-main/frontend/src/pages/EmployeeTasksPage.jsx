import { useEffect, useState } from 'react';
import { CheckCircle2, ListTodo } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { taskService } from '../api/taskService';

const EmployeeTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getEmployeeTasks(filters);
      if (res.success) setTasks(res.data || []);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority]);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await taskService.updateTaskStatus(id, status);
      await loadTasks();
    } catch (err) {
      setError('Failed to update task status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="My tasks"
        title="Track your assignments with clearer status, priority, and progress controls."
        subtitle="This view is now built for actual employee workflow: filter fast, see priority immediately, and update progress without friction."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <AppSurface className="mb-6 p-6">
        <SurfaceHeader title="Filters" subtitle="Narrow your task queue by status or priority." />
        <div className="grid gap-4 md:grid-cols-2">
          <FloatingField label="Status" as="select" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </FloatingField>
          <FloatingField label="Priority" as="select" value={filters.priority} onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="p-6">
        <SurfaceHeader title="Assigned tasks" subtitle="Your personal queue with richer status controls and better priority visibility." extra={<ListTodo className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="space-y-4"><SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" /></div>
        ) : !tasks.length ? (
          <EmptyState icon={CheckCircle2} title="No tasks assigned" description="When work is assigned to you, it will appear here with status and priority controls." />
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-[var(--text-strong)]">{task.title}</p>
                      <Pill tone={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}>{task.priority}</Pill>
                      <Pill tone={task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'amber' : 'dark'}>{task.status}</Pill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{task.description || 'No task description provided.'}</p>
                    <p className="mt-3 text-xs text-[var(--text-muted)]">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:w-[340px]">
                    {['pending', 'in-progress', 'completed'].map((status) => (
                      <button
                        key={status}
                        disabled={task.status === status || updating === task._id}
                        onClick={() => handleUpdateStatus(task._id, status)}
                        className={`rounded-[18px] px-3 py-3 text-xs font-semibold transition ${
                          task.status === status
                            ? 'bg-white text-slate-950'
                            : 'border border-white/10 bg-white/5 text-[var(--text-body)]'
                        }`}
                      >
                        {updating === task._id ? 'Saving...' : status}
                      </button>
                    ))}
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

export default EmployeeTasksPage;
