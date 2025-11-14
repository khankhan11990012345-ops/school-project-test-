import { FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Attendance.css';

const AttendanceReports = () => {
  const studentAttendance = [
    {
      id: 1,
      name: 'Alice Johnson',
      class: 'Grade 10A',
      totalDays: 120,
      present: 115,
      absent: 5,
      percentage: 95.8,
      status: 'Good',
    },
    {
      id: 2,
      name: 'Bob Williams',
      class: 'Grade 9B',
      totalDays: 120,
      present: 108,
      absent: 12,
      percentage: 90.0,
      status: 'Good',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      class: 'Grade 11A',
      totalDays: 120,
      present: 118,
      absent: 2,
      percentage: 98.3,
      status: 'Excellent',
    },
    {
      id: 4,
      name: 'Diana Prince',
      class: 'Grade 10B',
      totalDays: 120,
      present: 105,
      absent: 15,
      percentage: 87.5,
      status: 'Warning',
    },
    {
      id: 5,
      name: 'Edward Lee',
      class: 'Grade 12A',
      totalDays: 120,
      present: 110,
      absent: 10,
      percentage: 91.7,
      status: 'Good',
    },
  ];

  const statusDistribution = [
    { name: 'Excellent (95%+)', value: 45, color: '#27ae60' },
    { name: 'Good (85-94%)', value: 35, color: '#3498db' },
    { name: 'Warning (75-84%)', value: 15, color: '#f39c12' },
    { name: 'Critical (<75%)', value: 5, color: '#e74c3c' },
  ];

  const monthlyTrend = [
    { month: 'Jan', avgAttendance: 90 },
    { month: 'Feb', avgAttendance: 92 },
    { month: 'Mar', avgAttendance: 93 },
    { month: 'Apr', avgAttendance: 94 },
    { month: 'May', avgAttendance: 95 },
    { month: 'Jun', avgAttendance: 96 },
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
          <TrendingUp size={24} />
          <div>
            <h3>Average Attendance</h3>
            <p>93.6%</p>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle size={24} />
          <div>
            <h3>Students at Risk</h3>
            <p>12</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>Total Reports</h3>
            <p>45</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Improvement Rate</h3>
            <p>+2.5%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Attendance Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Attendance Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgAttendance" fill="#667eea" name="Avg Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="section-title">Individual Student Attendance</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Total Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentAttendance.map((student) => (
              <tr key={student.id}>
                <td>
                  <strong>{student.name}</strong>
                </td>
                <td>{student.class}</td>
                <td>{student.totalDays}</td>
                <td>{student.present}</td>
                <td>{student.absent}</td>
                <td>
                  <Badge variant={student.percentage >= 95 ? 'high' : student.percentage >= 85 ? 'medium' : 'low'} size="sm">
                    {student.percentage}%
                  </Badge>
                </td>
                <td>
                  <Badge variant={student.status.toLowerCase() === 'excellent' ? 'excellent' : student.status.toLowerCase() === 'good' ? 'good' : student.status.toLowerCase() === 'warning' ? 'warning' : 'danger'} size="sm">
                    {student.status}
                  </Badge>
                </td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View Report', student.id)} />
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

