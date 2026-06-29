import Employee from '../models/Employee.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

async function syncEmployeeTeamAssignment(employee, nextTeamId) {
  const previousTeamId = employee.teamId ? employee.teamId.toString() : null;
  const desiredTeamId = nextTeamId ? nextTeamId.toString() : null;

  if (previousTeamId === desiredTeamId) {
    return;
  }

  if (previousTeamId) {
    await Team.findByIdAndUpdate(previousTeamId, { $pull: { members: employee._id } });
  }

  if (desiredTeamId) {
    const team = await Team.findById(desiredTeamId).select('_id name managerId');
    if (!team) {
      throw new Error('Selected team not found');
    }

    employee.teamId = team._id;
    employee.department = employee.department || team.name;
    await Team.findByIdAndUpdate(team._id, { $addToSet: { members: employee._id } });
    await User.findByIdAndUpdate(employee.userId, { teamId: team._id });
  } else {
    employee.teamId = null;
    await User.findByIdAndUpdate(employee.userId, { teamId: null });
  }
}

// Create Employee
export const createEmployee = async (req, res, next) => {
  try {
    const {
      userId,
      designation,
      department,
      email,
      phoneNumber,
      dateOfJoining,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      employmentType,
      salary,
      teamId,
      reportingTo,
    } = req.body;

    // Validate required fields
    if (!userId || !designation || !department || !email || !dateOfJoining) {
      return sendError(res, 400, 'Please provide all required fields');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'Linked user not found');
    }

    const existingByUser = await Employee.findOne({ userId });
    const existingByEmail = await Employee.findOne({ email });

    if (existingByEmail && existingByEmail.userId.toString() !== userId) {
      return sendError(res, 400, 'Employee with this email already exists');
    }

    let employee;

    if (existingByUser) {
      existingByUser.designation = designation;
      existingByUser.department = department;
      existingByUser.email = email;
      existingByUser.phoneNumber = phoneNumber;
      existingByUser.dateOfJoining = dateOfJoining;
      existingByUser.dateOfBirth = dateOfBirth;
      existingByUser.address = address;
      existingByUser.city = city;
      existingByUser.state = state;
      existingByUser.zipCode = zipCode;
      existingByUser.employmentType = employmentType || existingByUser.employmentType;
      existingByUser.salary = salary;
      existingByUser.reportingTo = reportingTo || null;
      if (teamId !== undefined) {
        try {
          await syncEmployeeTeamAssignment(existingByUser, teamId || null);
        } catch (error) {
          return sendError(res, 400, error.message || 'Unable to assign employee to the selected team');
        }
      }
      employee = await existingByUser.save();
    } else {
      employee = await Employee.create({
        userId,
        designation,
        department,
        email,
        phoneNumber,
        dateOfJoining,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        employmentType,
        salary,
        teamId: null,
        reportingTo,
      });

      if (teamId) {
        try {
          await syncEmployeeTeamAssignment(employee, teamId);
        } catch (error) {
          return sendError(res, 400, error.message || 'Unable to assign employee to the selected team');
        }
        employee = await employee.save();
      }
    }

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'email firstName lastName role')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation');

    return sendResponse(res, existingByUser ? 200 : 201, {
      success: true,
      message: existingByUser ? 'Employee profile updated successfully' : 'Employee created successfully',
      data: populatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// Get all employees
export const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department, status, reportingTo, unassigned, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (reportingTo) filter.reportingTo = reportingTo;
    if (unassigned === 'true') filter.reportingTo = null;

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      filter._id = { $in: visibleIds };
    }

    const employees = await Employee.find(filter)
      .populate('userId', 'email firstName lastName role')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    return sendResponse(res, 200, {
      success: true,
      data: employees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single employee
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canAccess = visibleIds.some((employeeId) => employeeId.toString() === id);
      if (!canAccess) {
        return sendError(res, 403, 'Not authorized to access this employee record');
      }
    }

    const employee = await Employee.findById(id)
      .populate('userId', 'email firstName lastName role')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation');

    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    return sendResponse(res, 200, {
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update employee
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent email change to already existing email
    if (updates.email) {
      const existing = await Employee.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (existing) {
        return sendError(res, 400, 'Email already in use by another employee');
      }
    }

    let employee = await Employee.findById(id);

    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    if (updates.teamId !== undefined) {
      try {
        await syncEmployeeTeamAssignment(employee, updates.teamId || null);
      } catch (error) {
        return sendError(res, 400, error.message || 'Unable to update employee team');
      }
    }

    Object.assign(employee, updates);
    employee = await employee.save();

    employee = await Employee.findById(employee._id)
      .populate('userId', 'email firstName lastName')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation');

    return sendResponse(res, 200, {
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Delete employee
export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    if (employee.teamId) {
      await Team.findByIdAndUpdate(employee.teamId, { $pull: { members: employee._id } });
    }
    await User.findByIdAndUpdate(employee.userId, { teamId: null });

    return sendResponse(res, 200, {
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get employee by user ID
export const getEmployeeByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== userId) {
      return sendError(res, 403, 'Not authorized to access this employee record');
    }

    const employee = await Employee.findOne({ userId })
      .populate('userId', 'email firstName lastName role')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation');

    if (req.user.role === 'manager' && employee) {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canAccess = visibleIds.some((employeeId) => employeeId.toString() === employee._id.toString());
      if (!canAccess && req.user.id !== userId) {
        return sendError(res, 403, 'Not authorized to access this employee record');
      }
    }

    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    return sendResponse(res, 200, {
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res, next) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'active' });
    const inactive = await Employee.countDocuments({ status: 'inactive' });
    const onLeave = await Employee.countDocuments({ status: 'on-leave' });

    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return sendResponse(res, 200, {
      success: true,
      data: {
        total,
        active,
        inactive,
        onLeave,
        byDepartment: departmentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get manager's team
export const getMyTeam = async (req, res, next) => {
  try {
    const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);

    const team = await Employee.find({ _id: { $in: visibleIds } })
      .populate('userId', 'email firstName lastName role')
      .populate('teamId', 'name managerId')
      .populate('reportingTo', 'email designation');

    return sendResponse(res, 200, {
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};
