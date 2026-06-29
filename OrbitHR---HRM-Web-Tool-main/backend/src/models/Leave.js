import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide an employee'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity', 'other'],
      default: 'casual',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    daysCount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide leave reason'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewComment: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Leave', leaveSchema);
