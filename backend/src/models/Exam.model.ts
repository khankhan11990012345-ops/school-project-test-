import mongoose, { Schema } from 'mongoose';
import { IExam, IExamSection, IExamGradeAssignment } from '../types/index.js';

const examSectionSchema = new Schema<IExamSection>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
  },
});

const examGradeAssignmentSchema = new Schema<IExamGradeAssignment>({
  grade: {
    type: String,
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
});

const examSchema = new Schema<IExam>({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
  },
  grades: [{
    type: String,
  }],
  classes: [{
    type: String,
  }],
  date: {
    type: Date,
    required: [true, 'Exam date is required'],
  },
  time: {
    type: String,
    required: [true, 'Exam time is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 0,
  },
  passingMarks: {
    type: Number,
    min: 0,
  },
  description: {
    type: String,
  },
  sections: [examSectionSchema],
  gradeAssignments: [examGradeAssignmentSchema],
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
}, {
  timestamps: true,
});

const Exam = mongoose.model<IExam>('Exam', examSchema);

export default Exam;

