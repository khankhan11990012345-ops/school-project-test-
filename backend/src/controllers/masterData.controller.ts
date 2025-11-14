import { Response } from 'express';
import MasterData from '../models/MasterData.model.js';
import { AuthRequest } from '../types/index.js';

export const getAllMasterData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status } = req.query as { type?: string; status?: string };
    const filter: any = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;

    const masterData = await MasterData.find(filter).sort({ code: 1 });
    
    res.json({
      success: true,
      count: masterData.length,
      data: { masterData },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMasterDataById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid master data ID provided',
      });
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let masterData = null;
    
    if (isValidObjectId) {
      masterData = await MasterData.findById(id);
    } else {
      // Try to find by code
      masterData = await MasterData.findOne({ code: id });
    }

    if (!masterData) {
      res.status(404).json({
        success: false,
        message: 'Master data not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { masterData },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMasterDataByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { type } = req.query as { type?: string };
    
    if (!code || code.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Code is required',
      });
      return;
    }

    const filter: any = { code };
    if (type) filter.type = type;

    const masterData = await MasterData.findOne(filter);

    if (!masterData) {
      res.status(404).json({
        success: false,
        message: 'Master data not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { masterData },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createMasterData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, code, name, data, status } = req.body;

    if (!type || !code || !name) {
      res.status(400).json({
        success: false,
        message: 'Type, code, and name are required',
      });
      return;
    }

    // Check if code already exists for this type
    const existing = await MasterData.findOne({ type, code });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Master data with code "${code}" already exists for type "${type}"`,
      });
      return;
    }

    const masterData = new MasterData({
      type,
      code,
      name,
      data: data || {},
      status: status || 'Active',
    });

    await masterData.save();

    res.status(201).json({
      success: true,
      message: 'Master data created successfully',
      data: { masterData },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Error creating master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateMasterData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, name, data, status } = req.body;

    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid master data ID provided',
      });
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let masterData = null;
    
    if (isValidObjectId) {
      masterData = await MasterData.findById(id);
    } else {
      masterData = await MasterData.findOne({ code: id });
    }

    if (!masterData) {
      res.status(404).json({
        success: false,
        message: 'Master data not found',
      });
      return;
    }

    // Check if code is being changed and if new code already exists
    if (code && code !== masterData.code) {
      const existing = await MasterData.findOne({ 
        type: masterData.type, 
        code,
        _id: { $ne: masterData._id }
      });
      if (existing) {
        res.status(400).json({
          success: false,
          message: `Master data with code "${code}" already exists for type "${masterData.type}"`,
        });
        return;
      }
    }

    // Update fields
    if (code) masterData.code = code;
    if (name) masterData.name = name;
    if (data !== undefined) masterData.data = { ...masterData.data, ...data };
    if (status) masterData.status = status;

    await masterData.save();

    res.json({
      success: true,
      message: 'Master data updated successfully',
      data: { masterData },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Error updating master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteMasterData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Invalid master data ID provided',
      });
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let masterData = null;
    
    if (isValidObjectId) {
      masterData = await MasterData.findById(id);
    } else {
      masterData = await MasterData.findOne({ code: id });
    }

    if (!masterData) {
      res.status(404).json({
        success: false,
        message: 'Master data not found',
      });
      return;
    }

    await MasterData.findByIdAndDelete(masterData._id);

    res.json({
      success: true,
      message: 'Master data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting master data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

