import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Notification from '../models/Notification.js';
import { sendError, sendResponse } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

function monthRange(year, month) {
  return {
    startDate: new Date(year, month - 1, 1),
    endDate: new Date(year, month, 0, 23, 59, 59),
  };
}

function attendanceDayEquivalent(attendance) {
  if (typeof attendance.workingHours === 'number' && attendance.workingHours > 0) {
    return Math.min(attendance.workingHours / 8, 1);
  }

  if (attendance.status === 'half-day') return 0.5;
  if (attendance.status === 'present' || attendance.status === 'late') return 1;
  return 0;
}

async function calculatePayslipForEmployee(employee, year, month) {
  const baseSalary = employee.salary || 0;
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const { startDate, endDate } = monthRange(year, month);

  const attendances = await Attendance.find({
    employeeId: employee._id,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['present', 'late', 'half-day'] }
  });

  const totalWorkedHours = attendances.reduce((sum, attendance) => sum + (attendance.workingHours || 0), 0);
  const effectivePresentDays = attendances.reduce((sum, attendance) => sum + attendanceDayEquivalent(attendance), 0);

  const paidLeaves = await Leave.find({
    employeeId: employee._id,
    status: 'approved',
    leaveType: { $in: ['sick', 'earned', 'casual'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  let paidLeaveDaysInMonth = 0;
  paidLeaves.forEach(leave => {
    let current = new Date(leave.startDate);
    if (current < startDate) current = new Date(startDate);
    let end = new Date(leave.endDate);
    if (end > endDate) end = new Date(endDate);
    
    while (current <= end) {
      paidLeaveDaysInMonth += 1;
      current.setDate(current.getDate() + 1);
    }
  });

  const totalPayableDays = effectivePresentDays + paidLeaveDaysInMonth;
  const finalSalary = (baseSalary / totalDaysInMonth) * totalPayableDays;

  return {
    employeeId: employee._id,
    baseSalary,
    totalDaysInMonth,
    totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
    effectivePresentDays: Math.round(effectivePresentDays * 100) / 100,
    paidLeaveDaysInMonth,
    totalPayableDays: Math.round(totalPayableDays * 100) / 100,
    finalSalary: Math.round(finalSalary),
    month: parseInt(month, 10),
    year: parseInt(year, 10)
  };
}

// @desc    Get dynamic payslip for an employee for a specific month
// @route   GET /api/v1/payroll/my-slip?year=2026&month=4
// @access  Private
export const getMyPayslip = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return sendError(res, 400, 'Please provide year and month');
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return sendError(res, 404, 'Employee profile not found');
    }

    const payload = await calculatePayslipForEmployee(employee, Number(year), Number(month));

    await Notification.findOneAndUpdate(
      {
        recipient: req.user.id,
        type: 'payroll',
        'metadata.year': payload.year,
        'metadata.month': payload.month,
      },
      {
        $setOnInsert: {
          title: `Payslip ready for ${payload.month}/${payload.year}`,
          message: `Your estimated salary for ${payload.month}/${payload.year} is available to review.`,
          metadata: {
            year: payload.year,
            month: payload.month,
            finalSalary: payload.finalSalary,
          },
        },
      },
      { upsert: true, new: true }
    );

    return sendResponse(res, 200, {
      success: true,
      data: payload,
    });

  } catch (error) {
    next(error);
  }
};

export const getTeamPayslips = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return sendError(res, 400, 'Please provide year and month');
    }

    let employees = [];

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      employees = await Employee.find({ _id: { $in: visibleIds } })
        .populate('userId', 'firstName lastName email');
    } else if (req.user.role === 'admin') {
      employees = await Employee.find().populate('userId', 'firstName lastName email');
    } else {
      return sendError(res, 403, 'Not authorized to access team payslips');
    }

    const payslips = [];
    for (const employee of employees) {
      const payslip = await calculatePayslipForEmployee(employee, Number(year), Number(month));
      payslips.push({
        ...payslip,
        employee: {
          _id: employee._id,
          firstName: employee.userId?.firstName || '',
          lastName: employee.userId?.lastName || '',
          email: employee.userId?.email || employee.email,
          designation: employee.designation,
          department: employee.department,
        },
      });
    }

    return sendResponse(res, 200, {
      success: true,
      data: payslips.sort((a, b) => b.finalSalary - a.finalSalary),
      meta: {
        month: Number(month),
        year: Number(year),
      },
    });
  } catch (error) {
    next(error);
  }
};
