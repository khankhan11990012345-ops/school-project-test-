import express, { Response } from 'express';
import Fee from '../models/Fee.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/fees
// @desc    Get all fees
// @access  Private
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fees = await Fee.find();
    res.json({
      success: true,
      count: fees.length,
      data: { fees },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/fees/grade/:grade
// @desc    Get fee by grade
// @access  Private
router.get('/grade/:grade', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fee = await Fee.findOne({ grade: req.params.grade });
    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found for this grade',
      });
      return;
    }
    res.json({
      success: true,
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/fees
// @desc    Create new fee
// @access  Private (Admin, Accountant)
router.post('/', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating fee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/fees/:id
// @desc    Update fee
// @access  Private (Admin, Accountant)
router.put('/:id', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating fee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/fees/:id
// @desc    Delete fee
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Fee deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fee',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

