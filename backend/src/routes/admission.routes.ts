import express, { Request, Response } from 'express';
import Admission from '../models/Admission.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

router.use(authenticate);

// @route   GET /api/admissions
// @desc    Get all admissions
// @access  Private (Admin)
router.get('/', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter = status ? { status } : {};
    const admissions = await Admission.find(filter).lean();
    // Add virtual name field to each admission
    const admissionsWithName = admissions.map((adm: any) => ({
      ...adm,
      name: adm.firstName && adm.lastName ? `${adm.firstName} ${adm.lastName}` : adm.firstName || adm.lastName || '',
    }));
    res.json({
      success: true,
      count: admissionsWithName.length,
      data: { admissions: admissionsWithName },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/admissions/status/:status
// @desc    Get admissions by status
// @access  Private (Admin)
router.get('/status/:status', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admissions = await Admission.find({ status: req.params.status });
    res.json({
      success: true,
      count: admissions.length,
      data: { admissions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   GET /api/admissions/:id
// @desc    Get admission by ID
// @access  Private (Admin)
router.get('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admission = await Admission.findById(req.params.id).lean();
    if (!admission) {
      res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
      return;
    }
    // Add virtual name field
    const admissionWithName = {
      ...admission,
      name: admission.firstName && admission.lastName ? `${admission.firstName} ${admission.lastName}` : admission.firstName || admission.lastName || '',
    };
    res.json({
      success: true,
      data: { admission: admissionWithName },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   POST /api/admissions
// @desc    Create new admission
// @access  Public (can be accessed without auth for public applications)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully',
      data: { admission },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   PUT /api/admissions/:id
// @desc    Update admission
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!admission) {
      res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Admission updated successfully',
      data: { admission },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// @route   DELETE /api/admissions/:id
// @desc    Delete admission
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) {
      res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Admission deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

