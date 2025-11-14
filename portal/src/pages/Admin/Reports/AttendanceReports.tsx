import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ViewButton, PrintButton } from '../../../components/Button/iconbuttons';
import '../../../styles/universal.css';
import './Reports.css';

const AttendanceReports = () => {
  const reports = [
    {
      id: 1,
      reportName: 'Monthly Attendance Report',
      period: 'March 2024',
      totalDays: 22,
      averageAttendance: 93.5,
      totalStudents: 150,
      generatedDate: '2024-03-31',
    },
    {
      id: 2,
      reportName: 'Class-wise Attendance',
      period: 'March 2024',
      totalDays: 22,
      averageAttendance: 94.2,
      totalStudents: 150,
      generatedDate: '2024-03-30',
    },
    {
      id: 3,
      reportName: 'Student Attendance Summary',
      period: 'Q1 2024',
      totalDays: 65,
      averageAttendance: 92.8,
      totalStudents: 150,
      generatedDate: '2024-03-29',
    },
  ];

  const monthlyAttendance = [
    { month: 'Jan', attendance: 90 },
    { month: 'Feb', attendance: 92 },
    { month: 'Mar', attendance: 93.5 },
    { month: 'Apr', attendance: 94 },
    { month: 'May', attendance: 95 },
    { month: 'Jun', attendance: 96 },
  ];

  const classAttendance = [
    { class: 'Grade 9A', attendance: 94 },
    { class: 'Grade 9B', attendance: 92 },
    { class: 'Grade 10A', attendance: 95 },
    { class: 'Grade 10B', attendance: 93 },
    { class: 'Grade 11A', attendance: 96 },
    { class: 'Grade 12A', attendance: 94 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Attendance Reports</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <h3>Total Reports</h3>
            <p>32</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Average Attendance</h3>
            <p>93.5%</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <h3>Total Days</h3>
            <p>120</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>This Month</h3>
            <p>8</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Attendance Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#667eea" name="Attendance %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Class-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#27ae60" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table */}
      <div className="section-title">Generated Attendance Reports</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Period</th>
              <th>Total Days</th>
              <th>Average Attendance</th>
              <th>Total Students</th>
              <th>Generated Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <strong>{report.reportName}</strong>
                </td>
                <td>{report.period}</td>
                <td>{report.totalDays}</td>
                <td>{report.averageAttendance}%</td>
                <td>{report.totalStudents}</td>
                <td>{report.generatedDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ViewButton size="sm" onClick={() => console.log('View', report.id)} />
                    <PrintButton size="sm" onClick={() => console.log('Download', report.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReports;

