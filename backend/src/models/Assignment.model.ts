import mongoose, { Schema } from 'mongoose';
import { IAssignment } from '../types/index.js';

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;

