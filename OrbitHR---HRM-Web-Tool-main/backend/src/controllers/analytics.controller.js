import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';
import { sendResponse } from '../utils/response.js';

const { Types } = mongoose;

function getPeriodRange(year, month) {
  const parsedYear = Number(year) || new Date().getFullYear();
  const parsedMonth = Number(month) || new Date().getMonth() + 1;

  const start = new Date(parsedYear, parsedMonth - 1, 1);
  const end = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

  return { parsedYear, parsedMonth, start, end };
}

function getLastThirtyDaysRange() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function toObjectIds(values = []) {
  return values.map((value) => new Types.ObjectId(value));
}

async function getManagerScopedEmployeeIds(managerUserId) {
  const employeeIds = await getManagerVisibleEmployeeIds(managerUserId, ['employee']);
  return toObjectIds(employeeIds);
}

async function getEmployeeLookupMap(employeeIds) {
  const employees = await Employee.find({ _id: { $in: employeeIds } })
    .populate('userId', 'firstName lastName email')
    .select('designation department userId');

  return new Map(
    employees.map((employee) => [
      employee._id.toString(),
      {
        _id: employee._id,
        firstName: employee.userId?.firstName || '',
        lastName: employee.userId?.lastName || '',
        email: employee.userId?.email || '',
        designation: employee.designation,
        department: employee.department,
      },
    ]),
  );
}

function calculateAttendanceRate(presentEquivalent = 0, total = 0) {
  if (!total) {
    return 0;
  }

  return presentEquivalent / total;
}

export const getManagerAnalytics = async (req, res, next) => {
  try {
    const { parsedYear, parsedMonth, start, end } = getPeriodRange(req.query.year, req.query.month);
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await buildManagerSummaryAnalytics(employeeIds, { start, end });

    return sendResponse(res, 200, {
      success: true,
      data,
      meta: { year: parsedYear, month: parsedMonth },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { parsedYear, parsedMonth, start, end } = getPeriodRange(req.query.year, req.query.month);
    const employeeUserIds = await User.find({ role: 'employee' }).distinct('_id');
    const employeeIds = await Employee.find({ userId: { $in: employeeUserIds } }).distinct('_id');
    const data = await buildManagerSummaryAnalytics(toObjectIds(employeeIds), { start, end });

    return sendResponse(res, 200, {
      success: true,
      data,
      meta: { year: parsedYear, month: parsedMonth },
    });
  } catch (error) {
    next(error);
  }
};

async function buildManagerSummaryAnalytics(employeeIds, { start, end }) {
  const [overview, taskPerformance, attendanceTrends, ranking] = await Promise.all([
    getTeamOverviewData(employeeIds, { start, end }),
    getTaskPerformanceData(employeeIds, { start, end }),
    getAttendanceTrendData(employeeIds),
    getPerformanceRankingData(employeeIds, { start, end }),
  ]);

  const trendMap = new Map(
    attendanceTrends.trends.map((entry) => [
      entry.date,
      {
        date: entry.date,
        tasksCompleted: 0,
        attendancePresentEquivalent: entry.presentEquivalent,
      },
    ]),
  );

  for (const item of taskPerformance.completionTimeline) {
    const existing = trendMap.get(item.date);
    if (existing) {
      existing.tasksCompleted = item.tasksCompleted;
    } else {
      trendMap.set(item.date, {
        date: item.date,
        tasksCompleted: item.tasksCompleted,
        attendancePresentEquivalent: 0,
      });
    }
  }

  return {
    summary: {
      employees: overview.totalEmployees,
      totalTasks: overview.totalTasks,
      completedTasks: overview.completedTasks,
      taskCompletionRate: taskPerformance.taskCompletionRate,
      attendancePercentage: overview.averageAttendance,
    },
    leaderboard: ranking.rankings,
    trends: Array.from(trendMap.values()).sort((left, right) => left.date.localeCompare(right.date)),
  };
}

export const getTeamOverviewAnalytics = async (req, res, next) => {
  try {
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await getTeamOverviewData(employeeIds, getLastThirtyDaysRange());
    return sendResponse(res, 200, { success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTaskPerformanceAnalytics = async (req, res, next) => {
  try {
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await getTaskPerformanceData(employeeIds, getPeriodRange(req.query.year, req.query.month));
    return sendResponse(res, 200, { success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceTrendAnalytics = async (req, res, next) => {
  try {
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await getAttendanceTrendData(employeeIds);
    return sendResponse(res, 200, { success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPerformanceRankingAnalytics = async (req, res, next) => {
  try {
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await getPerformanceRankingData(employeeIds, getPeriodRange(req.query.year, req.query.month));
    return sendResponse(res, 200, { success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWorkloadAnalytics = async (req, res, next) => {
  try {
    const employeeIds = await getManagerScopedEmployeeIds(req.user.id);
    const data = await getWorkloadData(employeeIds);
    return sendResponse(res, 200, { success: true, data });
  } catch (error) {
    next(error);
  }
};

async function getTeamOverviewData(employeeIds, { start, end }) {
  const teamMemberIds = employeeIds.map((item) => new Types.ObjectId(item));

  const [taskStats, attendanceStats, totalLeaves] = await Promise.all([
    Task.aggregate([
      { $match: { assignedTo: { $in: teamMemberIds } } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]),
    Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: teamMemberIds },
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentEquivalent: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $in: ['$status', ['present', 'late']] }, then: 1 },
                  { case: { $eq: ['$status', 'half-day'] }, then: 0.5 },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ]),
    Leave.countDocuments({
      employeeId: { $in: teamMemberIds },
      createdAt: { $gte: start, $lte: end },
    }),
  ]);

  const taskSummary = taskStats[0] || { totalTasks: 0, completedTasks: 0, pendingTasks: 0 };
  const attendanceSummary = attendanceStats[0] || { totalRecords: 0, presentEquivalent: 0 };

  return {
    totalEmployees: teamMemberIds.length,
    totalTasks: taskSummary.totalTasks,
    completedTasks: taskSummary.completedTasks,
    pendingTasks: taskSummary.pendingTasks,
    averageAttendance: calculateAttendanceRate(attendanceSummary.presentEquivalent, attendanceSummary.totalRecords),
    totalLeaves,
  };
}

async function getTaskPerformanceData(employeeIds, { start, end }) {
  const teamMemberIds = employeeIds.map((item) => new Types.ObjectId(item));
  const employeeLookup = await getEmployeeLookupMap(teamMemberIds);

  const [taskRows, completionTimeline] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          assignedTo: { $in: teamMemberIds },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]),
    Task.aggregate([
      {
        $match: {
          assignedTo: { $in: teamMemberIds },
          status: 'completed',
          updatedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt',
            },
          },
          tasksCompleted: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const perEmployee = taskRows.map((row) => ({
    employee: employeeLookup.get(row._id.toString()) || {
      _id: row._id,
      firstName: 'Unknown',
      lastName: '',
      email: '',
      designation: '',
      department: '',
    },
    completed: row.completed,
    pending: row.pending,
    total: row.total,
  }));

  const totalTasks = perEmployee.reduce((sum, row) => sum + row.total, 0);
  const totalCompleted = perEmployee.reduce((sum, row) => sum + row.completed, 0);
  const totalPending = perEmployee.reduce((sum, row) => sum + row.pending, 0);

  return {
    tasksCompletedPerEmployee: perEmployee.map((row) => ({
      employee: row.employee,
      value: row.completed,
    })),
    tasksPendingPerEmployee: perEmployee.map((row) => ({
      employee: row.employee,
      value: row.pending,
    })),
    taskCompletionRate: totalTasks ? totalCompleted / totalTasks : 0,
    totals: {
      completed: totalCompleted,
      pending: totalPending,
      total: totalTasks,
    },
    completionTimeline: completionTimeline.map((item) => ({
      date: item._id,
      tasksCompleted: item.tasksCompleted,
    })),
  };
}

async function getAttendanceTrendData(employeeIds) {
  const teamMemberIds = employeeIds.map((item) => new Types.ObjectId(item));
  const { start, end } = getLastThirtyDaysRange();

  const rows = await Attendance.aggregate([
    {
      $match: {
        employeeId: { $in: teamMemberIds },
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
          },
        },
        presentCount: {
          $sum: {
            $cond: [{ $in: ['$status', ['present', 'late', 'half-day']] }, 1, 0],
          },
        },
        absentCount: {
          $sum: {
            $cond: [{ $in: ['$status', ['absent', 'on-leave']] }, 1, 0],
          },
        },
        presentEquivalent: {
          $sum: {
            $switch: {
              branches: [
                { case: { $in: ['$status', ['present', 'late']] }, then: 1 },
                { case: { $eq: ['$status', 'half-day'] }, then: 0.5 },
              ],
              default: 0,
            },
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trendMap = new Map(
    rows.map((item) => [
      item._id,
      {
        date: item._id,
        presentCount: item.presentCount,
        absentCount: item.absentCount,
        presentEquivalent: item.presentEquivalent,
      },
    ]),
  );

  const trends = [];
  for (let index = 0; index < 30; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    trends.push(
      trendMap.get(key) || {
        date: key,
        presentCount: 0,
        absentCount: 0,
        presentEquivalent: 0,
      },
    );
  }

  return { trends };
}

async function getPerformanceRankingData(employeeIds, { start, end }) {
  const teamMemberIds = employeeIds.map((item) => new Types.ObjectId(item));
  const employeeLookup = await getEmployeeLookupMap(teamMemberIds);

  const [taskRows, attendanceRows] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          assignedTo: { $in: teamMemberIds },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]),
    Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: teamMemberIds },
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$employeeId',
          total: { $sum: 1 },
          presentEquivalent: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $in: ['$status', ['present', 'late']] }, then: 1 },
                  { case: { $eq: ['$status', 'half-day'] }, then: 0.5 },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ]),
  ]);

  const taskMap = new Map(taskRows.map((row) => [row._id.toString(), row]));
  const attendanceMap = new Map(attendanceRows.map((row) => [row._id.toString(), row]));

  const rankings = teamMemberIds.map((employeeId) => {
    const taskStats = taskMap.get(employeeId.toString()) || { completed: 0, total: 0 };
    const attendanceStats = attendanceMap.get(employeeId.toString()) || { presentEquivalent: 0, total: 0 };
    const taskCompletionRate = taskStats.total ? taskStats.completed / taskStats.total : 0;
    const attendancePercentage = calculateAttendanceRate(attendanceStats.presentEquivalent, attendanceStats.total);
    const score = (taskCompletionRate * 0.65) + (attendancePercentage * 0.35);

    return {
      employee: employeeLookup.get(employeeId.toString()),
      taskCompletionRate,
      attendancePercentage,
      score,
    };
  })
    .filter((item) => Boolean(item.employee))
    .sort((left, right) => right.score - left.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return { rankings };
}

async function getWorkloadData(employeeIds) {
  const teamMemberIds = employeeIds.map((item) => new Types.ObjectId(item));
  const employeeLookup = await getEmployeeLookupMap(teamMemberIds);

  const rows = await Task.aggregate([
    { $match: { assignedTo: { $in: teamMemberIds } } },
    {
      $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        activeTasks: {
          $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { totalTasks: -1 } },
  ]);

  return {
    workload: rows.map((row) => ({
      employee: employeeLookup.get(row._id.toString()),
      totalTasks: row.totalTasks,
      completedTasks: row.completedTasks,
      activeTasks: row.activeTasks,
    })),
  };
}
