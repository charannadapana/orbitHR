import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please provide the announcement message'],
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'event'],
      default: 'info',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
