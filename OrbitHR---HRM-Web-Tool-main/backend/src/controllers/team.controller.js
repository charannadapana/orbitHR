import Employee from '../models/Employee.js';
import JoinRequest from '../models/JoinRequest.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { PREDEFINED_TEAMS } from '../constants/teams.js';
import { sendError, sendResponse } from '../utils/response.js';

const TEAM_POPULATE = [
  { path: 'managerId', select: 'firstName lastName email role teamId' },
  {
    path: 'members',
    populate: [
      { path: 'userId', select: 'firstName lastName email role teamId' },
      { path: 'teamId', select: 'name managerId' },
    ],
  },
];

const JOIN_REQUEST_POPULATE = [
  {
    path: 'employeeId',
    populate: [
      { path: 'userId', select: 'firstName lastName email role teamId' },
      { path: 'teamId', select: 'name managerId' },
    ],
  },
  { path: 'teamId', populate: { path: 'managerId', select: 'firstName lastName email role' } },
  { path: 'reviewedBy', select: 'firstName lastName email role' },
];

async function getManagedTeamForUser(userId) {
  return Team.findOne({ managerId: userId });
}

async function getManagerEmployeeProfile(userId) {
  return Employee.findOne({ userId }).select('_id');
}

export const getPredefinedTeams = async (req, res, next) => {
  try {
    const existingTeams = await Team.find({ name: { $in: PREDEFINED_TEAMS } }).select('name managerId');
    const teamMap = new Map(existingTeams.map((team) => [team.name, team]));

    const options = PREDEFINED_TEAMS.map((name) => {
      const existing = teamMap.get(name);
      return {
        name,
        teamId: existing?._id || null,
        hasManager: Boolean(existing?.managerId),
      };
    });

    return sendResponse(res, 200, {
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate(TEAM_POPULATE)
      .sort({ name: 1 });

    return sendResponse(res, 200, {
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyManagedTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({ managerId: req.user.id }).populate(TEAM_POPULATE);

    if (!team) {
      return sendResponse(res, 200, {
        success: true,
        data: {
          name: null,
          managerId: req.user.id,
          members: [],
          pendingRequests: [],
        },
      });
    }

    const pendingRequests = await JoinRequest.find({ teamId: team._id, status: 'pending' })
      .populate(JOIN_REQUEST_POPULATE)
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: {
        ...team.toObject(),
        pendingRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTeamInfo = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id }).select('_id teamId');
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    const [team, pendingRequest] = await Promise.all([
      employee.teamId
        ? Team.findById(employee.teamId).populate([
            { path: 'managerId', select: 'firstName lastName email role' },
            { path: 'members', populate: { path: 'userId', select: 'firstName lastName email role' } },
          ])
        : null,
      JoinRequest.findOne({ employeeId: employee._id, status: 'pending' })
        .populate(JOIN_REQUEST_POPULATE)
        .sort({ createdAt: -1 }),
    ]);

    return sendResponse(res, 200, {
      success: true,
      data: {
        team,
        joinRequest: pendingRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createJoinRequest = async (req, res, next) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return sendError(res, 400, 'Please select a team');
    }

    const employee = await Employee.findOne({ userId: req.user.id }).select('_id teamId reportingTo');
    if (!employee) {
      return sendError(res, 404, 'Employee record not found');
    }

    if (employee.teamId) {
      return sendError(res, 400, 'You are already assigned to a team');
    }

    const team = await Team.findById(teamId).populate('managerId', 'firstName lastName email role');
    if (!team || !team.managerId) {
      return sendError(res, 404, 'Selected team is not available yet');
    }

    const existingPending = await JoinRequest.findOne({
      employeeId: employee._id,
      status: 'pending',
    });

    if (existingPending) {
      return sendError(res, 400, 'You already have a pending team request');
    }

    const request = await JoinRequest.create({
      employeeId: employee._id,
      teamId,
      status: 'pending',
    });

    const populatedRequest = await JoinRequest.findById(request._id).populate(JOIN_REQUEST_POPULATE);

    return sendResponse(res, 201, {
      success: true,
      message: 'Join request submitted successfully',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerJoinRequests = async (req, res, next) => {
  try {
    const team = await getManagedTeamForUser(req.user.id);
    if (!team) {
      return sendResponse(res, 200, {
        success: true,
        data: [],
      });
    }

    const requests = await JoinRequest.find({ teamId: team._id })
      .populate(JOIN_REQUEST_POPULATE)
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, {
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewJoinRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 400, 'Status must be approved or rejected');
    }

    const request = await JoinRequest.findById(id).populate(JOIN_REQUEST_POPULATE);
    if (!request) {
      return sendError(res, 404, 'Join request not found');
    }

    if (request.status !== 'pending') {
      return sendError(res, 400, 'This request has already been processed');
    }

    if (req.user.role === 'manager') {
      const team = await getManagedTeamForUser(req.user.id);
      if (!team || team._id.toString() !== request.teamId._id.toString()) {
        return sendError(res, 403, 'Not authorized to review this join request');
      }
    }

    if (status === 'approved') {
      const [employee, team, managerProfile] = await Promise.all([
        Employee.findById(request.employeeId._id),
        Team.findById(request.teamId._id),
        getManagerEmployeeProfile(request.teamId.managerId?._id || req.user.id),
      ]);

      if (!employee || !team) {
        return sendError(res, 404, 'Employee or team record no longer exists');
      }

      if (employee.teamId && employee.teamId.toString() !== team._id.toString()) {
        return sendError(res, 400, 'This employee is already assigned to another team');
      }

      employee.teamId = team._id;
      employee.department = team.name;
      if (managerProfile?._id) {
        employee.reportingTo = managerProfile._id;
      }
      await employee.save();

      await User.findByIdAndUpdate(employee.userId, { teamId: team._id });
      await Team.findByIdAndUpdate(team._id, { $addToSet: { members: employee._id } });
      await JoinRequest.updateMany(
        {
          employeeId: employee._id,
          status: 'pending',
          _id: { $ne: request._id },
        },
        {
          $set: {
            status: 'rejected',
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
          },
        }
      );
    }

    request.status = status;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    const updated = await JoinRequest.findById(request._id).populate(JOIN_REQUEST_POPULATE);

    return sendResponse(res, 200, {
      success: true,
      message: `Join request ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
