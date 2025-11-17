import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Registration from './pages/Auth/Registration';
import Dashboard from './components/Dashboard';
// Admin pages (moved to Admin folder)
import TeachersList from './pages/Admin/Teachers/TeachersList';
import AddTeacher from './pages/Admin/Teachers/AddTeacher';
import TeacherDetails from './pages/Admin/Teachers/TeacherDetails';
import TeacherPerformance from './pages/Admin/Teachers/TeacherPerformance';
import StudentsList from './pages/Admin/Students/StudentsList';
import AddStudent from './pages/Admin/Students/AddStudent';
import StudentDetails from './pages/Admin/Students/StudentDetails';
import StudentRecords from './pages/Admin/Students/StudentRecords';
import StudentAssignments from './pages/Admin/Students/StudentAssignments';
import TestsPapers from './pages/Admin/Students/TestsPapers';
import Quizzes from './pages/Admin/Students/Quizzes';
import GradesList from './pages/Admin/Classes/GradesList';
import AddGrade from './pages/Admin/Classes/AddGrade';
import SubjectsList from './pages/Admin/Subjects/SubjectsList';
import AddSubject from './pages/Admin/Subjects/AddSubject';
import SubjectDetails from './pages/Admin/Subjects/SubjectDetails';
import MarkAttendance from './pages/Admin/Attendance/MarkAttendance';
import ViewAttendance from './pages/Admin/Attendance/ViewAttendance';
import AttendanceReports from './pages/Admin/Attendance/AttendanceReports';
import DailyReports from './pages/Admin/Attendance/DailyReports';
import ExamsList from './pages/Admin/Exams/ExamsList';
import CreateExam from './pages/Admin/Exams/CreateExam';
import GradeExam from './pages/Admin/Exams/GradeExam';
import ExamResults from './pages/Admin/Exams/ExamResults';
import StudentExamResults from './pages/Admin/Exams/StudentExamResults';
import AdmitCards from './pages/Admin/Exams/AdmitCards';
import AccountsOverview from './pages/Admin/Accounts/AccountsOverview';
import FeeManagement from './pages/Admin/Accounts/FeeManagement';
import FeesCollection from './pages/Admin/Accounts/FeesCollection';
import TeacherPayroll from './pages/Admin/Accounts/TeacherPayroll';
import Expenses from './pages/Admin/Accounts/Expenses';
import AccountReports from './pages/Admin/Accounts/AccountReports';
import Transactions from './pages/Admin/Accounts/Transactions';
import AdmissionsList from './pages/Admin/Admissions/AdmissionsList';
import NewAdmission from './pages/Admin/Admissions/NewAdmission';
import AdmissionReports from './pages/Admin/Admissions/AdmissionReports';
import ReportsOverview from './pages/Admin/Reports/ReportsOverview';
import AcademicReports from './pages/Admin/Reports/AcademicReports';
import ReportsAttendanceReports from './pages/Admin/Reports/AttendanceReports';
import UsersList from './pages/Admin/UserManagement/UsersList';
import AddUser from './pages/Admin/UserManagement/AddUser';
import UserActivity from './pages/Admin/UserManagement/UserActivity';
import BranchesList from './pages/Admin/Branches/BranchesList';
import AddBranch from './pages/Admin/Branches/AddBranch';
import BranchSettings from './pages/Admin/Branches/BranchSettings';
import BranchTransfer from './pages/Admin/Branches/BranchTransfer';
import BranchReports from './pages/Admin/Branches/BranchReports';
// Teacher pages
// import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherStudents from './pages/Teacher/TeacherStudents';
import TeacherAttendance from './pages/Teacher/TeacherAttendance';
import TeacherAssignments from './pages/Teacher/TeacherAssignments';
import TeacherExams from './pages/Teacher/TeacherExams';
import TeacherTimetable from './pages/Teacher/TeacherTimetable';
// Student pages
// import StudentDashboard from './pages/Student/StudentDashboard';
import MyCourses from './pages/Student/MyCourses';
import MyGrades from './pages/Student/MyGrades';
import Papers from './pages/Student/Papers';
import MyAssignments from './pages/Student/MyAssignments';
// Accountant pages
// import AccountantDashboard from './pages/Accountant/AccountantDashboard';
// import FinancialOverview from './pages/Accountant/FinancialOverview';
// Settings
import ThemeSettings from './pages/Admin/Settings/ThemeSettings';
import ButtonExamples from './pages/Admin/Settings/ButtonExamples';
import BadgeExamples from './pages/Admin/Settings/BadgeExamples';
import IconButtonExamples from './pages/Admin/Settings/IconButtonExamples';
import MasterData from './pages/Admin/Settings/MasterData';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard/:role" element={<Dashboard />}>
          {/* Dashboard home */}
          <Route index element={<div />} />
          {/* Teachers routes */}
          <Route path="teachers" element={<TeachersList />} />
          <Route path="teachers/add" element={<AddTeacher />} />
          <Route path="teachers/edit/:id" element={<AddTeacher />} />
          <Route path="teachers/performance" element={<TeacherPerformance />} />
          <Route path="teachers/:id" element={<TeacherDetails />} />
          {/* Students routes */}
          <Route path="students" element={<StudentsList />} />
          <Route path="students/add" element={<AddStudent />} />
          <Route path="students/edit/:id" element={<AddStudent />} />
          <Route path="students/records" element={<StudentRecords />} />
          <Route path="students/assignments" element={<StudentAssignments />} />
          <Route path="students/tests" element={<TestsPapers />} />
          <Route path="students/quizzes" element={<Quizzes />} />
          <Route path="students/:id" element={<StudentDetails />} />
          {/* Classes routes */}
          <Route path="classes" element={<GradesList />} />
          <Route path="classes/add" element={<AddGrade />} />
          <Route path="classes/edit/:id" element={<AddGrade />} />
          {/* Subjects routes */}
          <Route path="subjects" element={<SubjectsList />} />
          <Route path="subjects/add" element={<AddSubject />} />
          <Route path="subjects/edit/:id" element={<AddSubject />} />
          <Route path="subjects/:id" element={<SubjectDetails />} />
          {/* Attendance routes */}
          <Route path="attendance/mark" element={<MarkAttendance />} />
          <Route path="attendance/view" element={<ViewAttendance />} />
          <Route path="attendance/reports" element={<AttendanceReports />} />
          <Route path="attendance/daily" element={<DailyReports />} />
          {/* Exams routes */}
          <Route path="exams" element={<ExamsList />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="exams/edit/:id" element={<CreateExam />} />
          <Route path="exams/grade/:id" element={<GradeExam />} />
          <Route path="exams/results" element={<ExamResults />} />
          <Route path="exams/results/:id" element={<StudentExamResults />} />
          <Route path="exams/admit-cards" element={<AdmitCards />} />
          {/* Accounts routes */}
          <Route path="accounts" element={<AccountsOverview />} />
          <Route path="accounts/fee-management" element={<FeeManagement />} />
          <Route path="accounts/fees" element={<FeesCollection />} />
          <Route path="accounts/payroll" element={<TeacherPayroll />} />
          <Route path="accounts/expenses" element={<Expenses />} />
          <Route path="accounts/reports" element={<AccountReports />} />
          <Route path="accounts/transactions" element={<Transactions />} />
          {/* Admissions routes */}
          <Route path="admissions" element={<AdmissionsList />} />
          <Route path="admissions/new" element={<NewAdmission />} />
          <Route path="admissions/reports" element={<AdmissionReports />} />
          {/* Reports routes */}
          <Route path="reports" element={<ReportsOverview />} />
          <Route path="reports/academic" element={<AcademicReports />} />
          <Route path="reports/attendance" element={<ReportsAttendanceReports />} />
          {/* User Management routes */}
          <Route path="users" element={<UsersList />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/activity" element={<UserActivity />} />
          {/* Multi Branch routes */}
          <Route path="branches" element={<BranchesList />} />
          <Route path="branches/add" element={<AddBranch />} />
          <Route path="branches/settings" element={<BranchSettings />} />
          <Route path="branches/transfer" element={<BranchTransfer />} />
          <Route path="branches/reports" element={<BranchReports />} />
          {/* Teacher-specific routes */}
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="exams/grade/:id" element={<GradeExam />} />
          <Route path="timetable" element={<TeacherTimetable />} />
          {/* Student-specific routes */}
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="papers" element={<Papers />} />
          <Route path="my-grades" element={<MyGrades />} />
          {/* Accountant-specific routes */}
          <Route path="accounts" element={<AccountsOverview />} />
          <Route path="accounts/fees" element={<FeesCollection />} />
          <Route path="accounts/payroll" element={<TeacherPayroll />} />
          <Route path="accounts/expenses" element={<Expenses />} />
          <Route path="accounts/reports" element={<AccountReports />} />
          <Route path="accounts/transactions" element={<Transactions />} />
          {/* Settings routes (Admin only) */}
          <Route path="settings/theme" element={<ThemeSettings />} />
          <Route path="settings/master-data" element={<MasterData />} />
          <Route path="settings/buttons" element={<ButtonExamples />} />
          <Route path="settings/badges" element={<BadgeExamples />} />
          <Route path="settings/icon-buttons" element={<IconButtonExamples />} />
        </Route>
        {/* Direct routes (without role prefix) */}
        <Route path="/teachers" element={<Navigate to="/dashboard/admin/teachers" replace />} />
        <Route path="/students" element={<Navigate to="/dashboard/admin/students" replace />} />
        <Route path="/attendance" element={<Navigate to="/dashboard/admin/attendance/mark" replace />} />
        <Route path="/exams" element={<Navigate to="/dashboard/admin/exams" replace />} />
        <Route path="/accounts" element={<Navigate to="/dashboard/admin/accounts" replace />} />
        <Route path="/admissions" element={<Navigate to="/dashboard/admin/admissions" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
