import mongoose, { Schema } from 'mongoose';
import { IBranch } from '../types/index.js';

const branchSchema = new Schema<IBranch>({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
  },
  principal: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Branch = mongoose.model<IBranch>('Branch', branchSchema);

export default Branch;

