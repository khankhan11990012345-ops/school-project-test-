import { Response } from 'express';
import Subject from '../models/Subject.model.js';
import { AuthRequest } from '../types/index.js';

export const getAllSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, grade } = req.query as { status?: string; grade?: string };
    const filter: any = {};
    if (status) filter.status = status;
    if (grade) filter.grades = grade;

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'name email subject')
      .populate('teacherAssignments.teacherId', 'name email subject')
      .populate('schedule.teacherId', 'name email subject');
    res.json({
      success: true,
      count: subjects.length,
      data: { subjects },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID provided',
      });
      return;
    }

    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let subject = null;
    
    if (isValidObjectId) {
      // If it's a valid ObjectId format, try MongoDB _id first
      subject = await Subject.findById(id)
        .populate('teacherId', 'name email subject')
        .populate('teacherAssignments.teacherId', 'name email subject')
        .populate('schedule.teacherId', 'name email subject');
    }
    
    // If not found by _id or not a valid ObjectId, try by code
    if (!subject) {
      subject = await Subject.findOne({ code: id })
        .populate('teacherId', 'name email subject')
        .populate('teacherAssignments.teacherId', 'name email subject')
        .populate('schedule.teacherId', 'name email subject');
    }
    
    // If still not found and it's a valid ObjectId, we already tried _id, so it doesn't exist
    // If it's not a valid ObjectId and not found by code, it also doesn't exist
    if (!subject) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: { subject },
    });
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    
    // Handle MongoDB Cast errors (invalid ObjectId format)
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID format',
        error: 'The provided ID is not in a valid format',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.create(req.body);
    const populatedSubject = await Subject.findById(subject._id)
      .populate('teacherId', 'name email subject')
      .populate('teacherAssignments.teacherId', 'name email subject')
      .populate('schedule.teacherId', 'name email subject');
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject: populatedSubject },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID provided',
      });
      return;
    }

    // Check if it's a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let subject = null;
    
    if (isValidObjectId) {
      // If it's a valid ObjectId format, try MongoDB _id first
      subject = await Subject.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    // If not found by _id or not a valid ObjectId, try by code
    if (!subject) {
      subject = await Subject.findOneAndUpdate(
        { code: id },
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    if (!subject) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }
    
    // Populate teacher assignments after update
    const populatedSubject = await Subject.findById(subject._id)
      .populate('teacherId', 'name email subject')
      .populate('teacherAssignments.teacherId', 'name email subject')
      .populate('schedule.teacherId', 'name email subject');
    
    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject: populatedSubject },
    });
  } catch (error: any) {
    console.error('Error updating subject:', error);
    
    // Handle MongoDB Cast errors
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID format',
        error: 'The provided ID is not in a valid format',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID provided',
      });
      return;
    }

    // Check if it's a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let subject = null;
    
    if (isValidObjectId) {
      // If it's a valid ObjectId format, try MongoDB _id first
      subject = await Subject.findByIdAndDelete(id);
    }
    
    // If not found by _id or not a valid ObjectId, try by code
    if (!subject) {
      subject = await Subject.findOneAndDelete({ code: id });
    }
    
    if (!subject) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    
    // Handle MongoDB Cast errors
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      res.status(400).json({
        success: false,
        message: 'Invalid subject ID format',
        error: 'The provided ID is not in a valid format',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

