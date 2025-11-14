import express, { Request, Response, ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import classRoutes from './routes/class.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import admissionRoutes from './routes/admission.routes.js';
import feeRoutes from './routes/fee.routes.js';
import examRoutes from './routes/exam.routes.js';
import examResultRoutes from './routes/examResult.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import feeCollectionRoutes from './routes/feeCollection.routes.js';
import branchRoutes from './routes/branch.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import masterDataRoutes from './routes/masterData.routes.js';

dotenv.config();

const app = express();

// Middleware
// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default, set specific origin in production
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes (300 requests per minute)
app.use('/api', apiRateLimiter);
console.log('[RATE LIMITER] Rate limiting enabled: 300 requests per minute per IP');

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-results', examResultRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fee-collections', feeCollectionRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/master-data', masterDataRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'Connected'
  });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
};

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

