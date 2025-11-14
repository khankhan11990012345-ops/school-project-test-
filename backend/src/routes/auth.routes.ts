import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateToken } from '../utils/generateToken.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['admin', 'teacher', 'student', 'accountant']).withMessage('Invalid role'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

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

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token,
        },
      });
      return;
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { username, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      }).select('+password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is inactive. Please contact administrator.',
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      });
      return;
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
      res.json({
        success: true,
        data: { user },
      });
      return;
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

