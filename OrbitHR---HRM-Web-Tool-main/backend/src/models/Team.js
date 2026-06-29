import mongoose from 'mongoose';
import { PREDEFINED_TEAMS } from '../constants/teams.js';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: PREDEFINED_TEAMS,
      required: [true, 'Please provide a team name'],
      unique: true,
      trim: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);
