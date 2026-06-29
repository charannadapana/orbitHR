import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      required: [true, 'Please provide a status'],
    },
    checkInTime: {
      type: String,
      default: null,
    },
    checkInAt: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: String,
      default: null,
    },
    checkOutAt: {
      type: Date,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
