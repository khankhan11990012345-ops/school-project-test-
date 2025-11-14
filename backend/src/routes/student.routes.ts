import express, { Response } from 'express';
import Student from '../models/Student.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { class: className, status } = req.query as { class?: string; status?: string };
    const filter: any = {};
    if (className) filter.class = className;
    if (status) filter.status = status;

    const students = await Student.find(filter).populate('userId', 'username email name role');
    res.json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/students/class/:className
// @desc    Get students by class
// @access  Private (Admin, Teacher)
router.get('/class/:className', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find({ class: req.params.className });
    res.json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID (supports both studentId and MongoDB _id)
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom studentId first, then by MongoDB _id
    let student = await Student.findOne({ studentId: req.params.id }).populate('userId', 'username email name role');
    if (!student) {
      // Fallback to MongoDB _id
      student = await Student.findById(req.params.id).populate('userId', 'username email name role');
    }
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    // Students can only view their own profile unless they're admin/teacher
    if (req.user && req.user.role === 'student') {
      const studentUser = await Student.findOne({ userId: req.user._id });
      if (studentUser && studentUser._id.toString() !== req.params.id) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
        });
        return;
      }
    }

    res.json({
      success: true,
      data: { student },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: { student },
    });
    return;
  } catch (error: any) {
    // Extract detailed error message from MongoDB validation errors
    let errorMessage = 'Unknown error';
    
    if (error.name === 'ValidationError') {
      // MongoDB validation error - extract field-specific errors
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = validationErrors.join(', ');
    } else if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0];
      errorMessage = `${field} already exists`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error('Student creation error:', {
      name: error.name,
      code: error.code,
      message: error.message,
      errors: error.errors,
      keyPattern: error.keyPattern,
      requestBody: req.body,
    });
    
    // Include validation errors in response if available
    const responseData: any = {
      success: false,
      message: 'Error creating student',
      error: errorMessage,
    };
    
    // Add detailed validation errors if it's a ValidationError
    if (error.name === 'ValidationError' && error.errors) {
      responseData.errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
      }));
    }
    
    res.status(400).json(responseData);
    return;
  }
});

// @route   PUT /api/students/:id
// @desc    Update student (supports both studentId and MongoDB _id)
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom studentId first, then by MongoDB _id
    let student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      // Fallback to MongoDB _id
      student = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: { student },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (supports both studentId and MongoDB _id)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom studentId first, then by MongoDB _id
    let student = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!student) {
      // Fallback to MongoDB _id
      student = await Student.findByIdAndDelete(req.params.id);
    }
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

