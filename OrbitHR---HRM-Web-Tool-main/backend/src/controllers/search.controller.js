import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';
import { sendResponse } from '../utils/response.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const search = q.trim();

    if (!search) {
      return sendResponse(res, 200, {
        success: true,
        data: {
          employees: [],
          tasks: [],
          departments: [],
        },
      });
    }

    let employeeFilter = {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ],
    };

    const employeeProfile = req.user.role === 'employee'
      ? await Employee.findOne({ userId: req.user.id }).select('_id')
      : null;

    if (req.user.role === 'manager') {
      const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
      employeeFilter = { ...employeeFilter, _id: { $in: visibleIds } };
    } else if (req.user.role === 'employee') {
      employeeFilter = { ...employeeFilter, _id: { $in: employeeProfile ? [employeeProfile._id] : [] } };
    }

    const taskFilter =
      req.user.role === 'employee'
        ? {
            assignedTo: employeeProfile?._id || null,
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          }
        : {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          };

    const [employees, tasks, departmentAgg] = await Promise.all([
      Employee.find(employeeFilter)
        .populate('userId', 'firstName lastName email role')
        .limit(8)
        .sort({ createdAt: -1 }),
      Task.find(taskFilter)
        .populate('assignedTo', 'email designation department')
        .limit(8)
        .sort({ createdAt: -1 }),
      Employee.aggregate([
        { $match: { department: { $regex: search, $options: 'i' } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    return sendResponse(res, 200, {
      success: true,
      data: {
        employees,
        tasks,
        departments: departmentAgg.map((item) => ({ name: item._id, count: item.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};
