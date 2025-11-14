import express, { Response } from 'express';
import User from '../models/User.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      name,
      role: role || 'student',
    });

    // Get user without password
    const userWithoutPassword = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userWithoutPassword },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Users can only view their own profile unless they're admin
    if (req.user && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

