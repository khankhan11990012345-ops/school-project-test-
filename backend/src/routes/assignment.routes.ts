import express, { Response } from 'express';
import Assignment from '../models/Assignment.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { class: className, subject, status } = req.query as { class?: string; subject?: string; status?: string };
    const filter: any = {};
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    const assignments = await Assignment.find(filter).populate('teacherId', 'name email teacherId').populate('subjectId', 'name code');
    res.json({
      success: true,
      count: assignments.length,
      data: { assignments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('teacherId', 'name email teacherId').populate('subjectId', 'name code');
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { assignment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      teacherId: (req.body as any).teacherId || req.user?._id,
    });
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Admin, Teacher)
router.put('/:id', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Admin, Teacher)
router.delete('/:id', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

