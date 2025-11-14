import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, BookOpen, Mail, Phone, GraduationCap } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { ViewForm } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import { BigCalendar, ScheduleItem } from '../../../components/Calendar';
import api from '../../../services/api';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Students.css';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadStudentData = async () => {
        try {
          setLoading(true);
          
          // Load student
          const studentResponse = await api.students.getById(id) as any;
          const studentData = studentResponse?.data?.student || studentResponse?.data || studentResponse;
          
          if (studentData) {
            setStudent(studentData);
            
            // Extract grade level and section from class
            const className = studentData.class || '';
            const studentSection = studentData.section || '';
            const gradeMatch = className.match(/Grade\s*(\d+)/i);
            const gradeLevel = gradeMatch ? `Grade ${gradeMatch[1]}` : '';
            
            // Load subjects and schedules for this student's grade and section
            if (gradeLevel) {
              try {
                const subjectsResponse = await api.subjects.getAll() as any;
                const allSubjects = subjectsResponse?.data?.subjects || subjectsResponse?.data || subjectsResponse || [];
                const subjectsArray = Array.isArray(allSubjects) ? allSubjects : [];
                
                // Filter subjects that have this grade in their grades array or teacherAssignments
                const gradeSubjects = subjectsArray.filter((subject: any) => {
                  // Check if subject has this grade in grades array
                  const subjectGrades = subject.grades || [];
                  const hasGrade = subjectGrades.includes(gradeLevel);
                  
                  // Check if subject has teacher assignments for this grade
                  const teacherAssignments = subject.teacherAssignments || [];
                  const hasGradeInAssignments = teacherAssignments.some((assignment: any) => {
                    const gradeSections = assignment.gradeSections || [];
                    return gradeSections.some((gs: any) => {
                      return gs.grade === gradeLevel && (!studentSection || gs.sections?.includes(studentSection));
                    });
                  });
                  
                  return hasGrade || hasGradeInAssignments;
                });
                
                setSubjects(gradeSubjects);
                
                // Build schedules from subjects - filter by student's grade and section
                const studentSchedules: ScheduleItem[] = [];
                const timeSlotSet = new Set<string>();
                let scheduleId = 1;
                
                // Normalize day names to match BigCalendar expectations
                const normalizeDayName = (day: string): string => {
                  if (!day) return '';
                  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
                };
                
                gradeSubjects.forEach((subject: any) => {
                  const subjectSchedules = Array.isArray(subject.schedule) ? subject.schedule : [];
                  
                  subjectSchedules.forEach((scheduleEntry: any) => {
                    // Check if this schedule entry matches the student's grade and section
                    const scheduleGrade = (scheduleEntry.grade || '').trim();
                    const scheduleSection = (scheduleEntry.section || '').trim();
                    
                    // Normalize grade formats for comparison
                    // Extract grade number from both student grade and schedule grade
                    const studentGradeNum = gradeLevel.match(/\d+/)?.[0] || '';
                    const scheduleGradeNum = scheduleGrade.match(/\d+/)?.[0] || '';
                    
                    // Match if grade numbers match (handles "Grade 1", "Grade 1A", "1", etc.)
                    const gradeMatches = 
                      scheduleGradeNum === studentGradeNum ||
                      scheduleGrade === gradeLevel ||
                      scheduleGrade === className ||
                      (scheduleGrade && className.includes(scheduleGrade)) ||
                      (scheduleGrade && scheduleGrade.includes(gradeLevel));
                    
                    // Match section - be flexible with section matching
                    // If schedule has no section, it applies to all sections
                    // If schedule has section, it must match student's section
                    const sectionMatches = 
                      !scheduleSection || // No section specified in schedule = applies to all
                      scheduleSection === studentSection || // Exact match
                      scheduleSection.toUpperCase() === studentSection.toUpperCase() || // Case-insensitive
                      (studentSection && scheduleSection.includes(studentSection)) || // Contains match
                      (studentSection && studentSection.includes(scheduleSection)); // Reverse contains
                    
                    if (gradeMatches && sectionMatches && scheduleEntry.day && scheduleEntry.startTime && scheduleEntry.endTime) {
                      const normalizedDay = normalizeDayName(scheduleEntry.day);
                      
                      // Add time slots to set
                      timeSlotSet.add(scheduleEntry.startTime);
                      timeSlotSet.add(scheduleEntry.endTime);
                      
                      studentSchedules.push({
                        id: scheduleId++,
                        day: normalizedDay,
                        time: `${scheduleEntry.startTime} - ${scheduleEntry.endTime}`,
                        subject: subject.name,
                        class: className,
                        room: scheduleEntry.room || 'N/A',
                        startTime: scheduleEntry.startTime,
                        endTime: scheduleEntry.endTime,
                      });
                    }
                  });
                });
                
                // Sort time slots and create array
                const sortedTimeSlots = Array.from(timeSlotSet).sort((a, b) => {
                  const [aHour, aMin] = a.split(':').map(Number);
                  const [bHour, bMin] = b.split(':').map(Number);
                  return aHour * 60 + aMin - (bHour * 60 + bMin);
                });
                
                // Add default time slots if none found
                const defaultTimeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
                const finalTimeSlots = sortedTimeSlots.length > 0 ? sortedTimeSlots : defaultTimeSlots;
                
                console.log('[STUDENT SCHEDULE] Loaded schedules:', {
                  studentGrade: gradeLevel,
                  studentSection,
                  className,
                  subjectsCount: gradeSubjects.length,
                  schedulesCount: studentSchedules.length,
                  timeSlots: finalTimeSlots,
                  subjects: gradeSubjects.map((s: any) => ({
                    name: s.name,
                    scheduleCount: (s.schedule || []).length,
                    schedules: (s.schedule || []).map((sch: any) => ({
                      day: sch.day,
                      grade: sch.grade,
                      section: sch.section,
                      time: `${sch.startTime}-${sch.endTime}`
                    }))
                  }))
                });
                
                setSchedules(studentSchedules);
                setTimeSlots(finalTimeSlots);
              } catch (error) {
                console.error('Error loading subjects and schedules:', error);
                setSubjects([]);
                setSchedules([]);
              }
            }
          } else {
            setStudent(null);
          }
        } catch (error) {
          console.error('Error loading student:', error);
          setStudent(null);
        } finally {
          setLoading(false);
        }
      };
      
      loadStudentData();
    }
  }, [id]);

  const getStatusVariant = (status: string) => {
    return status?.toLowerCase() === 'active' ? 'active' : 'rejected';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Student not found</p>
          <BackButton 
            size="md" 
            onClick={() => navigate('/dashboard/admin/students')}
            title="Back to Students"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '0.5rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '0.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/students')}
          title="Back to Students"
        />
      </div>

      {/* Student Information Card */}
      <Card variant="custom" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <ViewForm
          columns={8}
          sections={[
            {
              title: 'Student Information',
              fields: [
                { label: 'Student ID', value: student.studentId || student.id || 'N/A' },
                { label: 'Name', value: student.name },
                { label: 'Gender', value: student.gender || 'N/A' },
                { 
                  label: 'Status', 
                  value: student.status || 'Active', 
                  renderAsBadge: { variant: getStatusVariant(student.status) as any, size: 'sm' }
                },
                { label: 'Class', value: student.class || 'N/A', icon: GraduationCap },
                { label: 'Section', value: student.section || 'N/A' },
                ...(student.dateOfBirth ? [{ 
                  label: 'Date of Birth', 
                  value: new Date(student.dateOfBirth).toLocaleDateString(), 
                  icon: Calendar 
                }] : []),
                { label: 'Phone', value: student.phone, icon: Phone },
                { label: 'Email', value: student.email, icon: Mail },
                ...(student.admissionDate ? [{ 
                  label: 'Admission Date', 
                  value: new Date(student.admissionDate).toLocaleDateString(), 
                  icon: Calendar,
                  span: 2
                }] : []),
                ...(student.address ? [{ label: 'Address', value: student.address, icon: MapPin }] : []),
                ...(student.previousSchool ? [{ label: 'Previous School', value: student.previousSchool }] : []),
              ],
            },
            {
              title: 'Parent/Guardian Information',
              icon: Users,
              columns: 5,
              fields: [
                { label: 'Parent/Guardian Name', value: student.parent || 'N/A' },
                ...(student.parentPhone ? [{ label: 'Parent Phone', value: student.parentPhone, icon: Phone }] : []),
                ...(student.parentEmail ? [{ label: 'Parent Email', value: student.parentEmail, icon: Mail }] : []),
              ],
            },
          ]}
        />
      </Card>

      {/* Subjects Section */}
      {subjects.length > 0 && (
        <Card variant="custom" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} />
            Subjects ({subjects.length})
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {subjects.map((subject: any, index: number) => (
              <Badge key={subject._id || subject.id || index} variant="info" size="md">
                {subject.name} {subject.code && `(${subject.code})`}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Class Schedule Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} />
          Class Schedule
        </h2>
        {schedules.length > 0 ? (
          <BigCalendar
            schedules={schedules}
            timeSlots={timeSlots}
            daysOfWeek={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
            cellHeight="100px"
          />
        ) : (
          <Card variant="custom" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              No schedule available for this student. Assign subjects with schedules to this student's grade and section to see their class schedule here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;

