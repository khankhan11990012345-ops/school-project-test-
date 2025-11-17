import express, { Response } from 'express';
import Exam from '../models/Exam.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, grade, subject } = req.query as { status?: string; grade?: string; subject?: string };
    const filter: any = {};
    if (status) filter.status = status;
    if (grade) filter.grades = grade;
    if (subject) filter.subject = subject;

    const exams = await Exam.find(filter).populate('subjectId', 'name code').populate('gradeAssignments.teacherId', 'name teacherId');
    // Ensure all exams have examId (generate if missing)
    let examIdCounter = 1;
    for (const exam of exams) {
      if (!exam.examId) {
        // Find the highest existing examId number
        const examsWithId = await Exam.find({ examId: { $exists: true, $ne: null } }).sort({ examId: -1 }).limit(1);
        if (examsWithId.length > 0 && examsWithId[0].examId) {
          const lastIdMatch = examsWithId[0].examId.match(/\d+$/);
          if (lastIdMatch) {
            examIdCounter = parseInt(lastIdMatch[0]) + 1;
          }
        }
        exam.examId = `EXM${String(examIdCounter).padStart(3, '0')}`;
        await exam.save();
        examIdCounter++;
      }
    }
    res.json({
      success: true,
      count: exams.length,
      data: { exams },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id).populate('subjectId', 'name code').populate('gradeAssignments.teacherId', 'name teacherId');
    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
      return;
    }
    // Ensure exam has examId (generate if missing)
    if (!exam.examId) {
      // Find the highest existing examId number
      const examsWithId = await Exam.find({ examId: { $exists: true, $ne: null } }).sort({ examId: -1 }).limit(1);
      let examIdCounter = 1;
      if (examsWithId.length > 0 && examsWithId[0].examId) {
        const lastIdMatch = examsWithId[0].examId.match(/\d+$/);
        if (lastIdMatch) {
          examIdCounter = parseInt(lastIdMatch[0]) + 1;
        }
      }
      exam.examId = `EXM${String(examIdCounter).padStart(3, '0')}`;
      await exam.save();
    }
    res.json({
      success: true,
      data: { exam },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If examId is provided in request, ensure it doesn't conflict
    if (req.body.examId) {
      const existing = await Exam.findOne({ examId: req.body.examId });
      if (existing) {
        // Remove examId from request, let pre-save hook generate a new one
        delete req.body.examId;
      }
    }
    
    const exam = await Exam.create(req.body);
    // Reload to get the generated examId
    const populatedExam = await Exam.findById(exam._id);
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam: populatedExam },
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    
    // Handle specific MongoDB errors
    let errorMessage = error?.message || 'Unknown error';
    let statusCode = 500;
    
    // Duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      errorMessage = `Duplicate ${field}: ${error.keyValue?.[field] || 'value'}. Please try again.`;
    }
    // Validation errors
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      const validationErrors = error.errors ? Object.values(error.errors).map((e: any) => e.message).join(', ') : '';
      errorMessage = validationErrors || 'Validation error';
    }
    
    res.status(statusCode).json({
      success: false,
      message: 'Error creating exam',
      error: errorMessage,
    });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Admin, Teacher)
router.put('/:id', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
      return;
    }
    // Ensure examId exists (generate if missing)
    if (!exam.examId) {
      // Find the highest existing examId number
      const examsWithId = await Exam.find({ examId: { $exists: true, $ne: null } }).sort({ examId: -1 }).limit(1);
      let examIdCounter = 1;
      if (examsWithId.length > 0 && examsWithId[0].examId) {
        const lastIdMatch = examsWithId[0].examId.match(/\d+$/);
        if (lastIdMatch) {
          examIdCounter = parseInt(lastIdMatch[0]) + 1;
        }
      }
      exam.examId = `EXM${String(examIdCounter).padStart(3, '0')}`;
      await exam.save();
    }
    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting exam',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

