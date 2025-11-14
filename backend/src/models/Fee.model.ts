import mongoose, { Schema } from 'mongoose';
import { IFee } from '../types/index.js';

const feeSchema = new Schema<IFee>({
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    unique: true,
  },
  tuitionFee: {
    type: Number,
    required: [true, 'Tuition fee is required'],
    min: [0, 'Tuition fee cannot be negative'],
  },
  admissionFee: {
    type: Number,
    required: [true, 'Admission fee is required'],
    min: [0, 'Admission fee cannot be negative'],
  },
}, {
  timestamps: true,
});

const Fee = mongoose.model<IFee>('Fee', feeSchema);

export default Fee;

