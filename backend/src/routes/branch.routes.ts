import express, { Response } from 'express';
import Branch from '../models/Branch.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/branches
// @desc    Get all branches
// @access  Private
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter = status ? { status } : {};
    const branches = await Branch.find(filter);
    res.json({
      success: true,
      count: branches.length,
      data: { branches },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branches',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/branches/:id
// @desc    Get branch by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { branch },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branch',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/branches
// @desc    Create new branch
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: { branch },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating branch',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/branches/:id
// @desc    Update branch
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!branch) {
      res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: { branch },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating branch',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/branches/:id
// @desc    Delete branch
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting branch',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

