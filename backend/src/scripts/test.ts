import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Class from '../models/Class.model.js';
import Subject from '../models/Subject.model.js';
import Admission from '../models/Admission.model.js';
import Fee from '../models/Fee.model.js';
import Exam from '../models/Exam.model.js';
import ExamResult from '../models/ExamResult.model.js';
import Assignment from '../models/Assignment.model.js';
import Attendance from '../models/Attendance.model.js';
import FeeCollection from '../models/FeeCollection.model.js';
import Branch from '../models/Branch.model.js';

dotenv.config();

const testDatabase = async (): Promise<void> => {
  try {
    console.log('🧪 Starting Backend Tests...\n');

    // Connect to database
    await connectDB();
    console.log('✓ Database connection successful\n');

    // Test 1: Check User collection
    console.log('Test 1: Checking Users...');
    const userCount = await User.countDocuments();
    console.log(`   ✓ Found ${userCount} users`);
    if (userCount === 0) {
      console.log('   ⚠️  No users found. Please run seed script first.');
    } else {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        console.log(`   ✓ Admin user found: ${adminUser.username}`);
      }
    }

    // Test 2: Check Student collection
    console.log('\nTest 2: Checking Students...');
    const studentCount = await Student.countDocuments();
    console.log(`   ✓ Found ${studentCount} students`);

    // Test 3: Check Teacher collection
    console.log('\nTest 3: Checking Teachers...');
    const teacherCount = await Teacher.countDocuments();
    console.log(`   ✓ Found ${teacherCount} teachers`);

    // Test 4: Check Class collection
    console.log('\nTest 4: Checking Classes...');
    const classCount = await Class.countDocuments();
    console.log(`   ✓ Found ${classCount} classes`);

    // Test 5: Check Subject collection
    console.log('\nTest 5: Checking Subjects...');
    const subjectCount = await Subject.countDocuments();
    console.log(`   ✓ Found ${subjectCount} subjects`);

    // Test 6: Check Admission collection
    console.log('\nTest 6: Checking Admissions...');
    const admissionCount = await Admission.countDocuments();
    console.log(`   ✓ Found ${admissionCount} admission applications`);

    // Test 7: Check Fee collection
    console.log('\nTest 7: Checking Fees...');
    const feeCount = await Fee.countDocuments();
    console.log(`   ✓ Found ${feeCount} fee structures`);

    // Test 8: Check Exam collection
    console.log('\nTest 8: Checking Exams...');
    const examCount = await Exam.countDocuments();
    console.log(`   ✓ Found ${examCount} exams`);

    // Test 9: Check ExamResult collection
    console.log('\nTest 9: Checking Exam Results...');
    const examResultCount = await ExamResult.countDocuments();
    console.log(`   ✓ Found ${examResultCount} exam results`);

    // Test 10: Check Assignment collection
    console.log('\nTest 10: Checking Assignments...');
    const assignmentCount = await Assignment.countDocuments();
    console.log(`   ✓ Found ${assignmentCount} assignments`);

    // Test 11: Check Attendance collection
    console.log('\nTest 11: Checking Attendance...');
    const attendanceCount = await Attendance.countDocuments();
    console.log(`   ✓ Found ${attendanceCount} attendance records`);

    // Test 12: Check FeeCollection collection
    console.log('\nTest 12: Checking Fee Collections...');
    const feeCollectionCount = await FeeCollection.countDocuments();
    console.log(`   ✓ Found ${feeCollectionCount} fee collections`);

    // Test 13: Check Branch collection
    console.log('\nTest 13: Checking Branches...');
    const branchCount = await Branch.countDocuments();
    console.log(`   ✓ Found ${branchCount} branches`);

    // Test 14: Test User Authentication
    console.log('\nTest 14: Testing User Authentication...');
    const testUser = await User.findOne({ username: 'admin' }).select('+password');
    if (testUser) {
      const isPasswordValid = await testUser.comparePassword('admin123');
      if (isPasswordValid) {
        console.log('   ✓ Password authentication working');
      } else {
        console.log('   ✗ Password authentication failed');
      }
    } else {
      console.log('   ⚠️  Test user not found');
    }

    // Test 15: Test Relationships
    console.log('\nTest 15: Testing Model Relationships...');
    const studentWithUser = await Student.findOne().populate('userId');
    if (studentWithUser && studentWithUser.userId) {
      console.log('   ✓ Student-User relationship working');
    } else {
      console.log('   ⚠️  No student with user relationship found');
    }

    const teacherWithUser = await Teacher.findOne().populate('userId');
    if (teacherWithUser && teacherWithUser.userId) {
      console.log('   ✓ Teacher-User relationship working');
    } else {
      console.log('   ⚠️  No teacher with user relationship found');
    }

    // Note: Class model no longer has a teacher field
    // Teacher assignments are now handled through Subject model
    const classCountCheck = await Class.countDocuments();
    if (classCountCheck > 0) {
      console.log(`   ✓ Found ${classCountCheck} classes`);
    } else {
      console.log('   ⚠️  No classes found');
    }

    // Test 16: Database Name
    console.log('\nTest 16: Verifying Database Name...');
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      console.log(`   ✓ Connected to database: ${dbName}`);
      if (dbName === 'school12') {
        console.log('   ✓ Database name is correct');
      } else {
        console.log(`   ⚠️  Database name is ${dbName}, expected 'school12'`);
      }
    } else {
      console.log('   ⚠️  Database connection not available');
    }

    console.log('\n✅ All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Students: ${studentCount}`);
    console.log(`   - Teachers: ${teacherCount}`);
    console.log(`   - Classes: ${classCount}`);
    console.log(`   - Subjects: ${subjectCount}`);
    console.log(`   - Admissions: ${admissionCount}`);
    console.log(`   - Fees: ${feeCount}`);
    console.log(`   - Exams: ${examCount}`);
    console.log(`   - Exam Results: ${examResultCount}`);
    console.log(`   - Assignments: ${assignmentCount}`);
    console.log(`   - Attendance: ${attendanceCount}`);
    console.log(`   - Fee Collections: ${feeCollectionCount}`);
    console.log(`   - Branches: ${branchCount}`);

    if (userCount === 0) {
      console.log('\n⚠️  WARNING: No data found. Please run: npm run seed');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

testDatabase();

