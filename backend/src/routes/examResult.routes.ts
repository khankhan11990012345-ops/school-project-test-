import express, { Response } from 'express';
// import mongoose from 'mongoose';
import ExamResult from '../models/ExamResult.model.js';
import Exam from '../models/Exam.model.js';
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
    
    // Handle examId query - support both ObjectId and custom examId (EXM001)
    if (examId) {
      // Check if it's a custom examId (starts with EXM)
      if (examId.startsWith('EXM')) {
        // Find the exam by custom examId first
        const exam = await Exam.findOne({ examId: examId });
        if (exam) {
          filter.examId = exam._id; // Use the ObjectId for querying
        } else {
          // Exam not found with this custom ID, return empty results
          res.json({
            success: true,
            count: 0,
            data: { results: [] },
          });
          return;
        }
      } else {
        // Assume it's an ObjectId
        filter.examId = examId;
      }
    }
    
    if (studentId) filter.studentId = studentId;

    const results = await ExamResult.find(filter)
      .populate('examId', 'name subject date totalMarks examId')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    
    // Transform results to include custom IDs
    const transformedResults = results.map((result: any) => {
      const resultObj = result.toObject();
      const examIdPopulated = resultObj.examId as any;
      const studentIdPopulated = resultObj.studentId as any;
      const gradedByPopulated = resultObj.gradedBy as any;
      return {
        ...resultObj,
        // Replace ObjectId with custom ID string
        examId: examIdPopulated?.examId || examIdPopulated?._id || resultObj.examId,
        studentId: studentIdPopulated?.studentId || studentIdPopulated?._id || resultObj.studentId,
        gradedBy: gradedByPopulated?.teacherId || gradedByPopulated?._id || resultObj.gradedBy,
      };
    });
    
    res.json({
      success: true,
      count: transformedResults.length,
      data: { results: transformedResults },
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
      .populate('examId', 'name subject date totalMarks examId')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Exam result not found',
      });
      return;
    }
    
    // Transform result to include custom IDs
    const resultObj = result.toObject();
    const examIdPopulated = resultObj.examId as any;
    const studentIdPopulated = resultObj.studentId as any;
    const gradedByPopulated = resultObj.gradedBy as any;
    const transformedResult = {
      ...resultObj,
      // Replace ObjectId with custom ID string
      examId: examIdPopulated?.examId || examIdPopulated?._id || resultObj.examId,
      studentId: studentIdPopulated?.studentId || studentIdPopulated?._id || resultObj.studentId,
      gradedBy: gradedByPopulated?.teacherId || gradedByPopulated?._id || resultObj.gradedBy,
    };
    
    res.json({
      success: true,
      data: { result: transformedResult },
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
    const { marksObtained, totalMarks, grade: providedGrade, status: providedStatus, percentage: providedPercentage } = req.body as { 
      marksObtained: number; 
      totalMarks: number;
      grade?: string;
      status?: string;
      percentage?: number;
    };
    
    // Calculate percentage if not provided
    const percentage = providedPercentage !== undefined ? providedPercentage : (marksObtained / totalMarks) * 100;
    
    // Use provided grade and status if available (from frontend calculation based on passing marks)
    // Otherwise, calculate based on percentage thresholds (for backward compatibility)
    let grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'F';
    let status: 'Pass' | 'Fail' = 'Fail';
    
    if (providedGrade && providedStatus) {
      // Use the grade and status provided by frontend (already calculated based on passing marks)
      grade = providedGrade as 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
      // Frontend sends 'Pass' or 'Fail', so use it directly
      status = (providedStatus === 'Pass' || providedStatus === 'Passed') ? 'Pass' : 'Fail';
    } else {
      // Fallback: Calculate based on percentage (for backward compatibility)
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C+';
      else if (percentage >= 40) grade = 'C';
      else if (percentage >= 33) grade = 'D';
      
      status = percentage >= 33 ? 'Pass' : 'Fail';
    }

    const result = await ExamResult.create({
      ...req.body,
      percentage,
      grade,
      status,
      gradedBy: req.user?._id,
    });

    // Populate and transform to return custom IDs
    const populatedResult = await ExamResult.findById(result._id)
      .populate('examId', 'name subject date totalMarks examId')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    
    if (populatedResult) {
      const resultObj = populatedResult.toObject();
      const examIdPopulated = resultObj.examId as any;
      const studentIdPopulated = resultObj.studentId as any;
      const gradedByPopulated = resultObj.gradedBy as any;
      const transformedResult = {
        ...resultObj,
        examId: examIdPopulated?.examId || examIdPopulated?._id || resultObj.examId,
        studentId: studentIdPopulated?.studentId || studentIdPopulated?._id || resultObj.studentId,
        gradedBy: gradedByPopulated?.teacherId || gradedByPopulated?._id || resultObj.gradedBy,
      };
      
      res.status(201).json({
        success: true,
        message: 'Exam result created successfully',
        data: { result: transformedResult },
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Exam result created successfully',
        data: { result },
      });
    }
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
    const { 
      marksObtained, 
      totalMarks, 
      grade: providedGrade, 
      status: providedStatus, 
      percentage: providedPercentage,
      remarks
    } = req.body as { 
      marksObtained?: number; 
      totalMarks?: number;
      grade?: string;
      status?: string;
      percentage?: number;
      remarks?: string;
    };
    let updateData: any = { ...req.body };
    
    // Ensure remarks is included if provided
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    if (marksObtained !== undefined && totalMarks !== undefined) {
      // Calculate percentage if not provided
      const percentage = providedPercentage !== undefined ? providedPercentage : (marksObtained / totalMarks) * 100;
      
      // Use provided grade and status if available (from frontend calculation based on passing marks)
      // Otherwise, calculate based on percentage thresholds (for backward compatibility)
      if (providedGrade && providedStatus) {
        // Use the grade and status provided by frontend (already calculated based on passing marks)
        updateData.percentage = percentage;
        updateData.grade = providedGrade;
        // Frontend sends 'Pass' or 'Fail', so use it directly
        updateData.status = (providedStatus === 'Pass' || providedStatus === 'Passed') ? 'Pass' : 'Fail';
      } else {
        // Fallback: Calculate based on percentage (for backward compatibility)
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
    
    // Populate and transform to return custom IDs
    const populatedResult = await ExamResult.findById(result._id)
      .populate('examId', 'name subject date totalMarks examId')
      .populate('studentId', 'name studentId class')
      .populate('gradedBy', 'name teacherId');
    
    if (populatedResult) {
      const resultObj = populatedResult.toObject();
      const examIdPopulated = resultObj.examId as any;
      const studentIdPopulated = resultObj.studentId as any;
      const gradedByPopulated = resultObj.gradedBy as any;
      const transformedResult = {
        ...resultObj,
        examId: examIdPopulated?.examId || examIdPopulated?._id || resultObj.examId,
        studentId: studentIdPopulated?.studentId || studentIdPopulated?._id || resultObj.studentId,
        gradedBy: gradedByPopulated?.teacherId || gradedByPopulated?._id || resultObj.gradedBy,
      };
      
      res.json({
        success: true,
        message: 'Exam result updated successfully',
        data: { result: transformedResult },
      });
    } else {
      res.json({
        success: true,
        message: 'Exam result updated successfully',
        data: { result },
      });
    }
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

