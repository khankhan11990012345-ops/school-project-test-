# MySchool Backend API

A comprehensive backend API for school management system built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Teacher, Student, Accountant)
- ✅ Complete CRUD operations for all collections
- ✅ MongoDB database with Mongoose ODM
- ✅ Comprehensive seed data for testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory (already created) with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/school12
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

3. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

## Usage

### Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Seed the database:
```bash
npm run seed
```

This will populate the database with sample data including:
- Users (admin, teachers, students, accountant)
- Branches
- Teachers
- Classes
- Subjects
- Students
- Fees
- Admissions
- Exams
- Exam Results
- Assignments
- Attendance Records
- Fee Collections

### Test the setup:
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Students
- `GET /api/students` - Get all students (Admin, Teacher)
- `GET /api/students/class/:className` - Get students by class
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Teachers
- `GET /api/teachers` - Get all teachers (Admin)
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Admissions
- `GET /api/admissions` - Get all admissions (Admin)
- `GET /api/admissions/status/:status` - Get admissions by status
- `GET /api/admissions/:id` - Get admission by ID
- `POST /api/admissions` - Create admission (Public)
- `PUT /api/admissions/:id` - Update admission (Admin only)
- `DELETE /api/admissions/:id` - Delete admission (Admin only)

### Fees
- `GET /api/fees` - Get all fees
- `GET /api/fees/grade/:grade` - Get fee by grade
- `POST /api/fees` - Create fee (Admin, Accountant)
- `PUT /api/fees/:id` - Update fee (Admin, Accountant)
- `DELETE /api/fees/:id` - Delete fee (Admin only)

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create exam (Admin, Teacher)
- `PUT /api/exams/:id` - Update exam (Admin, Teacher)
- `DELETE /api/exams/:id` - Delete exam (Admin only)

### Exam Results
- `GET /api/exam-results` - Get all exam results
- `GET /api/exam-results/:id` - Get exam result by ID
- `POST /api/exam-results` - Create exam result (Admin, Teacher)
- `PUT /api/exam-results/:id` - Update exam result (Admin, Teacher)
- `DELETE /api/exam-results/:id` - Delete exam result (Admin only)

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create assignment (Admin, Teacher)
- `PUT /api/assignments/:id` - Update assignment (Admin, Teacher)
- `DELETE /api/assignments/:id` - Delete assignment (Admin, Teacher)

### Attendance
- `GET /api/attendance` - Get all attendance records (Admin, Teacher)
- `POST /api/attendance` - Mark attendance (Admin, Teacher)
- `PUT /api/attendance/:id` - Update attendance (Admin, Teacher)
- `DELETE /api/attendance/:id` - Delete attendance (Admin only)

### Fee Collections
- `GET /api/fee-collections` - Get all fee collections (Admin, Accountant)
- `GET /api/fee-collections/:id` - Get fee collection by ID
- `POST /api/fee-collections` - Create fee collection (Admin, Accountant)
- `DELETE /api/fee-collections/:id` - Delete fee collection (Admin only)

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch (Admin only)
- `PUT /api/branches/:id` - Update branch (Admin only)
- `DELETE /api/branches/:id` - Delete branch (Admin only)

## Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: username=`admin`, password=`admin123`
- **Teacher**: username=`teacher1`, password=`teacher123`
- **Student**: username=`student1`, password=`student123`
- **Accountant**: username=`accountant1`, password=`accountant123`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Teacher**: Access to students, classes, exams, assignments, attendance
- **Student**: Limited access to own data
- **Accountant**: Access to fees and fee collections

## Database

The database name is `school12` as configured in the MongoDB URI.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Student.model.js
│   │   ├── Teacher.model.js
│   │   ├── Class.model.js
│   │   ├── Subject.model.js
│   │   ├── Admission.model.js
│   │   ├── Fee.model.js
│   │   ├── Exam.model.js
│   │   ├── ExamResult.model.js
│   │   ├── Assignment.model.js
│   │   ├── Attendance.model.js
│   │   ├── FeeCollection.model.js
│   │   └── Branch.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── student.routes.js
│   │   ├── teacher.routes.js
│   │   ├── class.routes.js
│   │   ├── subject.routes.js
│   │   ├── admission.routes.js
│   │   ├── fee.routes.js
│   │   ├── exam.routes.js
│   │   ├── examResult.routes.js
│   │   ├── assignment.routes.js
│   │   ├── attendance.routes.js
│   │   ├── feeCollection.routes.js
│   │   └── branch.routes.js
│   ├── scripts/
│   │   ├── seed.js
│   │   └── test.js
│   ├── utils/
│   │   └── generateToken.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## License

ISC

