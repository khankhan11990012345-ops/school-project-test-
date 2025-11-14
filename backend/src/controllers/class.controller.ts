import { Response } from 'express';
import Class from '../models/Class.model.js';
import { AuthRequest } from '../types/index.js';

export const getAllClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = {};
    if (status) filter.status = status;

    const classes = await Class.find(filter);
    res.json({
      success: true,
      count: classes.length,
      data: { classes },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getClassById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom code first, then by MongoDB _id
    let classItem = await Class.findOne({ code: req.params.id });
    if (!classItem) {
      // Fallback to MongoDB _id
      classItem = await Class.findById(req.params.id);
    }
    if (!classItem) {
      res.status(404).json({
        success: false,
        message: 'Class not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { class: classItem },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classItem = await Class.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: classItem },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom code first, then by MongoDB _id
    let classItem = await Class.findOneAndUpdate(
      { code: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!classItem) {
      // Fallback to MongoDB _id
      classItem = await Class.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    if (!classItem) {
      res.status(404).json({
        success: false,
        message: 'Class not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Class updated successfully',
      data: { class: classItem },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom code first, then by MongoDB _id
    let classItem = await Class.findOneAndDelete({ code: req.params.id });
    if (!classItem) {
      // Fallback to MongoDB _id
      classItem = await Class.findByIdAndDelete(req.params.id);
    }
    if (!classItem) {
      res.status(404).json({
        success: false,
        message: 'Class not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

