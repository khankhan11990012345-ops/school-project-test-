import { BookOpen, ClipboardList, BarChart3, Calendar } from 'lucide-react';
import { Card } from '../../components/Card';
import '../../styles/universal.css';
import './Student.css';

const StudentDashboard = () => {
  const stats = [
    {
      label: 'My Courses',
      value: '6',
      icon: <BookOpen size={28} />,
      color: '#667eea',
    },
    {
      label: 'Assignments',
      value: '8',
      icon: <ClipboardList size={28} />,
      color: '#48bb78',
    },
    {
      label: 'Upcoming Exams',
      value: '2',
      icon: <Calendar size={28} />,
      color: '#ed8936',
    },
    {
      label: 'Average Grade',
      value: 'A-',
      icon: <BarChart3 size={28} />,
      color: '#9f7aea',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            variant="stat"
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;

