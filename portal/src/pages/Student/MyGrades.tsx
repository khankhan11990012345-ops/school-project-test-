import { Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import '../../styles/universal.css';
import './Student.css';

const MyGrades = () => {
  const grades = [
    { subject: 'Mathematics', grade: 92, letter: 'A' },
    { subject: 'Physics', grade: 88, letter: 'B+' },
    { subject: 'Chemistry', grade: 95, letter: 'A' },
    { subject: 'English', grade: 85, letter: 'B' },
  ];

  const gradeData = grades.map(g => ({
    subject: g.subject,
    grade: g.grade,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Grades</h1>
      </div>
      <div className="dashboard-grid">
        <Card
          variant="stat"
          icon={<Award size={28} />}
          value="90%"
          label="Overall Average"
          color="#667eea"
        />
        <Card
          variant="stat"
          icon={<TrendingUp size={28} />}
          value="A-"
          label="Current GPA"
          color="#48bb78"
        />
      </div>
      <h3 className="section-title">Subject Grades</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Grade</th>
              <th>Letter Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((item, index) => (
              <tr key={index}>
                <td>{item.subject}</td>
                <td>{item.grade}%</td>
                <td>
                  <Badge variant="success" size="sm">{item.letter}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="section-title">Grade Distribution</h3>
      <div className="charts-container">
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grade" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MyGrades;

