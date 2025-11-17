import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'accountant';
  name: string;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends Document {
  _id: string;
  studentId: string;
  userId: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section?: string;
  dateOfBirth: Date;
  admissionDate: Date;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  parent: string;
  parentPhone: string;
  parentEmail?: string;
  previousSchool?: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher extends Document {
  _id: string;
  teacherId: string;
  userId: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  qualification?: string;
  address?: string;
  city?: string;
  country?: string;
  joinDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass extends Document {
  _id: string;
  name: string;
  code: string;
  section: string;
  capacity: number;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubjectSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room?: string;
  slot?: string;
  grade?: string;
  section?: string;
  teacherId?: mongoose.Types.ObjectId | string;
}

export interface ITeacherGradeSection {
  grade: string;
  sections: string[];
}

export interface ITeacherAssignment {
  teacherId: mongoose.Types.ObjectId | string;
  gradeSections: ITeacherGradeSection[];
}

export interface ISubject extends Document {
  _id: string;
  name: string;
  code: string;
  category: string;
  level: string;
  credits: number;
  description?: string;
  grades: string[];
  teacherId?: mongoose.Types.ObjectId | string; // Keep for backward compatibility
  teacherAssignments?: ITeacherAssignment[]; // New: array of teacher assignments
  schedule?: ISubjectSchedule[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmission extends Document {
  _id: string;
  admissionId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  section?: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: Date;
  address?: string;
  previousSchool?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  appliedDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  studentId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFee extends Document {
  _id: string;
  grade: string;
  tuitionFee: number;
  admissionFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamSection {
  name: string;
  description?: string;
  marks: number;
}

export interface IExamGradeAssignment {
  grade: string;
  teacherId: mongoose.Types.ObjectId | string;
}

export interface IExam extends Document {
  _id: string;
  examId?: string;
  name: string;
  subject: string;
  subjectId?: string;
  grades: string[];
  classes: string[];
  date: Date;
  time: string;
  startTime?: string;
  duration: string;
  totalMarks: number;
  passingMarks?: number;
  description?: string;
  sections: IExamSection[];
  gradeAssignments: IExamGradeAssignment[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamResult extends Document {
  _id: string;
  examId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  status: 'Pass' | 'Fail';
  remarks?: string;
  gradedBy?: mongoose.Types.ObjectId | string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignment extends Document {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  subjectId?: mongoose.Types.ObjectId | string;
  class: string;
  teacherId: mongoose.Types.ObjectId | string;
  dueDate: Date;
  totalMarks: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentAttendance {
  studentId: mongoose.Types.ObjectId | string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export interface IAttendance extends Document {
  _id: string;
  class: string;
  date: Date;
  students: IStudentAttendance[];
  markedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeeCollection extends Document {
  _id: string;
  studentId: mongoose.Types.ObjectId | string;
  feeType: 'Tuition' | 'Admission' | 'Other';
  amount: number;
  paymentDate: Date;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';
  receiptNumber?: string;
  remarks?: string;
  collectedBy?: mongoose.Types.ObjectId | string;
  status?: 'Unpaid' | 'Paid' | 'Partial';
  paidAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  _id: string;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  time?: string;
  status: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online' | 'Credit Card';
  expenseId?: mongoose.Types.ObjectId | string;
  feeId?: mongoose.Types.ObjectId | string;
  payrollId?: mongoose.Types.ObjectId | string;
  referenceId?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBranch extends Document {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  phone: string;
  email: string;
  principal?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Express Request with user
export interface AuthRequest extends Request {
  user?: IUser;
}

