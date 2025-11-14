import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, BookOpen, Mail, Phone, Award } from 'lucide-react';
import { ViewForm } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import { BigCalendar, ScheduleItem } from '../../../components/Calendar';
import api from '../../../services/api';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Teachers.css';

const TeacherDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadTeacherData = async () => {
        try {
          setLoading(true);
          
          // Load teacher
          const teacherResponse = await api.teachers.getById(id) as any;
          const teacherData = teacherResponse?.data?.teacher || teacherResponse?.data || teacherResponse;
          
          if (teacherData) {
            setTeacher(teacherData);
            
            // Load subjects assigned to this teacher
            try {
              const subjectsResponse = await api.subjects.getAll() as any;
              const allSubjects = subjectsResponse?.data?.subjects || subjectsResponse?.data || subjectsResponse || [];
              const subjectsArray = Array.isArray(allSubjects) ? allSubjects : [];
              
              console.log('All subjects loaded:', subjectsArray.length);
              console.log('Teacher data:', { _id: teacherData._id, id: teacherData.id });
              
              // Filter subjects assigned to this teacher
              const teacherMongoId = (teacherData._id || teacherData.id || '').toString();
              
              const teacherSubjects = subjectsArray.filter((subject: any) => {
                let isAssigned = false;
                
                // Check new format: teacherAssignments array
                if (subject.teacherAssignments && Array.isArray(subject.teacherAssignments)) {
                  isAssigned = subject.teacherAssignments.some((assignment: any) => {
                    if (assignment.teacherId) {
                      const assignmentTeacherId = typeof assignment.teacherId === 'object' 
                        ? (assignment.teacherId._id || assignment.teacherId.id || '').toString()
                        : assignment.teacherId.toString();
                      return String(assignmentTeacherId) === String(teacherMongoId);
                    }
                    return false;
                  });
                }
                
                // Check old format: teacherId (for backward compatibility)
                if (!isAssigned && subject.teacherId) {
                  const subjectTeacherId = typeof subject.teacherId === 'object' 
                    ? (subject.teacherId._id || subject.teacherId.id || '').toString()
                    : subject.teacherId.toString();
                  isAssigned = String(subjectTeacherId) === String(teacherMongoId);
                }
                
                // Only include subjects where teacher is assigned via teacherAssignments or teacherId
                // Schedule-level teacherId is handled separately when filtering schedule entries
                
                if (isAssigned) {
                  console.log('Found matching subject:', subject.name, 'Teacher assigned via:', 
                    subject.teacherAssignments ? 'teacherAssignments' : 'teacherId',
                    'with schedules:', subject.schedule?.length || 0);
                }
                
                return isAssigned;
              });
              
              console.log('Teacher subjects found:', teacherSubjects.length);
              
              // Build schedules from subjects
              const teacherSchedules: ScheduleItem[] = [];
              let scheduleId = 1;
              
              // Normalize day names to match BigCalendar expectations (capitalize first letter)
              const normalizeDayName = (day: string): string => {
                if (!day) return '';
                return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
              };
              
              teacherSubjects.forEach((subject: any) => {
                const subjectSchedules = Array.isArray(subject.schedule) ? subject.schedule : [];
                
                if (subjectSchedules.length === 0) {
                  console.log(`Subject "${subject.name}" has no schedules`);
                }
                
                subjectSchedules.forEach((sched: any) => {
                  if (!sched.day || !sched.startTime || !sched.endTime) {
                    console.warn('Invalid schedule entry:', sched);
                    return;
                  }
                  
                  // Check if this schedule entry is assigned to this teacher
                  // If schedule has teacherId, only include if it matches this teacher
                  // If schedule has no teacherId, include it (shared schedule for all teachers of this subject)
                  if (sched.teacherId) {
                    const scheduleTeacherId = typeof sched.teacherId === 'object' 
                      ? (sched.teacherId._id || sched.teacherId.id || '').toString()
                      : sched.teacherId.toString();
                    if (String(scheduleTeacherId) !== String(teacherMongoId)) {
                      // Skip this schedule entry if it's assigned to a different teacher
                      console.log(`Skipping schedule entry - assigned to different teacher: ${scheduleTeacherId} vs ${teacherMongoId}`);
                      return;
                    }
                    console.log(`Including schedule entry - assigned to this teacher: ${subject.name} on ${sched.day}`);
                  } else {
                    // No teacherId means shared schedule - include it
                    console.log(`Including shared schedule entry: ${subject.name} on ${sched.day}`);
                  }
                  
                  // Build class label from schedule's grade and section
                  let classLabel = 'N/A';
                  if (sched.grade && sched.section) {
                    // Format: "Grade 1 Section A"
                    const grade = sched.grade.trim();
                    const section = sched.section.trim();
                    // Remove "Section" prefix if present and handle comma-separated grades
                    const cleanSection = section.replace(/^Section\s*/i, '');
                    // If grade contains comma, take first one
                    const firstGrade = grade.split(',')[0].trim();
                    classLabel = `${firstGrade} Section ${cleanSection}`;
                  } else if (sched.grade) {
                    // Handle comma-separated grades
                    const firstGrade = sched.grade.split(',')[0].trim();
                    classLabel = firstGrade;
                  } else {
                    // Fallback to subject's grades if schedule doesn't have grade
                    const grades = Array.isArray(subject.grades) ? subject.grades : [];
                    if (grades.length > 0) {
                      classLabel = grades[0];
                    }
                  }
                  
                  // Normalize day name
                  const normalizedDay = normalizeDayName(sched.day);
                  
                  // Format time display
                  const formatTime = (time: string) => {
                    if (!time) return '';
                    // If time is in HH:MM format, convert to 12-hour format
                    if (time.includes(':')) {
                      const [hours, minutes] = time.split(':');
                      const hour = parseInt(hours, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes || '00'} ${ampm}`;
                    }
                    return time;
                  };
                  
                  const startTimeFormatted = formatTime(sched.startTime);
                  const endTimeFormatted = formatTime(sched.endTime);
                  
                  teacherSchedules.push({
                    id: scheduleId++,
                    day: normalizedDay,
                    time: `${startTimeFormatted} - ${endTimeFormatted}`,
                    subject: subject.name || 'Unknown Subject',
                    subjectCode: subject.code || subject.subjectCode || undefined,
                    class: classLabel,
                    room: sched.room || 'N/A',
                    startTime: sched.startTime,
                    endTime: sched.endTime,
                  });
                });
              });
              
              console.log('Total schedules built:', teacherSchedules.length);
              setSchedules(teacherSchedules);
              
              // Generate time slots from actual schedule times
              const allTimes = new Set<string>();
              teacherSchedules.forEach((sched) => {
                if (sched.startTime) {
                  const [hours] = sched.startTime.split(':');
                  const hour = parseInt(hours, 10);
                  // Round down to nearest hour for time slot
                  allTimes.add(`${hour.toString().padStart(2, '0')}:00`);
                }
                if (sched.endTime) {
                  const [hours] = sched.endTime.split(':');
                  const hour = parseInt(hours, 10);
                  // Round up to nearest hour for time slot
                  allTimes.add(`${hour.toString().padStart(2, '0')}:00`);
                }
              });
              
              // Sort time slots and ensure we have a reasonable range
              const sortedTimes = Array.from(allTimes).sort();
              if (sortedTimes.length > 0) {
                const firstHour = parseInt(sortedTimes[0].split(':')[0], 10);
                const lastHour = parseInt(sortedTimes[sortedTimes.length - 1].split(':')[0], 10);
                // Generate time slots from 1 hour before first to 1 hour after last
                const startHour = Math.max(7, firstHour - 1);
                const endHour = Math.min(18, lastHour + 2);
                const generatedSlots: string[] = [];
                for (let h = startHour; h <= endHour; h++) {
                  generatedSlots.push(`${h.toString().padStart(2, '0')}:00`);
                }
                setTimeSlots(generatedSlots);
              } else {
                // Default time slots if no schedules
                setTimeSlots(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
              }
            } catch (error) {
              console.error('Error loading subjects:', error);
              setSchedules([]);
            }
          } else {
            setTeacher(null);
          }
        } catch (error) {
          console.error('Error loading teacher:', error);
          setTeacher(null);
        } finally {
          setLoading(false);
        }
      };
      
      loadTeacherData();
    }
  }, [id]);

  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'active' ? 'active' : 'rejected';
  };

  // Format date to show only date without time
  const formatDateOnly = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return dateValue.toString();
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateValue.toString();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="page-container">
        <div className="page-header">
          <BackButton size="md" onClick={() => navigate('/dashboard/admin/teachers')} title="Back to Teachers" />
          <h1>Teacher Not Found</h1>
        </div>
        <p>The teacher you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton
            size="md"
            onClick={() => navigate('/dashboard/admin/teachers')}
            title="Back to Teachers"
          />
          <h1>{teacher.name}</h1>
        </div>
      </div>

      {/* Teacher Information Card */}
      <Card variant="custom" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <ViewForm
          columns={5}
          sections={[
            {
              title: 'Teacher Information',
              fields: [
                { label: 'Name', value: teacher.name },
                { label: 'Email', value: teacher.email, icon: Mail },
                { label: 'Phone', value: teacher.phone, icon: Phone },
                { label: 'Subject', value: teacher.subject, icon: BookOpen },
                { label: 'Experience', value: teacher.experience, icon: Award },
                ...(teacher.qualification ? [{ label: 'Qualification', value: teacher.qualification }] : []),
                ...(teacher.joinDate ? [{ label: 'Join Date', value: formatDateOnly(teacher.joinDate), icon: Calendar }] : []),
                { 
                  label: 'Status', 
                  value: teacher.status, 
                  renderAsBadge: { variant: getStatusVariant(teacher.status) as any, size: 'sm' }
                },
                ...(teacher.city ? [{ label: 'City', value: teacher.city }] : []),
                ...(teacher.country ? [{ label: 'Country', value: teacher.country }] : []),
                ...(teacher.address ? [{ label: 'Address', value: teacher.address, icon: MapPin, spanFull: true }] : []),
              ],
            },
          ]}
        />
      </Card>

      {/* Schedule Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#333' }}>Teaching Schedule</h2>
        {schedules.length === 0 ? (
          <Card variant="custom" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              No schedule assigned yet. Assign this teacher to subjects with schedules to see their teaching schedule here.
            </p>
          </Card>
        ) : (
          <BigCalendar
            schedules={schedules}
            timeSlots={timeSlots}
            daysOfWeek={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
            cellHeight="100px"
          />
        )}
      </div>

    </div>
  );
};

export default TeacherDetails;

