import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Employee from './src/models/Employee.js';
import Skill from './src/models/Skill.js';
import EmployeeSkill from './src/models/EmployeeSkill.js';
import Announcement from './src/models/Announcement.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/orbithr";
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    
    // Clear existing data
    await User.deleteMany();
    await Employee.deleteMany();
    await Skill.deleteMany();
    await EmployeeSkill.deleteMany();
    await Announcement.deleteMany();
    
    // 1. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@orbithr.com',
      password: hashedPassword,
      role: 'admin',
    });

    // 2. Create Employee User
    const employeeUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@orbithr.com',
      password: hashedPassword,
      role: 'employee',
    });

    // 3. Create Employee Profile
    const employee = await Employee.create({
      userId: employeeUser._id,
      designation: 'Senior Developer',
      department: 'Engineering',
      email: 'employee@orbithr.com',
      phoneNumber: '+1987654321',
      dateOfJoining: new Date('2023-01-15'),
      employmentType: 'full-time',
      salary: 120000,
      status: 'active'
    });

    // 4. Create Skills
    const skill1 = await Skill.create({ name: 'React', category: 'Frontend', description: 'React JS' });
    const skill2 = await Skill.create({ name: 'Node.js', category: 'Backend', description: 'Node JS' });
    
    // 5. Assign Skills to Employee
    await EmployeeSkill.create({
      employeeId: employee._id,
      skillId: skill1._id,
      proficiencyLevel: 4,
      experienceYears: 3
    });
    
    await EmployeeSkill.create({
      employeeId: employee._id,
      skillId: skill2._id,
      proficiencyLevel: 3,
      experienceYears: 2
    });

    // 6. Create Announcements
    await Announcement.create({
      title: 'Company Town Hall',
      message: 'Join us for the monthly town hall on Friday.',
      type: 'info',
      createdBy: admin._id
    });

    await Announcement.create({
      title: 'Performance Reviews',
      message: 'Q1 Performance reviews are starting next week. Please complete your self-assessments.',
      type: 'warning',
      createdBy: admin._id
    });

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
