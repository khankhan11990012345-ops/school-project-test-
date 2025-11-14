import express, { Response } from 'express';
import FeeCollection from '../models/FeeCollection.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/fee-collections
// @desc    Get all fee collections
// @access  Private (Admin, Accountant)
router.get('/', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, feeType, startDate, endDate } = req.query as { studentId?: string; feeType?: string; startDate?: string; endDate?: string };
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (feeType) filter.feeType = feeType;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const collections = await FeeCollection.find(filter)
      .populate('studentId', 'name studentId class section parent parentPhone parentEmail')
      .populate('collectedBy', 'name email');
    res.json({
      success: true,
      count: collections.length,
      data: { collections },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee collections',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/fee-collections
// @desc    Create new fee collection
// @access  Private (Admin, Accountant)
router.post('/', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parse paymentDate if it's a string
    const feeData: any = {
      ...req.body,
      collectedBy: req.user?._id,
    };
    
    // Convert paymentDate string to Date if needed
    if (feeData.paymentDate && typeof feeData.paymentDate === 'string') {
      feeData.paymentDate = new Date(feeData.paymentDate);
    }
    
    const collection = await FeeCollection.create(feeData);
    res.status(201).json({
      success: true,
      message: 'Fee collected successfully',
      data: { collection },
    });
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
    
    console.error('Fee collection creation error:', {
      name: error.name,
      code: error.code,
      message: error.message,
      errors: error.errors,
      keyPattern: error.keyPattern,
      body: req.body,
    });
    
    res.status(400).json({
      success: false,
      message: 'Error collecting fee',
      error: errorMessage,
    });
    return;
  }
});

// @route   GET /api/fee-collections/:id
// @desc    Get fee collection by ID
// @access  Private (Admin, Accountant)
router.get('/:id', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collection = await FeeCollection.findById(req.params.id)
      .populate('studentId', 'name studentId class section parent parentPhone parentEmail')
      .populate('collectedBy', 'name email');
    if (!collection) {
      res.status(404).json({
        success: false,
        message: 'Fee collection not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/fee-collections/:id
// @desc    Update fee collection
// @access  Private (Admin, Accountant)
router.put('/:id', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parse paymentDate if it's a string
    const updateData: any = { ...req.body };
    if (updateData.paymentDate && typeof updateData.paymentDate === 'string') {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }
    
    const collection = await FeeCollection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name studentId class section parent parentPhone parentEmail')
      .populate('collectedBy', 'name email');
    
    if (!collection) {
      res.status(404).json({
        success: false,
        message: 'Fee collection not found',
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Fee collection updated successfully',
      data: { collection },
    });
  } catch (error: any) {
    // Extract detailed error message from MongoDB validation errors
    let errorMessage = 'Unknown error';
    
    if (error.name === 'ValidationError') {
      // MongoDB validation error - extract field-specific errors
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = validationErrors.join(', ');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error('Fee collection update error:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      body: req.body,
    });
    
    res.status(400).json({
      success: false,
      message: 'Error updating fee collection',
      error: errorMessage,
    });
    return;
  }
});

// @route   DELETE /api/fee-collections/:id
// @desc    Delete fee collection
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collection = await FeeCollection.findByIdAndDelete(req.params.id);
    if (!collection) {
      res.status(404).json({
        success: false,
        message: 'Fee collection not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Fee collection deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fee collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

