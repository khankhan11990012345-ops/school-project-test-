import { Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Teachers.css';

const TeacherPerformance = () => {
  const teachers = [
    {
      id: 1,
      name: 'John Smith',
      subject: 'Mathematics',
      rating: 4.8,
      students: 125,
      classes: 5,
      attendance: 95,
      performance: 92,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      subject: 'English',
      rating: 4.7,
      students: 110,
      classes: 4,
      attendance: 93,
      performance: 89,
    },
    {
      id: 3,
      name: 'Michael Brown',
      subject: 'Science',
      rating: 4.9,
      students: 98,
      classes: 4,
      attendance: 97,
      performance: 94,
    },
    {
      id: 4,
      name: 'Emily Davis',
      subject: 'History',
      rating: 4.6,
      students: 85,
      classes: 3,
      attendance: 91,
      performance: 87,
    },
    {
      id: 5,
      name: 'David Wilson',
      subject: 'Physics',
      rating: 4.8,
      students: 75,
      classes: 3,
      attendance: 96,
      performance: 91,
    },
  ];

  const performanceData = teachers.map(t => ({
    name: t.name.split(' ')[0],
    rating: t.rating,
    attendance: t.attendance,
    performance: t.performance,
  }));

  const monthlyPerformance = [
    { month: 'Jan', avgRating: 4.5, avgPerformance: 85 },
    { month: 'Feb', avgRating: 4.6, avgPerformance: 87 },
    { month: 'Mar', avgRating: 4.7, avgPerformance: 89 },
    { month: 'Apr', avgRating: 4.8, avgPerformance: 90 },
    { month: 'May', avgRating: 4.8, avgPerformance: 91 },
    { month: 'Jun', avgRating: 4.9, avgPerformance: 92 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Teacher Performance</h1>
      </div>

      {/* Performance Charts */}
      <div className="section-title">Performance Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Teacher Ratings & Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#667eea" name="Rating" />
              <Bar dataKey="performance" fill="#764ba2" name="Performance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgRating" stroke="#667eea" name="Avg Rating" />
              <Line type="monotone" dataKey="avgPerformance" stroke="#27ae60" name="Avg Performance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher Performance Table */}
      <div className="section-title">Individual Teacher Performance</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Rating</th>
              <th>Students</th>
              <th>Classes</th>
              <th>Attendance %</th>
              <th>Performance %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <div className="teacher-name-cell">
                    <strong>{teacher.name}</strong>
                  </div>
                </td>
                <td>{teacher.subject}</td>
                <td>
                  <div className="rating-cell">
                    <Star size={14} fill="#f39c12" color="#f39c12" />
                    <span>{teacher.rating}</span>
                  </div>
                </td>
                <td>{teacher.students}</td>
                <td>{teacher.classes}</td>
                <td>
                  <Badge variant="high" size="sm">{teacher.attendance}%</Badge>
                </td>
                <td>
                  <Badge variant="high" size="sm">{teacher.performance}%</Badge>
                </td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View Details', teacher.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherPerformance;

