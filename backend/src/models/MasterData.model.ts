import mongoose, { Schema, Document } from 'mongoose';

export interface IMasterData extends Document {
  _id: string;
  type: 'room';
  code: string;
  name: string;
  data: {
    building?: string;
    floor?: number;
    capacity?: number;
    startTime?: string;  // Default time slot start (e.g., "09:00")
    endTime?: string;    // Default time slot end (e.g., "10:00")
    [key: string]: any;  // Allow additional fields
  };
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const masterDataSchema = new Schema<IMasterData>({
  type: {
    type: String,
    enum: ['room'],
    required: [true, 'Type is required'],
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Compound index for unique code per type
masterDataSchema.index({ type: 1, code: 1 }, { unique: true });

const MasterData = mongoose.model<IMasterData>('MasterData', masterDataSchema);

export default MasterData;

