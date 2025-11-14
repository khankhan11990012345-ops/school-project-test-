import express, { Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Class from '../models/Class.model.js';
import Subject from '../models/Subject.model.js';
import Admission from '../models/Admission.model.js';
import FeeCollection from '../models/FeeCollection.model.js';
import Exam from '../models/Exam.model.js';
import ExamResult from '../models/ExamResult.model.js';
import Assignment from '../models/Assignment.model.js';
import Attendance from '../models/Attendance.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// @route   GET /api/dashboard/:role
// @desc    Get dashboard data for a specific role
// @access  Private
router.get('/:role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Verify user has the requested role
    if (user.role !== role) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    let dashboardData;

    switch (role) {
      case 'admin':
        dashboardData = await getAdminDashboard();
        break;
      case 'teacher':
        dashboardData = await getTeacherDashboard(user._id);
        break;
      case 'student':
        dashboardData = await getStudentDashboard(user._id);
        break;
      case 'accountant':
        dashboardData = await getAccountantDashboard();
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid role',
        });
        return;
    }

    res.json({
      success: true,
      data: dashboardData,
    });
    return;
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

// Admin Dashboard Data
async function getAdminDashboard() {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    pendingAdmissions,
    activeExams,
    recentFeeCollections,
    totalUsers,
    allFeeCollections,
    monthlyCollections,
  ] = await Promise.all([
    Student.countDocuments({ status: 'Active' }),
    Teacher.countDocuments({ status: 'Active' }),
    Class.countDocuments({ status: 'Active' }),
    Subject.countDocuments({ status: 'Active' }),
    Admission.countDocuments({ status: 'Pending' }),
    Exam.countDocuments({ status: { $in: ['Scheduled', 'In Progress'] } }),
    FeeCollection.find()
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('studentId', 'name studentId')
      .populate('collectedBy', 'name'),
    User.countDocuments(),
    FeeCollection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]),
    FeeCollection.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalFees = allFeeCollections[0]?.total || 0;
  const monthlyData = monthlyCollections[0] || { total: 0, count: 0 };
  const monthlyRevenue = monthlyData.total || 0;
  const expenses = Math.round(monthlyRevenue * 0.3); // Estimate 30% expenses
  const profit = monthlyRevenue - expenses;

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      pendingAdmissions,
      activeExams,
      totalUsers,
    },
    financial: {
      monthlyRevenue,
      totalFees,
      expenses,
      profit,
    },
    recentFeeCollections: recentFeeCollections.map((fc) => ({
      id: fc._id,
      studentName: (fc.studentId as any)?.name || 'Unknown',
      studentId: (fc.studentId as any)?.studentId || 'N/A',
      amount: fc.amount,
      paymentDate: fc.paymentDate,
      paymentMethod: fc.paymentMethod,
      collectedBy: (fc.collectedBy as any)?.name || 'Unknown',
    })),
  };
}

// Teacher Dashboard Data
async function getTeacherDashboard(userId: string) {
  // Find teacher by userId
  const teacher = await Teacher.findOne({ userId }).populate('userId');
  if (!teacher) {
    return {
      stats: {
        totalClasses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        pendingExams: 0,
      },
      recentAssignments: [],
    };
  }

  const [
    totalClasses,
    totalStudents,
    totalAssignments,
    pendingExams,
    recentAssignments,
  ] = await Promise.all([
    Class.countDocuments({ teacher: teacher._id, status: 'Active' }),
    Student.countDocuments({ class: { $in: await Class.find({ teacher: teacher._id }).distinct('name') } }),
    Assignment.countDocuments({ teacherId: teacher._id, status: 'Active' }),
    Exam.countDocuments({
      status: { $in: ['Scheduled', 'In Progress'] },
      'gradeAssignments.teacherId': teacher._id,
    }),
    Assignment.find({ teacherId: teacher._id })
      .sort({ dueDate: -1 })
      .limit(5)
      .populate('subjectId', 'name'),
  ]);

  return {
    stats: {
      totalClasses,
      totalStudents,
      totalAssignments,
      pendingExams,
    },
    recentAssignments: recentAssignments.map((a) => ({
      id: a._id,
      title: a.title,
      subject: (a.subjectId as any)?.name || a.subject,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      status: a.status,
    })),
  };
}

// Student Dashboard Data
async function getStudentDashboard(userId: string) {
  // Find student by userId
  const student = await Student.findOne({ userId }).populate('userId');
  if (!student) {
    return {
      stats: {
        totalAssignments: 0,
        upcomingExams: 0,
        attendancePercentage: 0,
        averageGrade: 0,
      },
      recentAssignments: [],
      upcomingExams: [],
    };
  }

  const [
    totalAssignments,
    upcomingExamsCount,
    attendanceRecords,
    examResults,
    recentAssignments,
    upcomingExams,
  ] = await Promise.all([
    Assignment.countDocuments({ class: student.class, status: 'Active' }),
    Exam.countDocuments({
      classes: student.class,
      date: { $gte: new Date() },
      status: { $in: ['Scheduled', 'In Progress'] },
    }),
    Attendance.find({ class: student.class }),
    ExamResult.find({ studentId: student._id }),
    Assignment.find({ class: student.class, status: 'Active' })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('subjectId', 'name'),
    Exam.find({
      classes: student.class,
      date: { $gte: new Date() },
      status: { $in: ['Scheduled', 'In Progress'] },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('subjectId', 'name'),
  ]);

  // Count present status from students array in attendance records
  const studentIdStr = student._id.toString();
  let presentCount = 0;
  let totalAttendanceDays = 0;
  
  attendanceRecords.forEach((record) => {
    const studentAttendance = record.students.find((s) => s.studentId.toString() === studentIdStr);
    if (studentAttendance) {
      totalAttendanceDays++;
      if (studentAttendance.status === 'Present') {
        presentCount++;
      }
    }
  });
  
  const attendancePercentage = totalAttendanceDays > 0
    ? Math.round((presentCount / totalAttendanceDays) * 100)
    : 0;

  const averageGrade = examResults.length > 0
    ? Math.round(examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length)
    : 0;

  return {
    stats: {
      totalAssignments,
      upcomingExams: upcomingExamsCount,
      attendancePercentage,
      averageGrade,
    },
    recentAssignments: recentAssignments.map((a) => ({
      id: a._id,
      title: a.title,
      subject: (a.subjectId as any)?.name || a.subject,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
    })),
    upcomingExams: upcomingExams.map((e) => ({
      id: e._id,
      name: e.name,
      subject: e.subject,
      date: e.date,
      time: e.time,
    })),
  };
}

// Accountant Dashboard Data
async function getAccountantDashboard() {
  const [
    totalFeeCollections,
    totalAmount,
    monthlyCollections,
    pendingFees,
    recentCollections,
  ] = await Promise.all([
    FeeCollection.countDocuments(),
    FeeCollection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]),
    FeeCollection.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Student.countDocuments({ status: 'Active' }),
    FeeCollection.find()
      .sort({ paymentDate: -1 })
      .limit(10)
      .populate('studentId', 'name studentId class')
      .populate('collectedBy', 'name'),
  ]);

  const totalAmountValue = totalAmount[0]?.total || 0;
  const monthlyData = monthlyCollections[0] || { total: 0, count: 0 };

  return {
    stats: {
      totalFeeCollections,
      totalAmount: totalAmountValue,
      monthlyCollections: monthlyData.total,
      monthlyCount: monthlyData.count,
      pendingFees,
    },
    recentCollections: recentCollections.map((fc) => ({
      id: fc._id,
      receiptNumber: fc.receiptNumber,
      studentName: (fc.studentId as any)?.name || 'Unknown',
      studentId: (fc.studentId as any)?.studentId || 'N/A',
      studentClass: (fc.studentId as any)?.class || 'N/A',
      amount: fc.amount,
      feeType: fc.feeType,
      paymentDate: fc.paymentDate,
      paymentMethod: fc.paymentMethod,
      collectedBy: (fc.collectedBy as any)?.name || 'Unknown',
    })),
  };
}

export default router;

