import { DEFAULT_SKILL_LIBRARY } from '../constants/skills.js';
import Employee from '../models/Employee.js';
import EmployeeSkill from '../models/EmployeeSkill.js';
import Skill from '../models/Skill.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';
import { sendError, sendResponse } from '../utils/response.js';
import { findSimilarSkills, normalizeSkillLabel, normalizeSkillName } from '../utils/skillNormalization.js';

async function ensureDefaultSkillLibrary() {
  const count = await Skill.countDocuments({ isActive: true });
  if (count > 0) {
    return;
  }

  for (const skill of DEFAULT_SKILL_LIBRARY) {
    const normalizedName = normalizeSkillName(skill.name);
    const existing = await Skill.findOne({ normalizedName }).select('_id');
    if (!existing) {
      await Skill.create({
        ...skill,
        normalizedName,
      });
    }
  }
}

async function ensureManagerCanAccessEmployee(req, employeeId) {
  if (req.user.role !== 'manager') {
    return true;
  }

  const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee']);
  const allowed = visibleIds.some((item) => item.toString() === employeeId.toString());
  if (!allowed) {
    return false;
  }

  return true;
}

async function getCurrentEmployee(req) {
  return Employee.findOne({ userId: req.user.id }).select('_id userId');
}

async function ensureEmployeeOwnsRecord(req, employeeId) {
  if (req.user.role !== 'employee') {
    return true;
  }

  const employee = await getCurrentEmployee(req);
  if (!employee) {
    return false;
  }

  return employee._id.toString() === employeeId.toString();
}

async function resolveSkillReference({ skillId, skillName, category = 'General', description = '' }) {
  if (skillId) {
    return Skill.findById(skillId);
  }

  const normalizedName = normalizeSkillName(skillName);
  if (!normalizedName) {
    return null;
  }

  const existing = await Skill.findOne({ normalizedName });
  if (existing) {
    return existing;
  }

  return Skill.create({
    name: normalizeSkillLabel(skillName),
    category: normalizeSkillLabel(category) || 'General',
    description: description || '',
    normalizedName,
  });
}

export const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return sendError(res, 400, 'Please provide name and category');
    }

    const normalizedName = normalizeSkillName(name);
    const existing = await Skill.findOne({ normalizedName });
    if (existing) {
      return sendResponse(res, 200, {
        success: true,
        message: 'A matching skill already exists and was reused',
        data: existing,
      });
    }

    const skill = await Skill.create({
      name: normalizeSkillLabel(name),
      category: normalizeSkillLabel(category),
      description: description || '',
      normalizedName,
    });

    return sendResponse(res, 201, {
      success: true,
      message: 'Skill created successfully',
      data: skill,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 400, 'That skill is already on this profile');
    }
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    await ensureDefaultSkillLibrary();

    const { search, category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    let skills = await Skill.find(filter).sort({ category: 1, name: 1 });

    if (search) {
      const query = String(search).trim();
      skills = findSimilarSkills(skills, query).sort((left, right) => left.name.localeCompare(right.name));
    }

    return sendResponse(res, 200, {
      success: true,
      data: skills,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 400, 'That skill is already on this profile');
    }
    next(error);
  }
};

export const getSkillSuggestions = async (req, res, next) => {
  try {
    await ensureDefaultSkillLibrary();

    const query = String(req.query.q || '').trim();
    const catalog = await Skill.find({ isActive: true }).sort({ category: 1, name: 1 });

    if (!query) {
      return sendResponse(res, 200, {
        success: true,
        data: {
          exactMatch: null,
          suggestions: catalog.slice(0, 16),
          canCreate: false,
        },
      });
    }

    const normalizedName = normalizeSkillName(query);
    const exactMatch = catalog.find((skill) => (skill.normalizedName || normalizeSkillName(skill.name)) === normalizedName) || null;
    const suggestions = findSimilarSkills(catalog, query).slice(0, 12);

    return sendResponse(res, 200, {
      success: true,
      data: {
        exactMatch,
        suggestions,
        canCreate: !exactMatch,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      updates.name = normalizeSkillLabel(updates.name);
      updates.normalizedName = normalizeSkillName(updates.name);

      const existing = await Skill.findOne({
        normalizedName: updates.normalizedName,
        _id: { $ne: id },
      }).select('_id');

      if (existing) {
        return sendError(res, 400, 'A similar skill already exists');
      }
    }

    if (updates.category) {
      updates.category = normalizeSkillLabel(updates.category);
    }

    const skill = await Skill.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return sendError(res, 404, 'Skill not found');
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const linked = await EmployeeSkill.countDocuments({ skillId: id });
    if (linked > 0) {
      await Skill.findByIdAndUpdate(id, { isActive: false });
      return sendResponse(res, 200, {
        success: true,
        message: 'Skill has assignments and was deactivated instead of deleted',
      });
    }

    const deleted = await Skill.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, 404, 'Skill not found');
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const assignSkillToEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      skillId,
      skillName,
      category,
      description,
      proficiencyLevel,
      yearsOfExperience,
      lastUsedYear,
      isPrimary,
      notes,
    } = req.body;

    if (!employeeId || !proficiencyLevel || (!skillId && !skillName)) {
      return sendError(res, 400, 'Please provide employeeId, proficiencyLevel, and a skill reference');
    }

    if (req.user.role === 'manager') {
      return sendError(res, 403, 'Managers can review team skills but cannot create employee skill entries directly');
    }

    await ensureDefaultSkillLibrary();

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    const allowed = await ensureEmployeeOwnsRecord(req, employeeId);
    if (!allowed) {
      return sendError(res, 403, 'You can only manage your own skill profile');
    }

    const skill = await resolveSkillReference({ skillId, skillName, category, description });
    if (!skill || !skill.isActive) {
      return sendError(res, 404, 'Skill not found');
    }

    const assignment = await EmployeeSkill.findOneAndUpdate(
      { employeeId, skillId: skill._id },
      {
        userId: employee.userId,
        proficiencyLevel,
        yearsOfExperience: yearsOfExperience ?? 0,
        lastUsedYear: lastUsedYear ?? new Date().getFullYear(),
        isPrimary: Boolean(isPrimary),
        notes: notes || '',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    )
      .populate('skillId', 'name category normalizedName')
      .populate('userId', 'firstName lastName email');

    return sendResponse(res, 200, {
      success: true,
      message: 'Skill assigned successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeSkill = async (req, res, next) => {
  try {
    const existing = await EmployeeSkill.findById(req.params.id).select('employeeId skillId');
    if (!existing) {
      return sendError(res, 404, 'Skill assignment not found');
    }

    if (req.user.role === 'manager') {
      return sendError(res, 403, 'Managers can review team skills but cannot edit them');
    }

    const allowed = await ensureEmployeeOwnsRecord(req, existing.employeeId);
    if (!allowed) {
      return sendError(res, 403, 'You can only update your own skills');
    }

    const updates = { ...req.body };
    let targetSkillId = existing.skillId;

    if (updates.skillId || updates.skillName) {
      const skill = await resolveSkillReference({
        skillId: updates.skillId,
        skillName: updates.skillName,
        category: updates.category,
        description: updates.description,
      });

      if (!skill || !skill.isActive) {
        return sendError(res, 404, 'Skill not found');
      }

      targetSkillId = skill._id;
      delete updates.skillId;
      delete updates.skillName;
      delete updates.category;
      delete updates.description;
    }

    const assignment = await EmployeeSkill.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...updates,
        skillId: targetSkillId,
      },
      { new: true, runValidators: true }
    )
      .populate('skillId', 'name category')
      .populate('userId', 'firstName lastName email');

    if (!assignment) {
      return sendError(res, 404, 'Skill assignment not found');
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Skill assignment updated successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeSkills = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    if (req.user.role === 'manager') {
      const allowed = await ensureManagerCanAccessEmployee(req, employeeId);
      if (!allowed) {
        return sendError(res, 403, 'Not authorized to access these skills');
      }
    } else if (req.user.role !== 'admin' && employee.userId.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access these skills');
    }

    const skills = await EmployeeSkill.find({ employeeId })
      .populate('skillId', 'name category')
      .sort({ proficiencyLevel: -1, createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySkills = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id }).select('_id');
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const skills = await EmployeeSkill.find({ employeeId: employee._id })
      .populate('skillId', 'name category')
      .sort({ proficiencyLevel: -1, createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployeeSkill = async (req, res, next) => {
  try {
    const existing = await EmployeeSkill.findById(req.params.id).select('employeeId');
    if (!existing) {
      return sendError(res, 404, 'Skill assignment not found');
    }

    if (req.user.role === 'manager') {
      return sendError(res, 403, 'Managers can review team skills but cannot delete them');
    }

    const allowed = await ensureEmployeeOwnsRecord(req, existing.employeeId);
    if (!allowed) {
      return sendError(res, 403, 'You can only remove skills from your own profile');
    }

    const deleted = await EmployeeSkill.findByIdAndDelete(req.params.id);

    return sendResponse(res, 200, {
      success: true,
      message: 'Skill assignment removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
