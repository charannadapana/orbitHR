import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { sendResponse, sendError } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseTimeForDate(date, timeString) {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  const value = new Date(date);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value;
}

function formatTime(dateValue) {
  if (!dateValue) return null;
  return new Date(dateValue).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateWorkingHours(checkInAt, checkOutAt) {
  if (!checkInAt || !checkOutAt) return 0;
  const diff = (new Date(checkOutAt) - new Date(checkInAt)) / (1000 * 60 * 60);
  return Math.max(0, Math.round(diff * 100) / 100);
}

function deriveAttendanceStatus(checkInAt, workingHours) {
  if (!checkInAt) return 'absent';
  if (workingHours > 0 && workingHours < 4) return 'half-day';

  const checkIn = new Date(checkInAt);
  const lateThreshold = new Date(checkIn);
  lateThreshold.setHours(9, 30, 0, 0);

  if (checkIn > lateThreshold) {
    return 'late';
  }

  return 'present';
}

async function getCurrentEmployee(userId) {
  return Employee.findOne({ userId }).select('_id userId designation department email salary');
}

function serializeAttendance(record) {
  if (!record) return null;
  const attendance = record.toObject ? record.toObject() : record;
  const liveWorkingHours = attendance.checkInAt && !attendance.checkOutAt
    ? calculateWorkingHours(attendance.checkInAt, new Date())
    : attendance.workingHours;
  return {
    ...attendance,
    checkInTime: attendance.checkInTime || formatTime(attendance.checkInAt),
    checkOutTime: attendance.checkOutTime || formatTime(attendance.checkOutAt),
    workingHours: liveWorkingHours || 0,
  };
}

// Mark attendance
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkInTime, checkOutTime, notes } = req.body;

    if (!employeeId || !date || !status) {
      return sendError(res, 400, 'Please provide all required fields');
    }

    // Check if attendance already exists for this date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: dateObj,
    });

    if (existingAttendance) {
      return sendError(res, 400, 'Attendance already marked for this date');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    const checkInAt = parseTimeForDate(dateObj, checkInTime);
    const checkOutAt = parseTimeForDate(dateObj, checkOutTime);
    const workingHours = calculateWorkingHours(checkInAt, checkOutAt);

    const attendance = await Attendance.create({
      employeeId,
      userId: employee.userId,
      date: dateObj,
      status,
      checkInTime,
      checkInAt,
      checkOutTime,
      checkOutAt,
      workingHours,
      notes,
      markedBy: req.user.id,
    });

    await attendance.populate('employeeId', 'email');
    await attendance.populate('userId', 'firstName lastName');

    return sendResponse(res, 201, {
      success: true,
      message: 'Attendance marked successfully',
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTodayAttendance = async (req, res, next) => {
  try {
    const employee = await getCurrentEmployee(req.user.id);
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const today = startOfDay();
    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    })
      .populate('employeeId', 'email designation department')
      .populate('userId', 'firstName lastName email');

    return sendResponse(res, 200, {
      success: true,
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

export const checkInAttendance = async (req, res, next) => {
  try {
    const employee = await getCurrentEmployee(req.user.id);
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const today = startOfDay();
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });

    if (attendance?.checkInAt) {
      return sendError(res, 400, 'You have already checked in today');
    }

    const now = new Date();
    if (!attendance) {
      attendance = await Attendance.create({
        employeeId: employee._id,
        userId: req.user.id,
        date: today,
        status: 'present',
        checkInAt: now,
        checkInTime: formatTime(now),
        markedBy: req.user.id,
      });
    } else {
      attendance.checkInAt = now;
      attendance.checkInTime = formatTime(now);
      attendance.status = 'present';
      attendance.markedBy = req.user.id;
      await attendance.save();
    }

    await attendance.populate('employeeId', 'email designation department');
    await attendance.populate('userId', 'firstName lastName email');

    return sendResponse(res, 200, {
      success: true,
      message: 'Checked in successfully',
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

export const checkOutAttendance = async (req, res, next) => {
  try {
    const employee = await getCurrentEmployee(req.user.id);
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const today = startOfDay();
    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });

    if (!attendance || !attendance.checkInAt) {
      return sendError(res, 400, 'Please check in before checking out');
    }

    if (attendance.checkOutAt) {
      return sendError(res, 400, 'You have already checked out today');
    }

    const now = new Date();
    attendance.checkOutAt = now;
    attendance.checkOutTime = formatTime(now);
    attendance.workingHours = calculateWorkingHours(attendance.checkInAt, now);
    attendance.status = deriveAttendanceStatus(attendance.checkInAt, attendance.workingHours);
    await attendance.save();

    await attendance.populate('employeeId', 'email designation department');
    await attendance.populate('userId', 'firstName lastName email');

    return sendResponse(res, 200, {
      success: true,
      message: 'Checked out successfully',
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance records
export const getAttendance = async (req, res, next) => {
  try {
    const { employeeId, userId, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.user.role === 'admin') {
      if (employeeId) filter.employeeId = employeeId;
      if (userId) filter.userId = userId;
    } else if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      if (employeeId) {
        const canAccess = visibleIds.some((id) => id.toString() === employeeId);
        if (!canAccess) {
          return sendError(res, 403, 'Not authorized to access this employee attendance');
        }
        filter.employeeId = employeeId;
      } else {
        filter.employeeId = { $in: visibleIds };
      }
    } else {
      filter.userId = req.user.id;
    }
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'email designation')
      .populate('userId', 'firstName lastName email')
      .populate('markedBy', 'firstName lastName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(filter);

    return sendResponse(res, 200, {
      success: true,
      data: attendance.map(serializeAttendance),
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

// Get single attendance record
export const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id)
      .populate('employeeId', 'email designation')
      .populate('userId', 'firstName lastName')
      .populate('markedBy', 'firstName lastName');

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canAccess = visibleIds.some((id) => id.toString() === attendance.employeeId?._id?.toString());
      if (!canAccess) {
        return sendError(res, 403, 'Not authorized to access this attendance record');
      }
    } else if (req.user.role !== 'admin' && attendance.userId?._id?.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access this attendance record');
    }

    return sendResponse(res, 200, {
      success: true,
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

// Update attendance record
export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.checkInTime && !updates.checkInAt) {
      const existing = await Attendance.findById(id).select('date');
      if (existing) {
        updates.checkInAt = parseTimeForDate(existing.date, updates.checkInTime);
      }
    }

    if (updates.checkOutTime && !updates.checkOutAt) {
      const existing = await Attendance.findById(id).select('date');
      if (existing) {
        updates.checkOutAt = parseTimeForDate(existing.date, updates.checkOutTime);
      }
    }

    if (updates.checkInAt || updates.checkOutAt) {
      const current = await Attendance.findById(id).select('checkInAt checkOutAt');
      const nextCheckIn = updates.checkInAt || current?.checkInAt;
      const nextCheckOut = updates.checkOutAt || current?.checkOutAt;
      updates.workingHours = calculateWorkingHours(nextCheckIn, nextCheckOut);
      updates.status = updates.status || deriveAttendanceStatus(nextCheckIn, updates.workingHours);
      updates.checkInTime = updates.checkInTime || formatTime(nextCheckIn);
      updates.checkOutTime = updates.checkOutTime || formatTime(nextCheckOut);
    }

    const attendance = await Attendance.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('employeeId', 'email designation')
      .populate('userId', 'firstName lastName')
      .populate('markedBy', 'firstName lastName');

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Attendance updated successfully',
      data: serializeAttendance(attendance),
    });
  } catch (error) {
    next(error);
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Attendance deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly summary for employee
export const getEmployeeAttendanceSummary = async (req, res, next) => {
  try {
    let { employeeId, year, month } = req.query;

    if (!year || !month) {
      return sendError(res, 400, 'Please provide year and month');
    }

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user.id }).select('_id');
      if (!employee) {
        return sendError(res, 404, 'Employee record not found');
      }
      employeeId = employee._id;
    } else if (req.user.role === 'manager') {
      if (!employeeId) {
        return sendError(res, 400, 'Please provide employeeId');
      }
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canAccess = visibleIds.some((id) => id.toString() === employeeId.toString());
      if (!canAccess) {
        return sendError(res, 403, 'Not authorized to access this employee attendance summary');
      }
    }

    if (!employeeId) {
      return sendError(res, 400, 'Please provide employeeId');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const summary = {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
      workingHoursTotal: 0,
    };

    attendance.forEach((record) => {
      summary.totalDays++;
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
        case 'on-leave':
          summary.onLeave++;
          break;
      }
      summary.workingHoursTotal += record.workingHours || 0;
    });

    return sendResponse(res, 200, {
      success: true,
      data: {
        month: month,
        year: year,
        summary,
        records: attendance.map(serializeAttendance),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get organization attendance summary
export const getOrganizationAttendanceSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return sendError(res, 400, 'Please provide year and month');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
    };

    summary.forEach((item) => {
      if (item._id === 'present') stats.present = item.count;
      if (item._id === 'absent') stats.absent = item.count;
      if (item._id === 'late') stats.late = item.count;
      if (item._id === 'half-day') stats.halfDay = item.count;
      if (item._id === 'on-leave') stats.onLeave = item.count;
    });

    return sendResponse(res, 200, {
      success: true,
      data: {
        month: month,
        year: year,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: today,
    })
      .populate('employeeId', 'email designation department')
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: attendance.map(serializeAttendance),
    });
  } catch (error) {
    next(error);
  }
};

// Get team attendance
export const getTeamAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const teamIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);

    const filter = { employeeId: { $in: teamIds } };
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'email designation department')
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
