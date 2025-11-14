import { Response } from 'express';
import Teacher from '../models/Teacher.model.js';
import { AuthRequest } from '../types/index.js';

export const getAllTeachers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter = status ? { status } : {};
    const teachers = await Teacher.find(filter).populate('userId', 'username email name role');
    res.json({
      success: true,
      count: teachers.length,
      data: { teachers },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom teacherId first, then by MongoDB _id
    let teacher = await Teacher.findOne({ teacherId: req.params.id }).populate('userId', 'username email name role');
    if (!teacher) {
      // Fallback to MongoDB _id
      teacher = await Teacher.findById(req.params.id).populate('userId', 'username email name role');
    }
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }
    res.json({
      success: true,
      data: { teacher },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: { teacher },
    });
  } catch (error: any) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      Object.keys(error.errors || {}).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      res.status(400).json({
        success: false,
        message: 'Teacher validation failed',
        errors: validationErrors,
        error: Object.values(validationErrors).join(', '),
      });
      return;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      res.status(400).json({
        success: false,
        message: `Teacher with this ${field} already exists`,
        error: `Duplicate ${field}`,
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom teacherId first, then by MongoDB _id
    let teacher = await Teacher.findOneAndUpdate(
      { teacherId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!teacher) {
      // Fallback to MongoDB _id
      teacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: { teacher },
    });
  } catch (error: any) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      Object.keys(error.errors || {}).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      res.status(400).json({
        success: false,
        message: 'Teacher validation failed',
        errors: validationErrors,
        error: Object.values(validationErrors).join(', '),
      });
      return;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      res.status(400).json({
        success: false,
        message: `Teacher with this ${field} already exists`,
        error: `Duplicate ${field}`,
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to find by custom teacherId first, then by MongoDB _id
    let teacher = await Teacher.findOneAndDelete({ teacherId: req.params.id });
    if (!teacher) {
      // Fallback to MongoDB _id
      teacher = await Teacher.findByIdAndDelete(req.params.id);
    }
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
      return;
    }
    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

