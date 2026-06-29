import mongoose from 'mongoose';

const employeeSkillSchema = new mongoose.Schema(
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
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Please provide a skill'],
    },
    proficiencyLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide proficiency level'],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastUsedYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

employeeSkillSchema.index({ employeeId: 1, skillId: 1 }, { unique: true });
employeeSkillSchema.index({ userId: 1, proficiencyLevel: -1 });

export default mongoose.model('EmployeeSkill', employeeSkillSchema);
