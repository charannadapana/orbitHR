import { useEffect, useState } from 'react';
import { Award, BookOpenText, Plus, Sparkles } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, AutocompleteField, EmptyState, FloatingField, Pill, Segmented, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { employeeService } from '../api/employeeService';
import { skillService } from '../api/skillService';

const AdminSkillsPage = () => {
  const [tab, setTab] = useState('library');
  const [skills, setSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillForm, setSkillForm] = useState({ name: '', category: '', description: '' });
  const [skillQuery, setSkillQuery] = useState('');
  const [newSkillForm, setNewSkillForm] = useState({ category: 'General', description: '' });
  const [suggestionState, setSuggestionState] = useState({ exactMatch: null, suggestions: [], canCreate: false });
  const [assignForm, setAssignForm] = useState({ employeeId: '', skillId: '', proficiencyLevel: 3, yearsOfExperience: 0 });
  const selectedSkill = skills.find((skill) => skill._id === assignForm.skillId) || suggestionState.exactMatch;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [skillsResult, employeesResult] = await Promise.all([
          skillService.getSkills(),
          employeeService.getAllEmployees({ limit: 200 }),
        ]);
        if (skillsResult.success) setSkills(skillsResult.data || []);
        if (employeesResult.success) setEmployees(employeesResult.data || []);
      } catch (err) {
        setError('Skill workspace could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const result = await skillService.getSuggestions(skillQuery);
        if (result.success) {
          setSuggestionState(result.data || { exactMatch: null, suggestions: [], canCreate: false });
          if (result.data?.exactMatch?._id) {
            setAssignForm((prev) => ({ ...prev, skillId: result.data.exactMatch._id }));
          }
        }
      } catch (err) {
        setSuggestionState({ exactMatch: null, suggestions: [], canCreate: false });
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [skillQuery]);

  const createSkill = async (event) => {
    event.preventDefault();
    try {
      const result = await skillService.createSkill(skillForm);
      if (result.success) {
        setSkills((prev) => [result.data, ...prev]);
        setSkillForm({ name: '', category: '', description: '' });
        setTab('library');
      }
    } catch (err) {
      setError('Unable to create skill.');
    }
  };

  const loadAssignments = async (employeeId) => {
    if (!employeeId) return;
    try {
      const result = await skillService.getEmployeeSkills(employeeId);
      if (result.success) setAssignments(result.data || []);
    } catch (err) {
      setError('Unable to load employee skill assignments.');
    }
  };

  const assignSkill = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...assignForm,
        proficiencyLevel: Number(assignForm.proficiencyLevel),
        yearsOfExperience: Number(assignForm.yearsOfExperience),
      };

      if (!assignForm.skillId) {
        payload.skillName = skillQuery;
        payload.category = newSkillForm.category;
        payload.description = newSkillForm.description;
      }

      const result = await skillService.assignSkill(payload);
      if (result.success) {
        const assignedSkill = result.data?.skillId;
        if (assignedSkill?._id) {
          setSkills((prev) => {
            const exists = prev.some((skill) => skill._id === assignedSkill._id);
            return exists ? prev : [assignedSkill, ...prev];
          });
        }
        await loadAssignments(assignForm.employeeId);
        setSkillQuery('');
        setNewSkillForm({ category: 'General', description: '' });
        setAssignForm((prev) => ({ ...prev, skillId: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign skill.');
    }
  };

  return (
    <AppShell userRole="admin">
      <PageHeader
        eyebrow="Skill matrix"
        title="Shape the company capability map with a calmer, more tactile admin workspace."
        subtitle="Create new skill modules, assign them to people, and surface proficiency without the old visual clutter."
      />

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'library', label: 'Library' },
          { value: 'create', label: 'Create' },
          { value: 'assign', label: 'Assign' },
        ]}
      />

      {tab === 'library' ? (
        <AppSurface className="mt-6 p-6">
          <SurfaceHeader title="Skill library" subtitle="A clean catalog of active capabilities across your organization." extra={<BookOpenText className="h-4 w-4 text-[var(--accent-2)]" />} />
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
            </div>
          ) : skills.length === 0 ? (
            <EmptyState icon={Sparkles} title="No skills in the library yet" description="Create the first capability entry to start building the matrix." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => (
                <div key={skill._id} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-[var(--text-strong)]">{skill.name}</p>
                      <p className="mt-2 text-sm text-[var(--text-body)]">{skill.description || 'No description provided.'}</p>
                    </div>
                    <Pill tone="blue">{skill.category || 'General'}</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppSurface>
      ) : null}

      {tab === 'create' ? (
        <AppSurface className="mt-6 p-6">
          <SurfaceHeader title="Create skill" subtitle="A minimal authoring panel for the core capability model." extra={<Plus className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={createSkill} className="grid gap-4 md:grid-cols-2">
            <FloatingField label="Name" value={skillForm.name} onChange={(event) => setSkillForm((prev) => ({ ...prev, name: event.target.value }))} required />
            <FloatingField label="Category" value={skillForm.category} onChange={(event) => setSkillForm((prev) => ({ ...prev, category: event.target.value }))} required />
            <FloatingField label="Description" as="textarea" rows={4} className="resize-none md:col-span-2" value={skillForm.description} onChange={(event) => setSkillForm((prev) => ({ ...prev, description: event.target.value }))} />
            <div className="md:col-span-2">
              <ActionButton type="submit">Add skill</ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : null}

      {tab === 'assign' ? (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <AppSurface className="p-6">
            <SurfaceHeader title="Assign skill" subtitle="Link people to capabilities with a more focused interaction flow." extra={<Award className="h-4 w-4 text-[var(--accent)]" />} />
            <form onSubmit={assignSkill} className="grid gap-4">
              <FloatingField label="Employee" as="select" value={assignForm.employeeId} onChange={(event) => {
                const value = event.target.value;
                setAssignForm((prev) => ({ ...prev, employeeId: value }));
                loadAssignments(value);
              }} required>
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>{employee.email}</option>
                ))}
              </FloatingField>
              <AutocompleteField
                label="Skill"
                value={skillQuery}
                placeholder="Type to search skills"
                options={(suggestionState.suggestions || []).map((skill) => ({ value: skill._id, label: `${skill.name}${skill.category ? ` • ${skill.category}` : ''}` }))}
                displayValue={selectedSkill ? `Selected skill: ${selectedSkill.name}` : ''}
                emptyMessage="No skills match your search."
                onInputChange={(nextValue) => {
                  setSkillQuery(nextValue);
                  setAssignForm((prev) => ({ ...prev, skillId: '' }));
                }}
                onSelect={(option) => {
                  const selectedSkill = skills.find((skill) => skill._id === option.value);
                  setSkillQuery(selectedSkill ? selectedSkill.name : option.label);
                  setAssignForm((prev) => ({ ...prev, skillId: option.value }));
                }}
                required
              />
              {!assignForm.skillId && skillQuery.trim() && suggestionState.canCreate ? (
                <>
                  <FloatingField label="New skill category" value={newSkillForm.category} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, category: event.target.value }))} />
                  <FloatingField label="New skill description" value={newSkillForm.description} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, description: event.target.value }))} />
                </>
              ) : null}
              <FloatingField label="Proficiency level" type="number" min="1" max="5" value={assignForm.proficiencyLevel} onChange={(event) => setAssignForm((prev) => ({ ...prev, proficiencyLevel: event.target.value }))} />
              <FloatingField label="Years of experience" type="number" min="0" value={assignForm.yearsOfExperience} onChange={(event) => setAssignForm((prev) => ({ ...prev, yearsOfExperience: event.target.value }))} />
              <ActionButton type="submit">{assignForm.skillId ? 'Assign skill' : 'Create and assign skill'}</ActionButton>
            </form>
          </AppSurface>

          <AppSurface className="p-6">
            <SurfaceHeader title="Assigned skills" subtitle="Current endorsements for the selected employee, shown as a cleaner progression set." />
            {assignments.length === 0 ? (
              <EmptyState icon={Award} title="No assignments yet" description="Pick an employee to load current endorsements, then add new ones from the left." />
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{assignment.skillId?.name}</p>
                      <Pill tone="green">Level {assignment.proficiencyLevel}</Pill>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4dd8ff,#32ff9d)]" style={{ width: `${(assignment.proficiencyLevel / 5) * 100}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-[var(--text-body)]">{assignment.yearsOfExperience} years of experience</p>
                  </div>
                ))}
              </div>
            )}
          </AppSurface>
        </div>
      ) : null}
    </AppShell>
  );
};

export default AdminSkillsPage;
