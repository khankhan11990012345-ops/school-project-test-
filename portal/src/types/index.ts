export const USER_ROLES = ['admin', 'teacher', 'student', 'accountant'] as const;
export type UserRole = typeof USER_ROLES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DashboardData {
  admin?: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    pendingApprovals: number;
  };
  teacher?: {
    myClasses: number;
    totalStudents: number;
    upcomingExams: number;
    assignmentsToGrade: number;
  };
  student?: {
    myClasses: number;
    assignments: number;
    grades: { average: number; subjects: number };
    upcomingExams: number;
  };
  accountant?: {
    totalRevenue: number;
    pendingPayments: number;
    monthlyExpenses: number;
    outstandingFees: number;
  };
}

// Student interfaces
export interface Student {
  id: number | string;
  studentId?: string;
  name: string;
  email: string;
  class: string;
  phone: string;
  parent: string;
  status: string;
  dateOfBirth: string;
  admissionDate: string;
  address?: string;
  parentPhone: string;
  parentEmail?: string;
  gender: string;
  previousSchool?: string;
}

// Teacher interfaces
export interface Teacher {
  id: number | string;
  teacherId?: string;
  name: string;
  email: string;
  subject: string;
  phone: string;
  experience: string;
  status: string;
  qualification?: string;
  address?: string;
  city?: string;
  country?: string;
  joinDate?: string;
}

// Class interfaces
export interface Class {
  id: string;
  name: string;
  code: string;
  grade: string;
  section: string;
  teacher?: string;
  capacity: number;
  currentStudents: number;
  room?: string;
  schedule?: string;
  status: 'Active' | 'Inactive';
}

// Grade interfaces
export interface Grade {
  id: string;
  name: string;
  section: string;
  capacity: number;
  currentStudents: number;
  description: string;
  status: 'Active' | 'Inactive';
}

// Subject interfaces
export interface TeacherSubjectAssignment {
  id: number | string;
  subjectId: number | string;
  teacherId: number | string;
  teacherName: string;
  teacherEmail: string;
  experience: string;
  status: string;
  grades: string[];
}

export interface SubjectSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room?: string;
  grade?: string;
  section?: string;
}

export interface TeacherGradeSection {
  grade: string;
  sections: string[];
}

export interface TeacherAssignment {
  teacherId: number | string;
  gradeSections: TeacherGradeSection[];
}

export interface Subject {
  id: number | string;
  name: string;
  code: string;
  category: string;
  level: string;
  credits: number;
  description?: string;
  grades?: string[];
  teacherId?: number | string; // Keep for backward compatibility
  teacherAssignments?: TeacherAssignment[]; // New: array of teacher assignments
  schedule?: SubjectSchedule[];
  status?: 'Active' | 'Inactive';
}

// Exam interfaces
export interface ExamSection {
  id: number;
  name: string;
  description?: string;
  marks: number;
}

export interface ExamGradeAssignment {
  grade: string;
  teacherId: number | string;
}

export interface Exam {
  id: number | string;
  name: string;
  subject: string;
  subjectId?: number | string;
  grades: string[];
  classes: string[];
  date: string;
  time: string;
  duration: string;
  totalMarks: number;
  passingMarks?: number;
  description?: string;
  sections: ExamSection[];
  gradeAssignments: ExamGradeAssignment[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

// Exam Result interfaces
export interface StudentExamGrade {
  studentId: number | string;
  studentName: string;
  class: string;
  sectionGrades: {
    sectionId: number;
    sectionName: string;
    marksObtained: number;
    maxMarks: number;
  }[];
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'Passed' | 'Failed';
  gradedBy?: number | string;
  gradedAt?: string;
  remarks?: string;
}

export interface ExamResult {
  id: number | string;
  examId: number | string;
  examName: string;
  subject: string;
  date: string;
  studentGrades: StudentExamGrade[];
  createdAt?: string;
  updatedAt?: string;
}

// Admission interfaces
export interface Admission {
  id: number | string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section?: string;
  dateOfBirth: string;
  gender: string;
  admissionDate: string;
  address?: string;
  previousSchool?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Fee interfaces
export interface GradeFee {
  id: number | string;
  grade: string;
  tuitionFee: number;
  admissionFee: number;
  createdAt?: string;
  updatedAt?: string;
}

// Fee Collection interfaces
export interface FeeCollection {
  id: number | string;
  studentId: string;
  studentName: string;
  parentName: string;
  cnic?: string;
  class: string;
  feeType: string;
  amount: number;
  collectedDate: string;
  paymentMethod: string;
  status: 'Paid' | 'Unpaid' | 'Partial Paid' | 'Dues' | 'Pending';
  createdAt?: string;
}

// Assignment interfaces
export interface AssignmentQuestion {
  id: number;
  question: string;
  marks: number;
  order: number;
}

export interface AssignmentSection {
  id: number;
  name: string;
  description?: string;
  questions: AssignmentQuestion[];
  order: number;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  subjectId?: number;
  class: string;
  grades?: string[];
  assignedDate: string;
  dueDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  totalMarks?: number;
  description: string;
  sections: AssignmentSection[];
  assignedBy: number;
  createdAt?: string;
}

export interface QuestionAnswer {
  questionId: number;
  answer: string;
}

export interface StudentAssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  class: string;
  submittedAt: string;
  submittedFile?: string;
  submissionText?: string;
  answers?: QuestionAnswer[];
  status: 'Submitted' | 'Graded' | 'Late';
  marksObtained?: number;
  totalMarks?: number;
  grade?: string;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
}
