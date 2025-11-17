import mongoose, { Schema } from 'mongoose';
import { IExamResult } from '../types/index.js';

const examResultSchema = new Schema<IExamResult>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true,
  },
  remarks: {
    type: String,
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    index: true,
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one result per exam per student
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const ExamResult = mongoose.model<IExamResult>('ExamResult', examResultSchema);

export default ExamResult;

