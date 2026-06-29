import { useEffect, useMemo, useState } from 'react';
import { FilePenLine, Sparkles, Star, Trash2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, AutocompleteField, EmptyState, FloatingField, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../api/employeeService';
import { skillService } from '../api/skillService';

const emptySkillForm = {
  skillId: '',
  proficiencyLevel: 3,
  yearsOfExperience: 0,
  notes: '',
};

const EmployeeSkillsPage = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillQuery, setSkillQuery] = useState('');
  const [newSkillForm, setNewSkillForm] = useState({ category: 'General', description: '' });
  const [suggestionState, setSuggestionState] = useState({ exactMatch: null, suggestions: [], canCreate: false });
  const [form, setForm] = useState(emptySkillForm);

  const selectedSkill = useMemo(() => {
    if (editingSkill?.skillId) {
      return suggestionState.suggestions.find((skill) => skill._id === editingSkill.skillId) || suggestionState.exactMatch;
    }

    return suggestionState.suggestions.find((skill) => skill._id === form.skillId) || suggestionState.exactMatch;
  }, [editingSkill, form.skillId, suggestionState]);

  const loadSkills = async (targetEmployeeId) => {
    const result = await skillService.getEmployeeSkills(targetEmployeeId);
    if (result.success) {
      setSkills(result.data || []);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const employeeResult = await employeeService.getEmployeeByUserId(user?._id);
        const currentEmployeeId = employeeResult.data?._id;
        if (!currentEmployeeId) {
          throw new Error('Employee profile missing');
        }

        setEmployeeId(currentEmployeeId);
        await loadSkills(currentEmployeeId);
      } catch (err) {
        setError('Skill profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      load();
    }
  }, [user?._id]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const result = await skillService.getSuggestions(skillQuery);
        if (result.success) {
          setSuggestionState(result.data || { exactMatch: null, suggestions: [], canCreate: false });

          if (result.data?.exactMatch?._id) {
            if (editingSkill) {
              setEditingSkill((prev) => ({ ...prev, skillId: result.data.exactMatch._id }));
            } else {
              setForm((prev) => ({ ...prev, skillId: result.data.exactMatch._id }));
            }
          }
        }
      } catch (err) {
        setSuggestionState({ exactMatch: null, suggestions: [], canCreate: false });
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [editingSkill, skillQuery]);

  const resetComposer = () => {
    setForm(emptySkillForm);
    setEditingSkill(null);
    setSkillQuery('');
    setNewSkillForm({ category: 'General', description: '' });
    setSuggestionState({ exactMatch: null, suggestions: [], canCreate: false });
    setShowForm(false);
  };

  const createSkill = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        employeeId,
        skillId: form.skillId || undefined,
        skillName: form.skillId ? undefined : skillQuery,
        category: form.skillId ? undefined : newSkillForm.category,
        description: form.skillId ? undefined : newSkillForm.description,
        proficiencyLevel: Number(form.proficiencyLevel),
        yearsOfExperience: Number(form.yearsOfExperience),
        notes: form.notes,
      };

      const result = await skillService.assignSkill(payload);
      if (result.success) {
        await loadSkills(employeeId);
        resetComposer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateSkill = async (event) => {
    event.preventDefault();
    if (!editingSkill?._id) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        skillId: editingSkill.skillId || undefined,
        skillName: editingSkill.skillId ? undefined : skillQuery,
        category: editingSkill.skillId ? undefined : newSkillForm.category,
        description: editingSkill.skillId ? undefined : newSkillForm.description,
        proficiencyLevel: Number(editingSkill.proficiencyLevel),
        yearsOfExperience: Number(editingSkill.yearsOfExperience),
        notes: editingSkill.notes,
      };

      const result = await skillService.updateAssignment(editingSkill._id, payload);
      if (result.success) {
        await loadSkills(employeeId);
        resetComposer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill from your profile?')) {
      return;
    }

    try {
      setError('');
      await skillService.deleteAssignment(id);
      await loadSkills(employeeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete this skill.');
    }
  };

  const openEditor = (assignment) => {
    setEditingSkill({
      _id: assignment._id,
      skillId: assignment.skillId?._id || '',
      proficiencyLevel: assignment.proficiencyLevel,
      yearsOfExperience: assignment.yearsOfExperience,
      notes: assignment.notes || '',
    });
    setSkillQuery(assignment.skillId?.name || '');
    setNewSkillForm({
      category: assignment.skillId?.category || 'General',
      description: '',
    });
    setShowForm(false);
  };

  return (
    <AppShell userRole="employee">
      <PageHeader
        eyebrow="Skill profile"
        title="Own your capability map with self-serve skill updates that stay visible to your manager."
        subtitle="You can add, refine, and remove your own skills here. Managers can review them, but your profile stays in your hands."
      >
        <ActionButton onClick={() => {
          setEditingSkill(null);
          setShowForm((value) => !value);
          setSkillQuery('');
          setForm(emptySkillForm);
        }}>
          <Sparkles className="h-4 w-4" />
          Add skill
        </ActionButton>
      </PageHeader>

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      {showForm ? (
        <AppSurface className="mb-6 p-6">
          <SurfaceHeader title="Add a skill" subtitle="Search the shared skill library first, then create a new entry if nothing close exists." extra={<Sparkles className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={createSkill} className="grid gap-4 md:grid-cols-2">
            <AutocompleteField
              label="Skill"
              value={skillQuery}
              placeholder="Type skill name"
              options={(suggestionState.suggestions || []).map((skill) => ({ value: skill._id, label: `${skill.name}${skill.category ? ` • ${skill.category}` : ''}` }))}
              displayValue={selectedSkill ? `Selected skill: ${selectedSkill.name}` : ''}
              emptyMessage="No matching skills yet."
              onInputChange={(nextValue) => {
                setSkillQuery(nextValue);
                setForm((prev) => ({ ...prev, skillId: '' }));
              }}
              onSelect={(option) => {
                const chosen = suggestionState.suggestions.find((skill) => skill._id === option.value);
                setSkillQuery(chosen?.name || option.label);
                setForm((prev) => ({ ...prev, skillId: option.value }));
              }}
              required
            />
            <FloatingField label="Proficiency level" as="select" value={form.proficiencyLevel} onChange={(event) => setForm((prev) => ({ ...prev, proficiencyLevel: event.target.value }))}>
              <option value="1">Beginner</option>
              <option value="2">Developing</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </FloatingField>
            {!form.skillId && skillQuery.trim() && suggestionState.canCreate ? (
              <>
                <FloatingField label="New skill category" value={newSkillForm.category} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, category: event.target.value }))} />
                <FloatingField label="New skill description" value={newSkillForm.description} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, description: event.target.value }))} />
              </>
            ) : null}
            <FloatingField label="Years of experience" type="number" min="0" value={form.yearsOfExperience} onChange={(event) => setForm((prev) => ({ ...prev, yearsOfExperience: event.target.value }))} />
            <FloatingField label="Notes" as="textarea" rows={4} className="resize-none md:col-span-2" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            <div className="flex gap-3 md:col-span-2">
              <ActionButton type="submit" disabled={submitting}>{submitting ? 'Saving...' : form.skillId ? 'Add skill' : 'Create and add skill'}</ActionButton>
              <ActionButton type="button" tone="secondary" onClick={resetComposer}>Cancel</ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : null}

      {editingSkill ? (
        <AppSurface className="mb-6 p-6">
          <SurfaceHeader title="Edit skill" subtitle="Refresh your proficiency and experience without losing history across the shared skill library." extra={<FilePenLine className="h-4 w-4 text-[var(--accent)]" />} />
          <form onSubmit={updateSkill} className="grid gap-4 md:grid-cols-2">
            <AutocompleteField
              label="Skill"
              value={skillQuery}
              placeholder="Type skill name"
              options={(suggestionState.suggestions || []).map((skill) => ({ value: skill._id, label: `${skill.name}${skill.category ? ` • ${skill.category}` : ''}` }))}
              displayValue={selectedSkill ? `Selected skill: ${selectedSkill.name}` : ''}
              emptyMessage="No matching skills yet."
              onInputChange={(nextValue) => {
                setSkillQuery(nextValue);
                setEditingSkill((prev) => ({ ...prev, skillId: '' }));
              }}
              onSelect={(option) => {
                const chosen = suggestionState.suggestions.find((skill) => skill._id === option.value);
                setSkillQuery(chosen?.name || option.label);
                setEditingSkill((prev) => ({ ...prev, skillId: option.value }));
              }}
              required
            />
            <FloatingField label="Proficiency level" as="select" value={editingSkill.proficiencyLevel} onChange={(event) => setEditingSkill((prev) => ({ ...prev, proficiencyLevel: event.target.value }))}>
              <option value="1">Beginner</option>
              <option value="2">Developing</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </FloatingField>
            {!editingSkill.skillId && skillQuery.trim() && suggestionState.canCreate ? (
              <>
                <FloatingField label="New skill category" value={newSkillForm.category} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, category: event.target.value }))} />
                <FloatingField label="New skill description" value={newSkillForm.description} onChange={(event) => setNewSkillForm((prev) => ({ ...prev, description: event.target.value }))} />
              </>
            ) : null}
            <FloatingField label="Years of experience" type="number" min="0" value={editingSkill.yearsOfExperience} onChange={(event) => setEditingSkill((prev) => ({ ...prev, yearsOfExperience: event.target.value }))} />
            <FloatingField label="Notes" as="textarea" rows={4} className="resize-none md:col-span-2" value={editingSkill.notes} onChange={(event) => setEditingSkill((prev) => ({ ...prev, notes: event.target.value }))} />
            <div className="flex gap-3 md:col-span-2">
              <ActionButton type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Update skill'}</ActionButton>
              <ActionButton type="button" tone="secondary" onClick={resetComposer}>Cancel</ActionButton>
            </div>
          </form>
        </AppSurface>
      ) : null}

      <AppSurface className="p-6">
        <SurfaceHeader title="My skills" subtitle="A polished card grid for your current capability profile." extra={<Sparkles className="h-4 w-4 text-[var(--accent)]" />} />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonBlock className="h-44" />
            <SkeletonBlock className="h-44" />
            <SkeletonBlock className="h-44" />
          </div>
        ) : skills.length === 0 ? (
          <EmptyState icon={Sparkles} title="No skills added yet" description="Build your profile by adding the skills you actively use. New skills can be created if the shared catalog does not have them yet." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <div key={skill._id} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-[var(--text-strong)]">{skill.skillId?.name}</p>
                    <p className="mt-2 text-sm text-[var(--text-body)]">{skill.skillId?.category}</p>
                  </div>
                  <Pill tone="blue">Level {skill.proficiencyLevel}</Pill>
                </div>
                <div className="mt-5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star key={value} className="h-4 w-4" style={{ color: value <= skill.proficiencyLevel ? '#ffd076' : '#56657a', fill: value <= skill.proficiencyLevel ? '#ffd076' : 'transparent' }} />
                  ))}
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/8">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4dd8ff,#32ff9d)]" style={{ width: `${(skill.proficiencyLevel / 5) * 100}%` }} />
                </div>
                <p className="mt-4 text-sm text-[var(--text-body)]">{skill.yearsOfExperience} years of experience</p>
                {skill.notes ? <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{skill.notes}</p> : null}
                <div className="mt-5 flex gap-3">
                  <ActionButton tone="secondary" className="flex-1" onClick={() => openEditor(skill)}>
                    <FilePenLine className="h-4 w-4" />
                    Edit
                  </ActionButton>
                  <ActionButton tone="danger" className="flex-1" onClick={() => deleteSkill(skill._id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppSurface>
    </AppShell>
  );
};

export default EmployeeSkillsPage;
