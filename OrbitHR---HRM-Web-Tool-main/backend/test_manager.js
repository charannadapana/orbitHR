import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Employee from './src/models/Employee.js';

dotenv.config();

const createTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Make sure we have a manager
    let managerUser = await User.findOne({ email: 'manager@orbithr.com' });
    if (!managerUser) {
      managerUser = await User.create({
        firstName: 'Mark',
        lastName: 'Manager',
        email: 'manager@orbithr.com',
        password: 'password123',
        role: 'manager',
      });
      console.log('Created manager user');
    }

    let managerEmp = await Employee.findOne({ userId: managerUser._id });
    if (!managerEmp) {
      managerEmp = await Employee.create({
        userId: managerUser._id,
        employeeId: 'EMP-MGR-001',
        designation: 'Engineering Manager',
        department: 'Engineering',
        dateOfJoining: new Date(),
        email: 'manager@orbithr.com',
        salary: 120000,
        address: '123 Manager St',
      });
      console.log('Created manager employee');
    }

    // Assign existing employee to manager
    const empUser = await User.findOne({ email: 'employee@orbithr.com' });
    if (empUser) {
      const emp = await Employee.findOne({ userId: empUser._id });
      if (emp) {
        emp.reportingTo = managerEmp._id;
        await emp.save();
        console.log('Assigned existing employee to manager');
      }
    } else {
      // Create one
      const newEmpUser = await User.create({
        firstName: 'Eddie',
        lastName: 'Employee',
        email: 'employee@orbithr.com',
        password: 'password123',
        role: 'employee',
      });
      await Employee.create({
        userId: newEmpUser._id,
        employeeId: 'EMP-001',
        designation: 'Software Engineer',
        department: 'Engineering',
        dateOfJoining: new Date(),
        email: 'employee@orbithr.com',
        salary: 80000,
        address: '123 Employee St',
        reportingTo: managerEmp._id,
      });
      console.log('Created and assigned new employee to manager');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createTestData();
