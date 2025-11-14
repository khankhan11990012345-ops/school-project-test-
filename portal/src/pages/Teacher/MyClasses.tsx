import { BookOpen, Users, Clock, Calendar } from 'lucide-react';
import { Card } from '../../components/Card';
import '../../styles/universal.css';
import './Teacher.css';

const MyClasses = () => {
  const classes = [
    {
      id: 1,
      name: 'Mathematics 101',
      students: 28,
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Room 201',
    },
    {
      id: 2,
      name: 'Physics 201',
      students: 24,
      schedule: 'Tue, Thu - 2:00 PM',
      room: 'Room 305',
    },
    {
      id: 3,
      name: 'Chemistry 101',
      students: 30,
      schedule: 'Mon, Wed - 11:00 AM',
      room: 'Lab 102',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Classes</h1>
      </div>
      <div className="classes-grid">
        {classes.map((classItem) => (
          <Card key={classItem.id} variant="custom" className="class-card">
            <div className="class-header">
              <BookOpen size={24} style={{ color: '#667eea' }} />
              <h3>{classItem.name}</h3>
            </div>
            <div className="class-details">
              <div className="class-detail-item">
                <Users size={18} />
                <span>{classItem.students} Students</span>
              </div>
              <div className="class-detail-item">
                <Calendar size={18} />
                <span>{classItem.schedule}</span>
              </div>
              <div className="class-detail-item">
                <Clock size={18} />
                <span>{classItem.room}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;

