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
    const exam = await Exam.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating exam',
      error: error instanceof Error ? error.message : 'Unknown error',
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

