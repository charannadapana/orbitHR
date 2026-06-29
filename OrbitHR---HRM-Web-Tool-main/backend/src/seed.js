import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Leave from './models/Leave.js';
import Skill from './models/Skill.js';
import EmployeeSkill from './models/EmployeeSkill.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const SEED_PASSWORD = 'user123';

const skillsMaster = [
  { name: 'React', category: 'Technical', description: 'Frontend library' },
  { name: 'Node.js', category: 'Technical', description: 'Backend runtime' },
  { name: 'MongoDB', category: 'Technical', description: 'NoSQL Database' },
  { name: 'Figma', category: 'Design', description: 'UI/UX Design tool' },
  { name: 'Project Management', category: 'Management', description: 'Leadership & Planning' },
  { name: 'Communications', category: 'Soft Skills', description: 'Verbal & Written' },
];

const announcements = [
  {
    title: 'OrbitHR Portal Launch',
    message: 'Welcome to the brand new OrbitHR HRM system. Explore your new glassmorphic dashboard!',
    type: 'success',
  },
  {
    title: 'Quarterly Review Schedule',
    message: 'All departments are requested to finalize their performance metrics by Friday.',
    type: 'event',
  },
];

const employeesData = [
  {
    email: 'sarah.chen@orbithr.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    designation: 'Lead Engineer',
    department: 'Engineering',
    employmentType: 'full-time',
    salary: 120000,
  },
  {
    email: 'michael.ross@orbithr.com',
    firstName: 'Michael',
    lastName: 'Ross',
    designation: 'Senior Designer',
    department: 'Design',
    employmentType: 'full-time',
    salary: 95000,
  },
  {
    email: 'jesscia.pearson@orbithr.com',
    firstName: 'Jessica',
    lastName: 'Pearson',
    designation: 'Managing Director',
    department: 'Management',
    employmentType: 'full-time',
    salary: 180000,
  },
  {
    email: 'harvey.specter@orbithr.com',
    firstName: 'Harvey',
    lastName: 'Specter',
    designation: 'Legal Counsel',
    department: 'Legal',
    employmentType: 'full-time',
    salary: 150000,
  },
  {
    email: 'louis.litt@orbithr.com',
    firstName: 'Louis',
    lastName: 'Litt',
    designation: 'Finance Head',
    department: 'Finance',
    employmentType: 'full-time',
    salary: 140000,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI.trim().replace(/[\r\n\t]/g, '');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear All Collections
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Skill.deleteMany({}),
      EmployeeSkill.deleteMany({}),
      Announcement.deleteMany({}),
    ]);
    console.log('[Seed] Cleared all existing collections');

    // 1. Seed System Admin
    const adminUser = await User.create({
      email: 'admin@orbithr.com',
      firstName: 'System',
      lastName: 'Admin',
      password: SEED_PASSWORD,
      role: 'admin',
    });
    console.log('[Seed] Admin user created');

    // 2. Seed Skills
    const seededSkills = await Skill.insertMany(skillsMaster);
    console.log(`[Seed] ${seededSkills.length} skills seeded`);

    // 3. Seed Announcements
    await Announcement.insertMany(announcements.map(a => ({ ...a, createdBy: adminUser._id })));
    console.log('[Seed] Announcements seeded');

    // 4. Seed Employees
    const createdEmployees = [];
    for (const emp of employeesData) {
      // Create User
      const user = await User.create({
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        password: SEED_PASSWORD,
        role: 'employee',
      });

      // Create Employee Profile
      const employee = await Employee.create({
        userId: user._id,
        email: emp.email,
        designation: emp.designation,
        department: emp.department,
        dateOfJoining: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)),
        employmentType: emp.employmentType,
        salary: emp.salary,
        status: 'active',
      });
      createdEmployees.push({ user, employee });

      // Seed EmployeeSkill (Randomly assign 2-3 skills)
      const shuffledSkills = [...seededSkills].sort(() => 0.5 - Math.random());
      const empSkills = shuffledSkills.slice(0, 3).map(skill => ({
        employeeId: employee._id,
        userId: user._id,
        skillId: skill._id,
        proficiencyLevel: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
        yearsOfExperience: Math.floor(Math.random() * 5) + 1,
      }));
      await EmployeeSkill.insertMany(empSkills);
    }
    console.log(`[Seed] ${createdEmployees.length} employee profiles seeded`);

    // 5. Seed Attendance (Last 7 days)
    const attendanceRecords = [];
    const statuses = ['present', 'present', 'present', 'late', 'absent', 'present']; // Weighting towards present
    
    for (const { user, employee } of createdEmployees) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        attendanceRecords.push({
          employeeId: employee._id,
          userId: user._id,
          date,
          status,
          checkInTime: status !== 'absent' ? '09:00 AM' : null,
          checkOutTime: status !== 'absent' ? '05:00 PM' : null,
          workingHours: status !== 'absent' ? 8 : 0,
          markedBy: adminUser._id,
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`[Seed] ${attendanceRecords.length} attendance records seeded`);

    // 6. Seed Leaves
    const leaveReasons = ['General checkup', 'Family event', 'Moving house', 'Personal errant'];
    const sampleLeaves = createdEmployees.slice(0, 3).map(({ user, employee }, idx) => ({
      employeeId: employee._id,
      userId: user._id,
      leaveType: idx === 0 ? 'sick' : 'casual',
      startDate: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + (idx + 2) * 24 * 60 * 60 * 1000),
      daysCount: 1,
      reason: leaveReasons[idx],
      status: idx === 0 ? 'approved' : 'pending',
    }));
    await Leave.insertMany(sampleLeaves);
    console.log('[Seed] Sample leaves seeded');

    console.log('\n--- Test Credentials ---');
    console.log('Admin: admin@orbithr.com / ' + SEED_PASSWORD);
    console.log('Employee Sample: ' + employeesData[0].email + ' / ' + SEED_PASSWORD);
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedDB();
