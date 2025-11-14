import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as masterDataController from '../controllers/masterData.controller.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/master-data
// @desc    Get all master data (optionally filtered by type and status)
// @access  Private
router.get('/', masterDataController.getAllMasterData);

// @route   GET /api/master-data/code/:code
// @desc    Get master data by code
// @access  Private
router.get('/code/:code', masterDataController.getMasterDataByCode);

// @route   GET /api/master-data/:id
// @desc    Get master data by ID
// @access  Private
router.get('/:id', masterDataController.getMasterDataById);

// @route   POST /api/master-data
// @desc    Create new master data
// @access  Private (Admin only)
router.post('/', authorize('admin'), masterDataController.createMasterData);

// @route   PUT /api/master-data/:id
// @desc    Update master data
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), masterDataController.updateMasterData);

// @route   DELETE /api/master-data/:id
// @desc    Delete master data
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), masterDataController.deleteMasterData);

export default router;

