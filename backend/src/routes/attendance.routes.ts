import express, { Response } from 'express';
import Attendance from '../models/Attendance.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private (Admin, Teacher)
router.get('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, class: className, date } = req.query as { studentId?: string; class?: string; date?: string };
    const filter: any = {};
    if (className) filter.class = className;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate('students.studentId', 'name studentId class')
      .populate('markedBy', 'name email');
    
    // If studentId filter is provided, filter the students array
    let filteredAttendance = attendance;
    if (studentId) {
      filteredAttendance = attendance.map((att: any) => {
        const studentAtt = att.students.find((s: any) => 
          s.studentId?._id?.toString() === studentId || 
          s.studentId?._id === studentId ||
          s.studentId?.toString() === studentId
        );
        return studentAtt ? { ...att.toObject(), students: [studentAtt] } : null;
      }).filter((att: any) => att !== null);
    }
    
    res.json({
      success: true,
      count: filteredAttendance.length,
      data: { attendance: filteredAttendance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance for a class on a date
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  // Declare variables outside try block for error handler access
  let className: string | undefined;
  let attendanceDate: Date | undefined;
  
  try {
    const { class: classParam, date, students } = req.body;
    className = classParam;
    
    console.log('[BACKEND] POST /attendance - Received data:', {
      className,
      date,
      studentsCount: students?.length || 0,
    });
    
    if (!className || !date || !students || !Array.isArray(students)) {
      res.status(400).json({
        success: false,
        message: 'Class, date, and students array are required',
      });
      return;
    }

    // Normalize date to start of day
    attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    console.log('[BACKEND] POST /attendance - Normalized date:', {
      originalDate: date,
      normalizedDate: attendanceDate.toISOString(),
      className,
    });

    // Check if attendance already exists for this class and date
    let attendance = await Attendance.findOne({
      class: className,
      date: attendanceDate,
    });
    
    console.log('[BACKEND] POST /attendance - Existing attendance check:', {
      className,
      date: attendanceDate.toISOString(),
      found: !!attendance,
      existingId: attendance?._id?.toString(),
    });

    if (attendance) {
      // Update existing attendance
      console.log('[BACKEND] POST /attendance - Updating existing attendance:', attendance._id.toString());
      attendance.students = students;
      attendance.markedBy = req.user?._id;
      await attendance.save();
      
      await attendance.populate('students.studentId', 'name studentId class');
      await attendance.populate('markedBy', 'name email');
      
      console.log('[BACKEND] POST /attendance - Attendance updated successfully:', {
        id: attendance._id.toString(),
        class: attendance.class,
        date: attendance.date.toISOString(),
        studentsCount: attendance.students.length,
      });
      
      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: { attendance },
      });
    } else {
      // Create new attendance
      console.log('[BACKEND] POST /attendance - Creating new attendance');
      attendance = await Attendance.create({
        class: className,
        date: attendanceDate,
        students: students,
        markedBy: req.user?._id,
      });
      
      await attendance.populate('students.studentId', 'name studentId class');
      await attendance.populate('markedBy', 'name email');
      
      console.log('[BACKEND] POST /attendance - Attendance created successfully:', {
        id: attendance._id.toString(),
        class: attendance.class,
        date: attendance.date.toISOString(),
        studentsCount: attendance.students.length,
      });
      
      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: { attendance },
      });
    }
  } catch (error: any) {
    console.error('[BACKEND] POST /attendance - Error:', {
      code: error.code,
      message: error.message,
      name: error.name,
      className,
      date: attendanceDate?.toISOString(),
    });
    
    if (error.code === 11000) {
      console.error('[BACKEND] POST /attendance - Duplicate key error (11000):', {
        className,
        date: attendanceDate?.toISOString(),
        errorMessage: error.message,
      });
      res.status(400).json({
        success: false,
        message: 'Attendance already marked for this class on this date',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance (for a class on a date)
// @access  Private (Admin, Teacher)
router.put('/:id', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { students } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
      return;
    }
    
    // Update students array if provided
    if (students && Array.isArray(students)) {
      attendance.students = students;
      attendance.markedBy = req.user?._id;
    }
    
    await attendance.save();
    await attendance.populate('students.studentId', 'name studentId class');
    await attendance.populate('markedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: { attendance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting attendance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

