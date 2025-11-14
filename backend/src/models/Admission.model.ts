import mongoose, { Schema } from 'mongoose';
import { IAdmission } from '../types/index.js';

const admissionSchema = new Schema<IAdmission>({
  admissionId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
  },
  section: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required'],
  },
  admissionDate: {
    type: Date,
    required: [true, 'Admission date is required'],
  },
  address: {
    type: String,
  },
  previousSchool: {
    type: String,
  },
  parentName: {
    type: String,
    required: [true, 'Parent name is required'],
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone is required'],
  },
  parentEmail: {
    type: String,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
  },
}, {
  timestamps: true,
});

// Generate admissionId before saving
admissionSchema.pre('save', async function(next) {
  if (!this.admissionId) {
    // Count only admissions that already have admissionId to get the next number
    const admissionsWithId = await mongoose.model('Admission').countDocuments({ 
      admissionId: { $exists: true, $ne: null, $nin: ['', null] }
    });
    this.admissionId = `ADM${String(admissionsWithId + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for full name
admissionSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

admissionSchema.set('toJSON', { virtuals: true });

const Admission = mongoose.model<IAdmission>('Admission', admissionSchema);

export default Admission;

