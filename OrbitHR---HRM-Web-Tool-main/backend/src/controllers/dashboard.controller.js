import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import EmployeeSkill from '../models/EmployeeSkill.js';
import Leave from '../models/Leave.js';
import Skill from '../models/Skill.js';
import { sendError, sendResponse } from '../utils/response.js';

function monthRange(monthOffset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      totalSkills,
      attendanceToday,
      leaveStatusAgg,
      topSkills,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' }),
      Skill.countDocuments({ isActive: true }),
      Attendance.find({ date: todayStart }).select('status'),
      Leave.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      EmployeeSkill.aggregate([
        { $lookup: { from: 'skills', localField: 'skillId', foreignField: '_id', as: 'skill' } },
        { $unwind: '$skill' },
        { $group: { _id: '$skill.name', avgLevel: { $avg: '$proficiencyLevel' }, assignedCount: { $sum: 1 } } },
        { $sort: { assignedCount: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const attendanceCounts = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
    };

    for (const item of attendanceToday) {
      if (item.status === 'present') attendanceCounts.present += 1;
      if (item.status === 'absent') attendanceCounts.absent += 1;
      if (item.status === 'late') attendanceCounts.late += 1;
      if (item.status === 'half-day') attendanceCounts.halfDay += 1;
      if (item.status === 'on-leave') attendanceCounts.onLeave += 1;
    }

    const leaveCounts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    for (const item of leaveStatusAgg) {
      if (leaveCounts[item._id] !== undefined) {
        leaveCounts[item._id] = item.count;
      }
    }

    return sendResponse(res, 200, {
      success: true,
      data: {
        cards: {
          totalEmployees,
          activeEmployees,
          pendingLeaves,
          totalSkills,
        },
        attendanceToday: attendanceCounts,
        leaveStatus: leaveCounts,
        topSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboardSummary = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id }).select('_id');
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const { start, end } = monthRange(0);

    const [attendanceRecords, leaveStats, skillAssignments] = await Promise.all([
      Attendance.find({
        employeeId: employee._id,
        date: { $gte: start, $lte: end },
      }).select('status date'),
      Leave.find({ userId: req.user.id }).select('status'),
      EmployeeSkill.find({ employeeId: employee._id })
        .populate('skillId', 'name category')
        .select('proficiencyLevel skillId'),
    ]);

    const attendanceSummary = {
      totalDays: attendanceRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
    };

    for (const record of attendanceRecords) {
      if (record.status === 'present') attendanceSummary.present += 1;
      if (record.status === 'absent') attendanceSummary.absent += 1;
      if (record.status === 'late') attendanceSummary.late += 1;
      if (record.status === 'half-day') attendanceSummary.halfDay += 1;
      if (record.status === 'on-leave') attendanceSummary.onLeave += 1;
    }

    const leaveSummary = { approved: 0, pending: 0, rejected: 0, cancelled: 0 };
    for (const leave of leaveStats) {
      if (leaveSummary[leave.status] !== undefined) {
        leaveSummary[leave.status] += 1;
      }
    }

    const topSkills = skillAssignments
      .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
      .slice(0, 5)
      .map((item) => ({
        name: item.skillId?.name || 'Unknown',
        category: item.skillId?.category || 'General',
        level: item.proficiencyLevel,
      }));

    return sendResponse(res, 200, {
      success: true,
      data: {
        cards: {
          attendanceThisMonth: attendanceSummary.totalDays,
          approvedLeaves: leaveSummary.approved,
          pendingLeaves: leaveSummary.pending,
          skillsCount: skillAssignments.length,
        },
        attendanceSummary,
        leaveSummary,
        topSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};
