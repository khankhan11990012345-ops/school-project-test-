import { BookOpen, Users, FileText, Calendar } from 'lucide-react';
import { Card } from '../../components/Card';
import '../../styles/universal.css';
import './Teacher.css';

const TeacherDashboard = () => {
  const stats = [
    {
      label: 'My Classes',
      value: '5',
      icon: <BookOpen size={28} />,
      color: '#667eea',
    },
    {
      label: 'Total Students',
      value: '142',
      icon: <Users size={28} />,
      color: '#48bb78',
    },
    {
      label: 'Assignments',
      value: '12',
      icon: <FileText size={28} />,
      color: '#ed8936',
    },
    {
      label: 'Upcoming Exams',
      value: '3',
      icon: <Calendar size={28} />,
      color: '#9f7aea',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
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

export default TeacherDashboard;

