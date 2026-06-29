import { useEffect, useMemo, useState } from 'react';
import { FilePenLine, ListFilter, ListTodo, Plus, Trash2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, FloatingField, Pill, SkeletonBlock, StatCard, SurfaceHeader } from '../components/ui/saas';
import { employeeService } from '../api/employeeService';
import { taskService } from '../api/taskService';

const emptySummary = { total: 0, pending: 0, inProgress: 0, completed: 0, completionRate: 0 };
const emptyForm = { title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' };

const ManagerTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', assignedTo: '', search: '' });
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => ([
    { label: 'All tasks', value: summary.total, hint: 'Current manager-owned tasks', accent: '#4dd8ff' },
    { label: 'Pending', value: summary.pending, hint: 'Not yet started', accent: '#ffd076' },
    { label: 'In progress', value: summary.inProgress, hint: 'Active workstream', accent: '#32ff9d' },
    { label: 'Completed', value: summary.completed, hint: 'Delivered work', accent: '#8ab7ff' },
    { label: 'Completion rate', value: `${summary.completionRate}%`, hint: 'Overall throughput', accent: '#ff8ab0' },
  ]), [summary]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [taskResult, teamResult] = await Promise.all([
        taskService.getTasks(filters),
        employeeService.getMyTeam(),
      ]);

      if (taskResult.success) {
        setTasks(taskResult.data || []);
        setSummary(taskResult.meta?.summary || emptySummary);
      }

      if (teamResult.success) {
        setTeam(teamResult.data || []);
      }
    } catch (err) {
      setError('Task workspace could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.status, filters.priority, filters.assignedTo, filters.search]);

  const createTask = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const result = await taskService.createTask(form);
      if (result.success) {
        setForm(emptyForm);
        setShowForm(false);
        await load();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveTaskChanges = async (event) => {
    event.preventDefault();
    if (!editingTask?._id) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const result = await taskService.updateTask(editingTask._id, {
        title: editingTask.title,
        description: editingTask.description,
        assignedTo: editingTask.assignedTo,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
      });

      if (result.success) {
        setEditingTask(null);
        await load();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this task.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      setError('');
      await taskService.deleteTask(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task.');
    }
  };

  return (
    <AppShell userRole="manager">
      <PageHeader
        eyebrow="Task management"
        title="Plan delivery, refine assignments, and keep team work visible without losing control."
        subtitle="Managers can create, update, and retire team tasks here, while employees stay focused on progress updates only."
      >
        <ActionButton onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          New task
        </ActionButton>
      </PageHeader>

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} icon={ListTodo} accent={card.accent} />
        ))}
      </div>

      {showForm ? (
        <AppSurface className="mb-6 mt-6 p-6">
          <SurfaceHeader title="Create task" subtitle="Define a clear owner, deadline, priority, and scope before work starts." extra={<ListTodo className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={createTask} className="grid gap-4 md:grid-cols-2">
            <FloatingField label="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
            <FloatingField label="Assign to" as="select" value={form.assignedTo} onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))} required>
              <option value="">Select team member</option>
              {team.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.userId?.firstName} {member.userId?.lastName}
                </option>
              ))}
            </FloatingField>
            <FloatingField label="Priority" as="select" value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FloatingField>
            <FloatingField label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} required />
            <FloatingField label="Description" as="textarea" rows={4} className="resize-none md:col-span-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            <div className="flex gap-3 md:col-span-2">
              <ActionButton type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create task'}</ActionButton>
              <ActionButton type="button" tone="secondary" onClick={() => setShowForm(false)}>Cancel</ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : null}

      {editingTask ? (
        <AppSurface className="mb-6 mt-6 p-6">
          <SurfaceHeader title="Edit task" subtitle="Adjust the work definition, owner, or deadline while keeping employee status updates intact." extra={<FilePenLine className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={saveTaskChanges} className="grid gap-4 md:grid-cols-2">
            <FloatingField label="Title" value={editingTask.title} onChange={(event) => setEditingTask((prev) => ({ ...prev, title: event.target.value }))} required />
            <FloatingField label="Assign to" as="select" value={editingTask.assignedTo} onChange={(event) => setEditingTask((prev) => ({ ...prev, assignedTo: event.target.value }))} required>
              <option value="">Select team member</option>
              {team.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.userId?.firstName} {member.userId?.lastName}
                </option>
              ))}
            </FloatingField>
            <FloatingField label="Priority" as="select" value={editingTask.priority} onChange={(event) => setEditingTask((prev) => ({ ...prev, priority: event.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FloatingField>
            <FloatingField label="Due date" type="date" value={editingTask.dueDate} onChange={(event) => setEditingTask((prev) => ({ ...prev, dueDate: event.target.value }))} required />
            <FloatingField label="Description" as="textarea" rows={4} className="resize-none md:col-span-2" value={editingTask.description} onChange={(event) => setEditingTask((prev) => ({ ...prev, description: event.target.value }))} />
            <div className="flex gap-3 md:col-span-2">
              <ActionButton type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save task changes'}</ActionButton>
              <ActionButton type="button" tone="secondary" onClick={() => setEditingTask(null)}>Cancel</ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : null}

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Filters" subtitle="Use search, assignee, status, and priority to narrow the stream." extra={<ListFilter className="h-4 w-4 text-[var(--accent-2)]" />} />
        <div className="grid gap-4 md:grid-cols-4">
          <FloatingField label="Search" value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search title or description" />
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
          <FloatingField label="Assignee" as="select" value={filters.assignedTo} onChange={(event) => setFilters((prev) => ({ ...prev, assignedTo: event.target.value }))}>
            <option value="">All assignees</option>
            {team.map((member) => (
              <option key={member._id} value={member._id}>
                {member.userId?.firstName} {member.userId?.lastName}
              </option>
            ))}
          </FloatingField>
        </div>
      </AppSurface>

      <AppSurface className="mt-6 p-6">
        <SurfaceHeader title="Task stream" subtitle="This is the full team queue the manager is responsible for." />
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState icon={ListTodo} title="No tasks found" description="Create a task or loosen the filters to bring more work into view." />
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-[var(--text-strong)]">{task.title}</p>
                      <Pill tone={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}>{task.priority}</Pill>
                      <Pill tone={task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'amber' : 'dark'}>{task.status}</Pill>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">{task.description || 'No additional task details provided.'}</p>
                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                      Assigned to {task.assignedTo?.email || 'team member'} • due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <ActionButton
                      tone="secondary"
                      onClick={() =>
                        setEditingTask({
                          _id: task._id,
                          title: task.title,
                          description: task.description || '',
                          assignedTo: task.assignedTo?._id || '',
                          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
                          priority: task.priority,
                        })
                      }
                    >
                      <FilePenLine className="h-4 w-4" />
                      Edit
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => deleteTask(task._id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </ActionButton>
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

export default ManagerTasksPage;
