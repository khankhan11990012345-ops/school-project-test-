import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as classController from '../controllers/class.controller.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get('/', classController.getAllClasses);

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', classController.getClassById);

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin only)
router.post('/', authorize('admin'), classController.createClass);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), classController.updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), classController.deleteClass);

export default router;

