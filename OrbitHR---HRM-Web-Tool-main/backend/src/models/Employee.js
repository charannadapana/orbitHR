import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    designation: {
      type: String,
      required: [true, 'Please provide a designation'],
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Please provide date of joining'],
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active',
    },
    salary: {
      type: Number,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
