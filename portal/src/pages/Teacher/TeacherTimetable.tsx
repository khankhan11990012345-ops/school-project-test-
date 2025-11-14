import { Clock, MapPin, Users, BookOpen } from 'lucide-react';
import '../../styles/universal.css';
import './Teacher.css';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  subject: string;
  class: string;
  room: string;
  students: number;
}

const TeacherTimetable = () => {
  // In a real app, this would be fetched based on the logged-in teacher
  const schedules: ScheduleItem[] = [
    {
      id: 1,
      day: 'Monday',
      time: '09:00 AM - 10:30 AM',
      subject: 'Mathematics',
      class: 'Grade 10A',
      room: 'Room 101',
      students: 25,
    },
    {
      id: 2,
      day: 'Monday',
      time: '10:45 AM - 12:15 PM',
      subject: 'Mathematics',
      class: 'Grade 9B',
      room: 'Room 102',
      students: 28,
    },
    {
      id: 3,
      day: 'Monday',
      time: '01:00 PM - 02:30 PM',
      subject: 'Mathematics',
      class: 'Grade 11A',
      room: 'Room 201',
      students: 22,
    },
    {
      id: 4,
      day: 'Tuesday',
      time: '09:00 AM - 10:30 AM',
      subject: 'Mathematics',
      class: 'Grade 10B',
      room: 'Room 103',
      students: 24,
    },
    {
      id: 5,
      day: 'Tuesday',
      time: '10:45 AM - 12:15 PM',
      subject: 'Mathematics',
      class: 'Grade 9A',
      room: 'Room 104',
      students: 26,
    },
    {
      id: 6,
      day: 'Wednesday',
      time: '09:00 AM - 10:30 AM',
      subject: 'Mathematics',
      class: 'Grade 10A',
      room: 'Room 101',
      students: 25,
    },
    {
      id: 7,
      day: 'Wednesday',
      time: '01:00 PM - 02:30 PM',
      subject: 'Mathematics',
      class: 'Grade 11B',
      room: 'Room 202',
      students: 23,
    },
    {
      id: 8,
      day: 'Thursday',
      time: '09:00 AM - 10:30 AM',
      subject: 'Mathematics',
      class: 'Grade 10B',
      room: 'Room 103',
      students: 24,
    },
    {
      id: 9,
      day: 'Thursday',
      time: '10:45 AM - 12:15 PM',
      subject: 'Mathematics',
      class: 'Grade 9A',
      room: 'Room 104',
      students: 26,
    },
    {
      id: 10,
      day: 'Friday',
      time: '09:00 AM - 10:30 AM',
      subject: 'Mathematics',
      class: 'Grade 10A',
      room: 'Room 101',
      students: 25,
    },
    {
      id: 11,
      day: 'Friday',
      time: '01:00 PM - 02:30 PM',
      subject: 'Mathematics',
      class: 'Grade 11A',
      room: 'Room 201',
      students: 22,
    },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const groupedSchedules = daysOfWeek.map(day => ({
    day,
    items: schedules.filter(s => s.day === day),
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Timetable</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {groupedSchedules.map(({ day, items }) => (
          <div key={day} style={{ marginBottom: '1rem' }}>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e0e0e0',
              }}
            >
              {day}
            </h2>
            {items.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#999',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '0.5rem',
                  border: '1px solid #e0e0e0',
                }}
              >
                No classes scheduled
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem',
                }}
              >
                {items.map((schedule) => (
                  <div
                    key={schedule.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(31, 38, 135, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <BookOpen size={24} style={{ color: '#667eea' }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                          {schedule.subject}
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                          {schedule.class}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} style={{ color: '#666' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{schedule.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: '#666' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{schedule.room}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} style={{ color: '#666' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {schedule.students} Students
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherTimetable;

