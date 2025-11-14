import mongoose, { Schema } from 'mongoose';
import { IAttendance } from '../types/index.js';

const studentAttendanceSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true,
  },
  remarks: {
    type: String,
  },
}, { _id: false });

const attendanceSchema = new Schema<IAttendance>({
  class: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  students: {
    type: [studentAttendanceSchema],
    required: true,
    default: [],
  },
  markedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
  },
}, {
  timestamps: true,
});

// Compound index to ensure one attendance record per class per date
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;

