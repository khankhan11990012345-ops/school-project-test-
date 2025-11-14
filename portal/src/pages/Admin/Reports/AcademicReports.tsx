import { FileText, Award, TrendingUp, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ViewButton, PrintButton } from '../../../components/Button/iconbuttons';
import '../../../styles/universal.css';
import './Reports.css';

const AcademicReports = () => {
  const reports = [
    {
      id: 1,
      reportName: 'Semester 1 Academic Report',
      period: '2024 Q1',
      totalStudents: 150,
      averageGrade: 85.5,
      topPerformers: 25,
      generatedDate: '2024-03-31',
    },
    {
      id: 2,
      reportName: 'Subject-wise Performance',
      period: 'March 2024',
      totalStudents: 150,
      averageGrade: 83.2,
      topPerformers: 30,
      generatedDate: '2024-03-30',
    },
    {
      id: 3,
      reportName: 'Class-wise Academic Summary',
      period: '2024 Q1',
      totalStudents: 150,
      averageGrade: 84.8,
      topPerformers: 28,
      generatedDate: '2024-03-29',
    },
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', average: 85, passRate: 92 },
    { subject: 'English', average: 82, passRate: 88 },
    { subject: 'Science', average: 87, passRate: 95 },
    { subject: 'History', average: 80, passRate: 85 },
  ];

  const gradeDistribution = [
    { grade: 'A+', count: 25 },
    { grade: 'A', count: 40 },
    { grade: 'B', count: 35 },
    { grade: 'C', count: 30 },
    { grade: 'D', count: 15 },
    { grade: 'F', count: 5 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Academic Reports</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <BookOpen size={24} />
          <div>
            <h3>Total Reports</h3>
            <p>45</p>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} />
          <div>
            <h3>Average Grade</h3>
            <p>84.5%</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Top Performers</h3>
            <p>83</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>This Month</h3>
            <p>12</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Academic Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Subject Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#667eea" name="Avg Grade %" />
              <Bar dataKey="passRate" fill="#27ae60" name="Pass Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#764ba2" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table */}
      <div className="section-title">Generated Academic Reports</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Period</th>
              <th>Total Students</th>
              <th>Average Grade</th>
              <th>Top Performers</th>
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
                <td>{report.totalStudents}</td>
                <td>{report.averageGrade}%</td>
                <td>{report.topPerformers}</td>
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

export default AcademicReports;
