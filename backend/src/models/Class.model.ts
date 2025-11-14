import mongoose, { Schema } from 'mongoose';
import { IClass } from '../types/index.js';

const classSchema = new Schema<IClass>({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    unique: true,
    trim: true,
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Class = mongoose.model<IClass>('Class', classSchema);

export default Class;

