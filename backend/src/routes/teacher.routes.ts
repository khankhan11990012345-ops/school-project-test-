import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as teacherController from '../controllers/teacher.controller.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/', authorize('admin'), teacherController.getAllTeachers);

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private
router.get('/:id', teacherController.getTeacherById);

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin only)
router.post('/', authorize('admin'), teacherController.createTeacher);

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), teacherController.updateTeacher);

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), teacherController.deleteTeacher);

export default router;

