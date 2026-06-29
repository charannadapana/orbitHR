import mongoose from 'mongoose';
import { normalizeSkillName } from '../utils/skillNormalization.js';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide skill name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide skill category'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1, name: 1 });
skillSchema.index({ normalizedName: 1 }, { unique: true });

skillSchema.pre('validate', function skillPreValidate(next) {
  this.normalizedName = normalizeSkillName(this.name || '');
  next();
});

export default mongoose.model('Skill', skillSchema);
