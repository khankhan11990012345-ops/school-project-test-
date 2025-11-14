import { BarChart3, FileText, TrendingUp, Users, GraduationCap, Settings, FilePlus } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Reports.css';

const ReportsOverview = () => {
  const reportCategories = [
    {
      title: 'Academic Reports',
      icon: <FileText size={24} />,
      description: 'View student academic performance and grades',
      count: 12,
      color: '#667eea',
    },
    {
      title: 'Attendance Reports',
      icon: <BarChart3 size={24} />,
      description: 'Track attendance statistics and trends',
      count: 8,
      color: '#764ba2',
    },
    {
      title: 'Financial Reports',
      icon: <TrendingUp size={24} />,
      description: 'Financial summaries and transactions',
      count: 15,
      color: '#f093fb',
    },
    {
      title: 'Student Reports',
      icon: <GraduationCap size={24} />,
      description: 'Individual student progress reports',
      count: 150,
      color: '#4facfe',
    },
    {
      title: 'Teacher Reports',
      icon: <Users size={24} />,
      description: 'Teacher performance and activity reports',
      count: 25,
      color: '#27ae60',
    },
    {
      title: 'Custom Reports',
      icon: <Settings size={24} />,
      description: 'Create and manage custom reports',
      count: 5,
      color: '#e74c3c',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports</h1>
        <Button variant="primary" size="md">
          <FilePlus size={18} />
          Generate New Report
        </Button>
      </div>
      <div className="reports-grid">
        {reportCategories.map((category) => (
          <Card key={category.title} variant="custom" className="report-card">
            <div className="report-icon" style={{ color: category.color }}>
              {category.icon}
            </div>
            <div className="report-content">
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <div className="report-count">
                <span>{category.count} Reports</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Reports
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsOverview;
