import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { sendError, sendResponse } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

function computeDaysCount(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export const requestLeave = async (req, res, next) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !startDate || !endDate || !reason) {
      return sendError(res, 400, 'Please provide all required fields');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    if (req.user.role !== 'admin' && employee.userId.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to request leave for this employee');
    }

    const daysCount = computeDaysCount(startDate, endDate);
    if (daysCount <= 0) {
      return sendError(res, 400, 'End date must be after or equal to start date');
    }

    const leave = await Leave.create({
      employeeId,
      userId: employee.userId,
      leaveType: leaveType || 'casual',
      startDate,
      endDate,
      daysCount,
      reason,
    });

    await leave.populate('userId', 'firstName lastName email');
    await leave.populate('employeeId', 'designation department');

    return sendResponse(res, 201, {
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user.role === 'employee') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      filter.employeeId = { $in: visibleIds };
    }
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const leaves = await Leave.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('employeeId', 'designation department')
      .populate('reviewedBy', 'firstName lastName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(filter);

    return sendResponse(res, 200, {
      success: true,
      data: leaves,
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

export const getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('employeeId', 'designation department')
      .populate('reviewedBy', 'firstName lastName');

    if (!leave) {
      return sendError(res, 404, 'Leave request not found');
    }

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canAccess = visibleIds.some((employeeId) => employeeId.toString() === leave.employeeId?._id?.toString());
      if (!canAccess) {
        return sendError(res, 403, 'Not authorized to access this leave request');
      }
    } else if (req.user.role !== 'admin' && leave.userId?._id?.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access this leave request');
    }

    return sendResponse(res, 200, {
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewComment } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return sendError(res, 400, 'Status must be approved, rejected, or cancelled');
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave request not found');
    }

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      const canReview = visibleIds.some((employeeId) => employeeId.toString() === leave.employeeId.toString());
      if (!canReview) {
        return sendError(res, 403, 'Not authorized to review this leave request');
      }
    }

    leave.status = status;
    leave.reviewComment = reviewComment || null;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    await leave.populate('userId', 'firstName lastName email');
    await leave.populate('employeeId', 'designation department');
    await leave.populate('reviewedBy', 'firstName lastName');

    await Notification.create({
      recipient: leave.userId._id,
      type: 'leave',
      title: `Leave request ${status}`,
      message: `Your ${leave.leaveType} leave request was ${status}.`,
      metadata: {
        leaveId: leave._id,
        status,
      },
    });

    return sendResponse(res, 200, {
      success: true,
      message: 'Leave request updated successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, 404, 'Leave request not found');
    }

    if (req.user.role !== 'admin') {
      if (leave.userId.toString() !== req.user.id) {
        return sendError(res, 403, 'Not authorized to delete this leave request');
      }
      if (leave.status !== 'pending') {
        return sendError(res, 400, 'Only pending leave requests can be deleted');
      }
    }

    await leave.deleteOne();

    return sendResponse(res, 200, {
      success: true,
      message: 'Leave request deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get team leaves
export const getTeamLeaves = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;

    const teamIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);

    const filter = { employeeId: { $in: teamIds } };
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const leaves = await Leave.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('employeeId', 'designation department')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};
