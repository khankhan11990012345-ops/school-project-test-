import mongoose, { Schema } from 'mongoose';
import { IFeeCollection } from '../types/index.js';

const feeCollectionSchema = new Schema<IFeeCollection>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['Tuition', 'Admission', 'Other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'],
    required: true,
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls but enforce uniqueness for non-null values
  },
  remarks: {
    type: String,
  },
  collectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Partial'],
    default: 'Unpaid',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Generate receipt number before saving
feeCollectionSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    // Use timestamp + random to ensure uniqueness
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP${timestamp}${random}`;
    
    // Ensure uniqueness by checking if it exists
    const exists = await mongoose.model('FeeCollection').findOne({ receiptNumber: this.receiptNumber });
    if (exists) {
      // If exists, add more randomness
      const extraRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.receiptNumber = `RCP${timestamp}${random}${extraRandom}`;
    }
  }
  next();
});

const FeeCollection = mongoose.model<IFeeCollection>('FeeCollection', feeCollectionSchema);

export default FeeCollection;

