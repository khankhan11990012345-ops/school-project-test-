import { BookOpen, Clock, Calendar, User } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import '../../styles/universal.css';
import './Student.css';

const MyCourses = () => {
  const courses = [
    {
      id: 1,
      name: 'Mathematics 101',
      teacher: 'Dr. Smith',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      credits: 3,
      grade: 'A',
    },
    {
      id: 2,
      name: 'Physics 201',
      teacher: 'Prof. Johnson',
      schedule: 'Tue, Thu - 2:00 PM',
      credits: 4,
      grade: 'B+',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Courses</h1>
      </div>
      <div className="courses-grid">
        {courses.map((course) => (
          <Card key={course.id} variant="custom" className="course-card">
            <div className="course-header">
              <BookOpen size={24} style={{ color: '#667eea' }} />
              <h3>{course.name}</h3>
            </div>
            <div className="course-details">
              <div className="course-detail-item">
                <User size={18} />
                <span>{course.teacher}</span>
              </div>
              <div className="course-detail-item">
                <Calendar size={18} />
                <span>{course.schedule}</span>
              </div>
              <div className="course-detail-item">
                <Clock size={18} />
                <span>{course.credits} Credits</span>
              </div>
              <div className="course-grade">
                <Badge variant="success" size="sm">Grade: {course.grade}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;

