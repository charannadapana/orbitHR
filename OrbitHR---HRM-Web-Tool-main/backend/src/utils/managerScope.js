import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import Team from '../models/Team.js';

const { Types } = mongoose;

export async function getManagerVisibleEmployeeIds(managerUserId, roles = ['employee']) {
  const managedTeam = await Team.findOne({ managerId: managerUserId }).select('members');
  if (managedTeam?.members?.length) {
    return managedTeam.members.map((memberId) => new Types.ObjectId(memberId));
  }

  const managerProfile = await Employee.findOne({ userId: managerUserId }).select('_id');

  if (managerProfile) {
    const directReports = await Employee.find({ reportingTo: managerProfile._id }).select('_id');
    if (directReports.length > 0) {
      return directReports.map((employee) => employee._id);
    }
  }

  const visibleEmployees = await Employee.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $match: {
        'user.role': { $in: roles },
        userId: { $ne: new Types.ObjectId(managerUserId) },
      },
    },
    { $project: { _id: 1 } },
  ]);

  return visibleEmployees.map((employee) => employee._id);
}
