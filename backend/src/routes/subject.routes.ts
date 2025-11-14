import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as subjectController from '../controllers/subject.controller.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', subjectController.getAllSubjects);

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', subjectController.getSubjectById);

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin only)
router.post('/', authorize('admin'), subjectController.createSubject);

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), subjectController.updateSubject);

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), subjectController.deleteSubject);

export default router;

