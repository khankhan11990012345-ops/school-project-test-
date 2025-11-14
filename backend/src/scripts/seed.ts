import dotenv from 'dotenv';
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
import MasterData from '../models/MasterData.model.js';
import { IUser } from '../types/index.js';

dotenv.config();

const seedData = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting database seeding...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Admission.deleteMany({});
    await Fee.deleteMany({});
    await Exam.deleteMany({});
    await ExamResult.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});
    await FeeCollection.deleteMany({});
    await Branch.deleteMany({});
    await MasterData.deleteMany({});
    console.log('Existing data cleared.\n');

    // Seed Users
    console.log('Seeding Users...');
    const userData = [
      {
        username: 'admin',
        email: 'admin@school.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        username: 'accountant1',
        email: 'accountant@school.com',
        password: 'accountant123',
        name: 'Emma Wilson',
        role: 'accountant',
      },
    ];
    
    // Create 6 teacher users
    const teacherUserData = [
      { username: 'teacher1', email: 'teacher1@school.com', name: 'John Smith' },
      { username: 'teacher2', email: 'teacher2@school.com', name: 'Sarah Johnson' },
      { username: 'teacher3', email: 'teacher3@school.com', name: 'Michael Brown' },
      { username: 'teacher4', email: 'teacher4@school.com', name: 'Emily Davis' },
      { username: 'teacher5', email: 'teacher5@school.com', name: 'David Wilson' },
      { username: 'teacher6', email: 'teacher6@school.com', name: 'Lisa Anderson' },
    ];
    
    for (const teacherInfo of teacherUserData) {
      userData.push({
        username: teacherInfo.username,
        email: teacherInfo.email,
        password: 'teacher123',
        name: teacherInfo.name,
        role: 'teacher',
      });
    }
    
    // Create 50 student users (10 per grade × 5 grades)
    for (let grade = 1; grade <= 5; grade++) {
      for (let i = 1; i <= 10; i++) {
        const studentNum = (grade - 1) * 10 + i;
        userData.push({
          username: `student${studentNum}`,
          email: `student${studentNum}@school.com`,
          password: 'student123',
          name: `Student ${String.fromCharCode(64 + i)} Grade ${grade}`, // Student A, B, C... for each grade
          role: 'student',
        });
      }
    }
    
    const users: IUser[] = [];
    for (const userInfo of userData) {
      const user = await User.create(userInfo);
      users.push(user);
    }
    console.log(`✓ Created ${users.length} users (1 admin, 1 accountant, 6 teachers, 50 students)`);

    // Seed Master Data (Rooms)
    console.log('Seeding Master Data (Rooms)...');
    const rooms = await MasterData.insertMany([
      {
        type: 'room',
        code: 'ROM01',
        name: 'Room 101',
        data: {
          building: 'Main Building',
          floor: 1,
          capacity: 30,
          startTime: '09:00',
          endTime: '10:00',
        },
        status: 'Active',
      },
      {
        type: 'room',
        code: 'ROM02',
        name: 'Room 102',
        data: {
          building: 'Main Building',
          floor: 1,
          capacity: 25,
          startTime: '10:00',
          endTime: '11:00',
        },
        status: 'Active',
      },
      {
        type: 'room',
        code: 'ROM03',
        name: 'Room 201',
        data: {
          building: 'Main Building',
          floor: 2,
          capacity: 35,
          startTime: '11:00',
          endTime: '12:00',
        },
        status: 'Active',
      },
      {
        type: 'room',
        code: 'ROM04',
        name: 'Science Lab',
        data: {
          building: 'Science Wing',
          floor: 1,
          capacity: 20,
          startTime: '12:00',
          endTime: '13:00',
        },
        status: 'Active',
      },
      {
        type: 'room',
        code: 'ROM05',
        name: 'Computer Lab',
        data: {
          building: 'Technology Building',
          floor: 2,
          capacity: 24,
          startTime: '14:00',
          endTime: '15:00',
        },
        status: 'Active',
      },
    ]);
    console.log(`✓ Created ${rooms.length} rooms in Master Data`);

    // Seed Branches
    console.log('Seeding Branches...');
    const branches = await Branch.insertMany([
      {
        name: 'Main Campus',
        code: 'MAIN',
        address: '123 Education Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        phone: '+1-555-0101',
        email: 'main@school.com',
        principal: 'Dr. James Anderson',
        status: 'Active',
      },
      {
        name: 'North Branch',
        code: 'NORTH',
        address: '456 Learning Avenue',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        phone: '+1-555-0102',
        email: 'north@school.com',
        principal: 'Dr. Lisa Martinez',
        status: 'Active',
      },
    ]);
    console.log(`✓ Created ${branches.length} branches`);

    // Seed Subjects (5 subjects)
    console.log('Seeding Subjects...');
    const subjects = await Subject.insertMany([
      {
        name: 'Mathematics',
        code: 'MATH',
        category: 'Core',
        level: 'All Levels',
        credits: 4,
        description: 'Basic and advanced mathematics',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        status: 'Active',
      },
      {
        name: 'English',
        code: 'ENG',
        category: 'Core',
        level: 'All Levels',
        credits: 4,
        description: 'English language and literature',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        status: 'Active',
      },
      {
        name: 'Science',
        code: 'SCI',
        category: 'Core',
        level: 'All Levels',
        credits: 4,
        description: 'Physics, Chemistry, and Biology',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        status: 'Active',
      },
      {
        name: 'History',
        code: 'HIST',
        category: 'Social Studies',
        level: 'All Levels',
        credits: 3,
        description: 'World and local history',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        status: 'Active',
      },
      {
        name: 'Geography',
        code: 'GEO',
        category: 'Social Studies',
        level: 'All Levels',
        credits: 3,
        description: 'Physical and human geography',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
        status: 'Active',
      },
    ]);
    console.log(`✓ Created ${subjects.length} subjects`);

    // Seed Teachers (6 teachers - one for each subject + 1 extra)
    console.log('Seeding Teachers...');
    const teacherSubjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Mathematics']; // 6th teacher also teaches Math
    const teacherNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson'];
    const teacherEmails = ['teacher1@school.com', 'teacher2@school.com', 'teacher3@school.com', 'teacher4@school.com', 'teacher5@school.com', 'teacher6@school.com'];
    const teacherIds = ['T001', 'T002', 'T003', 'T004', 'T005', 'T006'];
    const teacherPhones = ['+1-555-1001', '+1-555-1002', '+1-555-1003', '+1-555-1004', '+1-555-1005', '+1-555-1006'];
    const teacherExperiences = ['10 years', '8 years', '12 years', '9 years', '11 years', '7 years'];
    const teacherQualifications = [
      'M.Sc Mathematics',
      'M.A English Literature',
      'Ph.D Physics',
      'M.A History',
      'M.Sc Geography',
      'M.Ed Mathematics',
    ];
    
    const teachers = [];
    for (let i = 0; i < 6; i++) {
      const teacherUser = users.find(u => u.email === teacherEmails[i]);
      if (teacherUser) {
        const teacher = await Teacher.create({
          teacherId: teacherIds[i],
          userId: teacherUser._id,
          name: teacherNames[i],
          email: teacherEmails[i],
          phone: teacherPhones[i],
          subject: teacherSubjects[i],
          experience: teacherExperiences[i],
          qualification: teacherQualifications[i],
          address: `${100 + i} Teacher Lane`,
          city: 'New York',
          country: 'USA',
          joinDate: new Date(`202${i % 2 === 0 ? '0' : '1'}-${String(i % 12 + 1).padStart(2, '0')}-${String(i * 5 + 1).padStart(2, '0')}`),
          status: 'Active',
        });
        teachers.push(teacher);
      }
    }
    console.log(`✓ Created ${teachers.length} teachers`);

    // Seed Classes (5 classes - one for each grade)
    console.log('Seeding Classes...');
    const classes = [];
    for (let grade = 1; grade <= 5; grade++) {
      const classItem = await Class.create({
        name: `Grade ${grade} Section A`,
        code: `G${grade}-A`,
        section: 'A',
        capacity: 30,
        status: 'Active',
        description: `Grade ${grade} Section A class description`,
      });
      classes.push(classItem);
    }
    console.log(`✓ Created ${classes.length} classes`);


    // Seed Students (10 students per grade = 50 total)
    console.log('Seeding Students...');
    const students = [];
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Isaac', 'Julia'];
    const lastNames = ['Williams', 'Davis', 'Miller', 'Garcia', 'Lee', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Brown'];
    const genders = ['Female', 'Male', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female'];
    
    let studentCounter = 1;
    for (let grade = 1; grade <= 5; grade++) {
      const classItem = classes[grade - 1];
      for (let i = 0; i < 10; i++) {
        const studentNum = (grade - 1) * 10 + i + 1;
        const studentUser = users.find(u => u.email === `student${studentNum}@school.com`);
        const studentId = `S${String(studentCounter).padStart(3, '0')}`;
        
        if (studentUser) {
          // Calculate age-appropriate birth date (around 6-10 years old for grades 1-5)
          const baseYear = 2024 - (6 + grade);
          const birthMonth = (i % 12) + 1;
          const birthDay = (i * 3 % 28) + 1;
          
          const student = await Student.create({
            studentId: studentId,
            userId: studentUser._id,
            name: `${firstNames[i]} ${lastNames[i]}`,
            email: `student${studentNum}@school.com`,
            phone: `+1-555-${2000 + studentNum}`,
            class: classItem.name,
            section: 'A',
            dateOfBirth: new Date(`${baseYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`),
            admissionDate: new Date('2023-09-01'),
            gender: genders[i],
            address: `${100 + studentNum} Student Street`,
            parent: `Parent ${firstNames[i]}`,
            parentPhone: `+1-555-${3000 + studentNum}`,
            parentEmail: `parent${studentNum}@email.com`,
            previousSchool: `Elementary School ${String.fromCharCode(65 + i)}`,
            status: 'Active',
          });
          students.push(student);
          studentCounter++;
        }
      }
      
    }
    console.log(`✓ Created ${students.length} students (10 per grade × 5 grades)`);

    // Seed Fees (for 5 grades)
    console.log('Seeding Fees...');
    const fees = await Fee.insertMany([
      { grade: 'Grade 1', tuitionFee: 200, admissionFee: 500 },
      { grade: 'Grade 2', tuitionFee: 300, admissionFee: 1000 },
      { grade: 'Grade 3', tuitionFee: 350, admissionFee: 1200 },
      { grade: 'Grade 4', tuitionFee: 400, admissionFee: 1500 },
      { grade: 'Grade 5', tuitionFee: 450, admissionFee: 1800 },
    ]);
    console.log(`✓ Created ${fees.length} fee structures`);

    // Seed Admissions (10 pending applications for Grade 1 and Grade 2 only)
    console.log('Seeding Admissions...');
    const admissionFirstNames = ['Ahmed', 'Fatima', 'Hassan', 'Ayesha', 'Omar', 'Sara', 'Ali', 'Zainab', 'Usman', 'Maryam'];
    const admissionLastNames = ['Khan', 'Ali', 'Ahmed', 'Malik', 'Hussain', 'Iqbal', 'Raza', 'Shah', 'Butt', 'Nawaz'];
    const admissionGenders = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female'];
    const admissionParentNames = ['Hassan', 'Sara', 'Mohammad', 'Nadia', 'Ali', 'Fatima', 'Ahmed', 'Ayesha', 'Omar', 'Zainab'];
    const admissionGrades = ['Grade 1', 'Grade 1', 'Grade 1', 'Grade 1', 'Grade 1', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 2'];
    
    const admissionsData = [];
    for (let i = 0; i < 10; i++) {
      const baseYear = admissionGrades[i] === 'Grade 1' ? 2017 : 2016;
      const birthMonth = (i % 12) + 1;
      const birthDay = (i * 3 % 28) + 1;
      
      admissionsData.push({
        firstName: admissionFirstNames[i],
        lastName: admissionLastNames[i],
        email: `${admissionFirstNames[i].toLowerCase()}.${admissionLastNames[i].toLowerCase()}.adm${i + 1}@email.com`,
        phone: `+1-555-${4000 + i}`,
        class: admissionGrades[i],
        // section not assigned for pending admissions
        dateOfBirth: new Date(`${baseYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`),
        gender: admissionGenders[i],
        admissionDate: new Date('2024-09-01'),
        address: `${100 + i} Admission Street`,
        previousSchool: `Elementary School ${String.fromCharCode(65 + i)}`,
        parentName: `${admissionParentNames[i]} ${admissionLastNames[i]}`,
        parentPhone: `+1-555-${5000 + i}`,
        parentEmail: `${admissionParentNames[i].toLowerCase()}.${admissionLastNames[i].toLowerCase()}${i + 1}@email.com`,
        appliedDate: new Date(`2024-${String((i % 6) + 1).padStart(2, '0')}-${String((i * 2 % 28) + 1).padStart(2, '0')}`),
        status: 'Pending',
      });
    }
    
    const admissions = await Admission.insertMany(admissionsData);
    console.log(`✓ Created ${admissions.length} pending admission applications (5 for Grade 1, 5 for Grade 2)`);

    // Seed Exams (one exam per subject for all grades)
    console.log('Seeding Exams...');
    const exams = [];
    const examSubjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const examNames = [
      'Mathematics Mid-Term Exam',
      'English Literature Exam',
      'Science Practical Exam',
      'History Final Exam',
      'Geography Assessment',
    ];
    
    for (let i = 0; i < 5; i++) {
      const subject = subjects.find(s => s.name === examSubjects[i]);
      const teacher = teachers.find(t => t.subject === examSubjects[i]) || teachers[0];
      const gradeList = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
      const classList = classes.map(c => c.name);
      
      const exam = await Exam.create({
        name: examNames[i],
        subject: examSubjects[i],
        subjectId: subject?._id,
        grades: gradeList,
        classes: classList,
        date: new Date(`2024-${String(i + 3).padStart(2, '0')}-20`),
        time: `${9 + i}:00`,
        duration: '2 hours',
        totalMarks: 100,
        passingMarks: 40,
        description: `${examSubjects[i]} examination covering all chapters`,
        sections: [
          { name: 'Section A: Multiple Choice', description: 'Choose the correct answer', marks: 20 },
          { name: 'Section B: Short Answer', description: 'Answer in brief', marks: 30 },
          { name: 'Section C: Long Answer', description: 'Detailed solutions required', marks: 50 },
        ],
        gradeAssignments: gradeList.map(grade => ({
          grade: grade,
          teacherId: teacher._id,
        })),
        status: 'Scheduled',
      });
      exams.push(exam);
    }
    console.log(`✓ Created ${exams.length} exams`);

    // Seed Exam Results (sample results for first 5 students)
    console.log('Seeding Exam Results...');
    const examResults = [];
    const marks = [85, 72, 90, 68, 78];
    const grades = ['A', 'B', 'A', 'C', 'B'];
    
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const examResult = await ExamResult.create({
        examId: exams[0]._id,
        studentId: students[i]._id,
        marksObtained: marks[i],
        totalMarks: 100,
        percentage: marks[i],
        grade: grades[i],
        status: 'Pass',
        remarks: marks[i] >= 80 ? 'Excellent performance' : marks[i] >= 70 ? 'Good work' : 'Needs improvement',
        gradedBy: teachers[0]._id,
      });
      examResults.push(examResult);
    }
    console.log(`✓ Created ${examResults.length} exam results`);

    // Seed Assignments (one per subject for all classes)
    console.log('Seeding Assignments...');
    const assignments = [];
    const assignmentTitles = [
      'Mathematics Homework - Chapter 3',
      'English Essay Assignment',
      'Science Project',
      'History Research Paper',
      'Geography Map Assignment',
    ];
    const assignmentDescriptions = [
      'Complete exercises 1-20 from chapter 3',
      'Write a 300-word essay on "My Favorite Season"',
      'Create a science project on the water cycle',
      'Research paper on World War II',
      'Label all continents and oceans on the world map',
    ];
    
    for (let i = 0; i < 5; i++) {
      const subject = subjects[i];
      const teacher = teachers.find(t => t.subject === subject.name) || teachers[0];
      
      for (const classItem of classes) {
        const assignment = await Assignment.create({
          title: assignmentTitles[i],
          description: assignmentDescriptions[i],
          subject: subject.name,
          subjectId: subject._id,
          class: classItem.name,
          teacherId: teacher._id,
          dueDate: new Date(`2024-${String(i + 3).padStart(2, '0')}-${String(15 + i).padStart(2, '0')}`),
          totalMarks: 50,
          status: 'Active',
        });
        assignments.push(assignment);
      }
    }
    console.log(`✓ Created ${assignments.length} assignments (5 subjects × 5 classes)`);

    // Seed Attendance (sample attendance for first 20 students for yesterday)
    console.log('Seeding Attendance...');
    const today = new Date();
    const attendance = [];
    const statuses = ['Present', 'Present', 'Present', 'Absent', 'Late'];
    
    for (let i = 0; i < Math.min(20, students.length); i++) {
      const student = students[i];
      const status = statuses[i % statuses.length];
      const attendanceRecord = await Attendance.create({
        studentId: student._id,
        class: student.class,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        status: status,
        remarks: status === 'Present' ? 'On time' : status === 'Late' ? 'Arrived late' : 'Absent',
        markedBy: teachers[0]._id,
      });
      attendance.push(attendanceRecord);
    }
    console.log(`✓ Created ${attendance.length} attendance records`);

    // Seed Fee Collections (sample for first 10 students)
    console.log('Seeding Fee Collections...');
    const feeCollections = [];
    const accountantUser = users.find(u => u.role === 'accountant');
    const paymentMethods = ['Cash', 'Bank Transfer', 'Online', 'Cheque'];
    
    for (let i = 0; i < Math.min(10, students.length); i++) {
      const student = students[i];
      const grade = student.class.match(/Grade (\d+)/)?.[1] || '1';
      const fee = fees.find(f => f.grade === `Grade ${grade}`);
      const tuitionFee = fee?.tuitionFee || 300;
      
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure unique receipt numbers
      const feeCollection = await FeeCollection.create({
        studentId: student._id,
        feeType: 'Tuition',
        amount: tuitionFee,
        paymentDate: new Date(`2024-01-${String(15 + i).padStart(2, '0')}`),
        paymentMethod: paymentMethods[i % paymentMethods.length],
        remarks: 'Monthly tuition fee',
        collectedBy: accountantUser?._id,
      });
      feeCollections.push(feeCollection);
    }
    console.log(`✓ Created ${feeCollections.length} fee collections`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Branches: ${branches.length}`);
    console.log(`   - Rooms (Master Data): ${rooms.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Fees: ${fees.length}`);
    console.log(`   - Admissions: ${admissions.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Exam Results: ${examResults.length}`);
    console.log(`   - Assignments: ${assignments.length}`);
    console.log(`   - Attendance Records: ${attendance.length}`);
    console.log(`   - Fee Collections: ${feeCollections.length}`);
    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Teacher: username=teacher1, password=teacher123');
    console.log('   Student: username=student1, password=student123');
    console.log('   Accountant: username=accountant1, password=accountant123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

seedData();

