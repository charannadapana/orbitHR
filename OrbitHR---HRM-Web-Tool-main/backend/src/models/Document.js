import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: false } }
);

documentSchema.index({ employeeId: 1, uploadedAt: -1 });

export default mongoose.model('Document', documentSchema);
