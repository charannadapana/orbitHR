import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

const TASK_STATUS = ['pending', 'in-progress', 'completed'];
const TASK_PRIORITY = ['low', 'medium', 'high'];

async function getTaskWithRelations(taskId) {
  return Task.findById(taskId)
    .populate('assignedTo', 'email designation department userId')
    .populate('assignedBy', 'firstName lastName email');
}

async function canManagerAccessEmployee(managerId, employeeId) {
  const visibleIds = await getManagerVisibleEmployeeIds(managerId, ['employee', 'manager']);
  return visibleIds.some((visibleEmployeeId) => visibleEmployeeId.toString() === employeeId.toString());
}

export const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate, priority = 'medium' } = req.body;
    
    if (!title || !assignedTo || !dueDate) {
      return sendError(res, 400, 'Please provide all required fields');
    }

    if (!TASK_PRIORITY.includes(priority)) {
      return sendError(res, 400, 'Priority must be low, medium, or high');
    }

    const employee = await Employee.findById(assignedTo).populate('userId', 'email firstName lastName role');
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    if (employee.userId?.role === 'admin') {
      return sendError(res, 400, 'Tasks cannot be assigned to admin accounts');
    }

    if (req.user.role === 'manager') {
      const canAssign = await canManagerAccessEmployee(req.user.id, assignedTo);
      if (!canAssign) {
        return sendError(res, 403, 'You can only assign tasks to employees in your visibility scope');
      }
    }

    if (req.user.role !== 'admin' && employee.userId?.role !== 'employee') {
      return sendError(res, 403, 'You can only assign tasks to employees who report to you');
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      priority,
      dueDate,
    });

    await task.populate('assignedTo', 'email designation department');
    await task.populate('assignedBy', 'firstName lastName');

    await Notification.create({
      recipient: employee.userId._id,
      type: 'task',
      title: `New ${priority} priority task assigned`,
      message: `${title} is due on ${new Date(dueDate).toLocaleDateString()}.`,
      metadata: {
        taskId: task._id,
        priority,
        assignedBy: req.user.id,
      },
    });

    return sendResponse(res, 201, {
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    if (req.user.role === 'manager') {
      return getManagerTasks(req, res, next);
    }

    if (req.user.role === 'employee') {
      return getEmployeeTasks(req, res, next);
    }

    const { status, priority, assignedTo, assignedBy, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedBy) filter.assignedBy = assignedBy;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'email designation department')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    const filter = { assignedBy: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'email designation department')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const summary = {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === 'pending').length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
      completionRate: tasks.length ? Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100) : 0,
    };

    return sendResponse(res, 200, {
      success: true,
      data: tasks,
      meta: { summary },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const filter = { assignedTo: employee._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'email designation department')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const isAssignedEmployee = await Employee.findOne({ userId: req.user.id, _id: task.assignedTo }).select('_id');
    const isManager = task.assignedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    const isEmployee = req.user.role === 'employee';

    if (isEmployee) {
      const allowedFields = ['status'];
      const incomingFields = Object.keys(req.body);

      if (!isAssignedEmployee) {
        return sendError(res, 403, 'You can only update your own assigned tasks');
      }

      if (!incomingFields.length || incomingFields.some((field) => !allowedFields.includes(field))) {
        return sendError(res, 403, 'Employees can only update task status');
      }

      if (!TASK_STATUS.includes(req.body.status)) {
        return sendError(res, 400, 'Invalid status');
      }

      task.status = req.body.status;
      await task.save();
    } else {
      if (!isManager && !isAdmin) {
        return sendError(res, 403, 'Not authorized to update this task');
      }

      const { title, description, dueDate, priority, assignedTo, status } = req.body;

      if (title !== undefined) {
        if (!String(title).trim()) {
          return sendError(res, 400, 'Title cannot be empty');
        }
        task.title = String(title).trim();
      }

      if (description !== undefined) {
        task.description = description;
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate;
      }

      if (priority !== undefined) {
        if (!TASK_PRIORITY.includes(priority)) {
          return sendError(res, 400, 'Priority must be low, medium, or high');
        }
        task.priority = priority;
      }

      if (status !== undefined) {
        if (!TASK_STATUS.includes(status)) {
          return sendError(res, 400, 'Invalid status');
        }
        task.status = status;
      }

      if (assignedTo !== undefined && assignedTo !== task.assignedTo.toString()) {
        const employee = await Employee.findById(assignedTo).populate('userId', 'role');
        if (!employee) {
          return sendError(res, 404, 'Employee not found');
        }

        if (req.user.role === 'manager') {
          const canAssign = await canManagerAccessEmployee(req.user.id, assignedTo);
          if (!canAssign) {
            return sendError(res, 403, 'You can only reassign tasks within your team');
          }
        }

        if (!isAdmin && employee.userId?.role !== 'employee') {
          return sendError(res, 403, 'Tasks can only be assigned to employee accounts');
        }

        task.assignedTo = employee._id;
      }

      await task.save();
    }

    const populatedTask = await getTaskWithRelations(task._id);

    if (populatedTask?.assignedBy?._id && req.user.role === 'employee') {
      await Notification.create({
        recipient: populatedTask.assignedBy._id,
        type: 'task',
        title: 'Task status updated',
        message: `${populatedTask.title} is now marked as ${populatedTask.status}.`,
        metadata: {
          taskId: populatedTask._id,
          status: populatedTask.status,
        },
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: 'Task updated successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = (req, res, next) => updateTask(req, res, next);

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const isManager = task.assignedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isManager && !isAdmin) {
      return sendError(res, 403, 'Not authorized to delete this task');
    }

    await task.deleteOne();

    return sendResponse(res, 200, {
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
