import express, { Response } from 'express';
import Transaction from '../models/Transaction.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private (Admin, Accountant)
router.get('/', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, startDate, endDate } = req.query as { 
      type?: string; 
      category?: string; 
      startDate?: string; 
      endDate?: string 
    };
    
    const filter: any = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate({
        path: 'feeId',
        select: 'studentId receiptNumber feeType amount',
        populate: {
          path: 'studentId',
          select: 'studentId name class'
        }
      })
      .populate({
        path: 'expenseId',
        select: 'expenseId description amount category'
      })
      .populate({
        path: 'payrollId',
        select: 'payrollId employeeId amount',
        populate: {
          path: 'employeeId',
          select: 'teacherId name'
        }
      })
      .sort({ date: -1, createdAt: -1 });
    res.json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private (Admin, Accountant)
router.get('/:id', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private (Admin, Accountant)
router.post('/', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parse date if it's a string
    const transactionData: any = {
      ...req.body,
    };
    
    // Convert date string to Date if needed
    if (transactionData.date && typeof transactionData.date === 'string') {
      transactionData.date = new Date(transactionData.date);
    }
    
    const transaction = await Transaction.create(transactionData);
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction },
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
    
    console.error('Transaction creation error:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      body: req.body,
    });
    
    res.status(400).json({
      success: false,
      message: 'Error creating transaction',
      error: errorMessage,
    });
    return;
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private (Admin, Accountant)
router.put('/:id', authorize('admin', 'accountant'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parse date if it's a string
    const updateData: any = { ...req.body };
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }
    
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

