import mongoose, { Schema } from 'mongoose';
import { ISubject } from '../types/index.js';

const subjectSchema = new Schema<ISubject>({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
  },
  credits: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  grades: [{
    type: String,
  }],
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  teacherAssignments: [{
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    gradeSections: [{
      grade: {
        type: String,
        required: true,
      },
      sections: [{
        type: String,
      }],
    }],
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: {
      type: String,
    },
    slot: {
      type: String,
    },
    grade: {
      type: String,
    },
    section: {
      type: String,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

export default Subject;

