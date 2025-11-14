import express, { Response } from 'express';
import ExamResult from '../models/ExamResult.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/exam-results
// @desc    Get all exam results
// @access  Private
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId, studentId } = req.query as { examId?: string; studentId?: string };
    const filter: any = {};
    if (examId) filter.examId = examId;
    if (studentId) filter.studentId = studentId;

    const results = await ExamResult.find(filter)
      .populate('examId', 'name subject date totalMarks')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    res.json({
      success: true,
      count: results.length,
      data: { results },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam results',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/exam-results/:id
// @desc    Get exam result by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await ExamResult.findById(req.params.id)
      .populate('examId', 'name subject date totalMarks')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Exam result not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/exam-results
// @desc    Create new exam result
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { marksObtained, totalMarks } = req.body as { marksObtained: number; totalMarks: number };
    const percentage = (marksObtained / totalMarks) * 100;
    
    // Determine grade
    let grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C+';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 33) grade = 'D';

    const status = percentage >= 33 ? 'Pass' : 'Fail';

    const result = await ExamResult.create({
      ...req.body,
      percentage,
      grade,
      status,
      gradedBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Exam result created successfully',
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating exam result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/exam-results/:id
// @desc    Update exam result
// @access  Private (Admin, Teacher)
router.put('/:id', authorize('admin', 'teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { marksObtained, totalMarks } = req.body as { marksObtained?: number; totalMarks?: number };
    let updateData: any = { ...req.body };

    if (marksObtained !== undefined && totalMarks !== undefined) {
      const percentage = (marksObtained / totalMarks) * 100;
      
      let grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C+';
      else if (percentage >= 40) grade = 'C';
      else if (percentage >= 33) grade = 'D';

      updateData.percentage = percentage;
      updateData.grade = grade;
      updateData.status = percentage >= 33 ? 'Pass' : 'Fail';
    }

    const result = await ExamResult.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Exam result not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Exam result updated successfully',
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exam result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/exam-results/:id
// @desc    Delete exam result
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Exam result not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Exam result deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting exam result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

