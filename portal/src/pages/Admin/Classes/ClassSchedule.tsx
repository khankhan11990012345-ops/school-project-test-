import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Classes.css';

const ClassSchedule = () => {
  const scheduleData = [
    {
      day: 'Monday',
      classes: [
        { time: '9:00 AM', name: 'Mathematics 101', room: 'Room 201', students: 28 },
        { time: '11:00 AM', name: 'Chemistry 101', room: 'Lab 102', students: 30 },
        { time: '2:00 PM', name: 'Physics 201', room: 'Room 305', students: 24 },
      ],
    },
    {
      day: 'Tuesday',
      classes: [
        { time: '10:00 AM', name: 'English Literature', room: 'Room 105', students: 22 },
        { time: '2:00 PM', name: 'Physics 201', room: 'Room 305', students: 24 },
      ],
    },
    {
      day: 'Wednesday',
      classes: [
        { time: '9:00 AM', name: 'Mathematics 101', room: 'Room 201', students: 28 },
        { time: '11:00 AM', name: 'Chemistry 101', room: 'Lab 102', students: 30 },
        { time: '3:00 PM', name: 'History 101', room: 'Room 208', students: 18 },
      ],
    },
    {
      day: 'Thursday',
      classes: [
        { time: '10:00 AM', name: 'English Literature', room: 'Room 105', students: 22 },
        { time: '2:00 PM', name: 'Physics 201', room: 'Room 305', students: 24 },
      ],
    },
    {
      day: 'Friday',
      classes: [
        { time: '9:00 AM', name: 'Mathematics 101', room: 'Room 201', students: 28 },
        { time: '10:00 AM', name: 'English Literature', room: 'Room 105', students: 22 },
      ],
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Class Schedule</h1>
      </div>
      <div className="schedule-grid">
        {scheduleData.map((daySchedule) => (
          <Card key={daySchedule.day} variant="custom" className="schedule-day-card">
            <div className="schedule-day-header">
              <Calendar size={20} style={{ color: '#667eea' }} />
              <h3>{daySchedule.day}</h3>
            </div>
            <div className="schedule-classes">
              {daySchedule.classes.length > 0 ? (
                daySchedule.classes.map((classItem, index) => (
                  <div key={index} className="schedule-class-item">
                    <div className="schedule-class-time">
                      <Clock size={14} />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="schedule-class-info">
                      <div className="schedule-class-name">
                        <BookOpen size={16} />
                        <span>{classItem.name}</span>
                      </div>
                      <div className="schedule-class-details">
                        <span>{classItem.room}</span>
                        <Badge variant="info" size="sm">
                          <Users size={12} />
                          {classItem.students}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="schedule-empty">No classes scheduled</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClassSchedule;

