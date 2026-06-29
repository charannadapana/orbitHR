import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import { sendError, sendResponse } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

async function resolveAllowedEmployee(req, employeeId) {
  const employee = await Employee.findById(employeeId).populate('userId', 'firstName lastName email role');
  if (!employee) {
    return { error: 'Employee not found' };
  }

  if (req.user.role === 'admin') {
    return { employee };
  }

  if (req.user.role === 'employee' && employee.userId?._id?.toString() === req.user.id) {
    return { employee };
  }

  if (req.user.role === 'manager') {
    const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
    const canAccess = visibleIds.some((id) => id.toString() === employeeId);
    if (canAccess) {
      return { employee };
    }
  }

  return { error: 'Not authorized to access this activity timeline', status: 403 };
}

export const getEmployeeActivityTimeline = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const access = await resolveAllowedEmployee(req, employeeId);

    if (access.error) {
      return sendError(res, access.status || 404, access.error);
    }

    const employee = access.employee;
    const [attendanceRecords, tasks, leaves] = await Promise.all([
      Attendance.find({ employeeId })
        .sort({ date: -1 })
        .limit(limit)
        .select('status date checkInTime checkOutTime createdAt updatedAt'),
      Task.find({ assignedTo: employeeId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('assignedBy', 'firstName lastName email')
        .select('title status priority dueDate description assignedBy createdAt updatedAt'),
      Leave.find({ employeeId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('reviewedBy', 'firstName lastName email')
        .select('leaveType status startDate endDate daysCount reason reviewedBy reviewedAt createdAt updatedAt'),
    ]);

    const events = [
      ...attendanceRecords.map((record) => ({
        type: 'attendance',
        ts: record.updatedAt || record.createdAt || record.date,
        title: `Attendance marked as ${record.status}`,
        detail: `${new Date(record.date).toLocaleDateString()}${record.checkInTime ? `, in ${record.checkInTime}` : ''}${record.checkOutTime ? `, out ${record.checkOutTime}` : ''}`,
        metadata: {
          status: record.status,
          attendanceId: record._id,
        },
      })),
      ...tasks.map((task) => ({
        type: 'task',
        ts: task.updatedAt || task.createdAt,
        title: `${task.title} is ${task.status}`,
        detail: `Priority ${task.priority} • due ${new Date(task.dueDate).toLocaleDateString()}${task.assignedBy ? ` • assigned by ${task.assignedBy.firstName} ${task.assignedBy.lastName}` : ''}`,
        metadata: {
          taskId: task._id,
          status: task.status,
          priority: task.priority,
        },
      })),
      ...leaves.map((leave) => ({
        type: 'leave',
        ts: leave.reviewedAt || leave.updatedAt || leave.createdAt,
        title: `${leave.leaveType} leave ${leave.status}`,
        detail: `${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} • ${leave.daysCount} day(s)`,
        metadata: {
          leaveId: leave._id,
          status: leave.status,
        },
      })),
    ]
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, limit);

    return sendResponse(res, 200, {
      success: true,
      data: {
        employee: {
          _id: employee._id,
          firstName: employee.userId?.firstName || '',
          lastName: employee.userId?.lastName || '',
          designation: employee.designation,
          department: employee.department,
        },
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};
