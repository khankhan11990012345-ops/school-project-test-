import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Check, Tag, Award, FileText, FolderOpen, GraduationCap, Clock, Calendar } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { CreateFormModal, FormField, ViewForm } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { TeacherSubjectAssignment, Grade } from '../../../types';
import '../../../styles/universal.css';
import './Subjects.css';

const SubjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherSubjectAssignment | null>(null);
  const [subjectData, setSubjectData] = useState<any>(null);
  // Assigned teachers with grade assignments - MUST be before any conditional returns
  const [assignedTeachers, setAssignedTeachers] = useState<TeacherSubjectAssignment[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);

  useEffect(() => {
    // Only load if we have a valid, non-empty id string
    if (typeof id !== 'string' || id.trim() === '') {
      console.log('Skipping subject load - no valid ID', { id, idType: typeof id });
      return;
    }

    const loadSubject = async () => {
      try {
        console.log('Loading subject with ID:', id);
        const response = await api.subjects.getById(id) as any;
        
        if (response?.data?.subject) {
          const subject = response.data.subject;
          setSubjectData(subject);
          
          // Process teacher assignments - will be updated when teachers are loaded
          processTeacherAssignments(subject, allTeachers);
        } else {
          console.error('Subject not found in response:', response);
          // Show user-friendly message
          setSubjectData(null);
        }
      } catch (error: any) {
        console.error('Error loading subject:', error);
        const errorMessage = error?.errorData?.message || error?.message || 'Failed to load subject';
        console.error('Subject loading error details:', errorMessage);
        // Set subjectData to null to show loading state, but we could also show an error message
        setSubjectData(null);
      }
    };
    
    loadSubject();
  }, [id]);

  // Process teacher assignments when subject data or teachers change
  const processTeacherAssignments = (subject: any, teachers: any[]) => {
    const assignments: TeacherSubjectAssignment[] = [];
    
    // Check if subject has teacherAssignments array (new format)
    if (subject.teacherAssignments && Array.isArray(subject.teacherAssignments)) {
      subject.teacherAssignments.forEach((assignment: any, index: number) => {
        if (assignment.teacherId) {
          const teacher = typeof assignment.teacherId === 'object' 
            ? assignment.teacherId 
            : teachers.find(t => (t._id || t.id) === assignment.teacherId);
          
          if (teacher) {
            // Build grades array from gradeSections
            const grades: string[] = [];
            if (assignment.gradeSections && Array.isArray(assignment.gradeSections)) {
              assignment.gradeSections.forEach((gs: any) => {
                if (gs.sections && gs.sections.length > 0) {
                  gs.sections.forEach((section: string) => {
                    grades.push(`${gs.grade}${section}`);
                  });
                } else {
                  grades.push(gs.grade);
                }
              });
            }
            
            assignments.push({
              id: index + 1,
              subjectId: subject._id || subject.id,
              teacherId: teacher._id || teacher.id,
              teacherName: teacher.name || 'Unknown',
              teacherEmail: teacher.email || 'N/A',
              experience: teacher.experience || 'N/A',
              status: teacher.status || 'Active',
              grades: grades,
            });
          }
        }
      });
    } else if (subject.teacherId) {
      // Fallback to old format (single teacherId)
      const teacher = typeof subject.teacherId === 'object' 
        ? subject.teacherId 
        : teachers.find(t => (t._id || t.id) === subject.teacherId);
      
      if (teacher) {
        assignments.push({
          id: 1,
          subjectId: subject._id || subject.id,
          teacherId: teacher._id || teacher.id,
          teacherName: teacher.name || 'Unknown',
          teacherEmail: teacher.email || 'N/A',
          experience: teacher.experience || 'N/A',
          status: teacher.status || 'Active',
          grades: subject.grades || [],
        });
      }
    }
    
    setAssignedTeachers(assignments);
  };

  // Update teacher assignments when teachers are loaded
  useEffect(() => {
    if (subjectData && allTeachers.length > 0) {
      processTeacherAssignments(subjectData, allTeachers);
    }
  }, [subjectData, allTeachers.length]);

  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          const teachers = Array.isArray(response.data.teachers) 
            ? response.data.teachers.filter((t: any) => t != null) // Filter out null/undefined
            : [];
          setAllTeachers(teachers);
          if (subjectData) {
            const filtered = teachers.filter((teacher: any) => {
              if (!teacher) return false;
              const teacherId = teacher._id || teacher.id || teacher.mongoId;
              return !assignedTeachers.some(assigned => 
                String(assigned.teacherId) === String(teacherId)
              );
            });
            setAvailableTeachers(filtered);
          } else {
            setAvailableTeachers(teachers);
          }
        } else {
          setAllTeachers([]);
          setAvailableTeachers([]);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        setAllTeachers([]);
        setAvailableTeachers([]);
      }
    };
    loadTeachers();
  }, [subjectData, assignedTeachers.length]); // Only depend on length to avoid infinite loops

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const response = await api.grades.getAll() as any;
        if (response.data?.classes) {
          const gradeMap = new Map<string, Grade>();
          response.data.classes.forEach((c: any) => {
            const gradeKey = c.grade || 'Unknown';
            if (!gradeMap.has(gradeKey)) {
              const gradeClasses = response.data.classes.filter((cls: any) => (cls.grade || 'Unknown') === gradeKey);
              gradeMap.set(gradeKey, {
                id: gradeKey,
                name: gradeKey,
                section: '',
                capacity: 0,
                currentStudents: 0,
                description: '',
                status: gradeClasses[0]?.status || 'Active',
              } as Grade);
            }
          });
          const grades = Array.from(gradeMap.values());
          const options = grades
            .filter(g => g.status === 'Active')
            .map(g => ({ value: g.id, label: g.name }));
        setGradeOptions(options);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };
    loadGrades();
  }, []);

  if (!subjectData) {
    return (
      <div className="page-container">
        <div style={{ marginBottom: '1.5rem' }}>
          <BackButton 
            size="md" 
            onClick={() => navigate('/dashboard/admin/subjects')}
            title="Back to Subjects"
          />
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading subject details...</p>
          {id && typeof id === 'string' && id.trim() !== '' && (
            <p style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.5rem' }}>
              If this message persists, the subject may not exist.
            </p>
          )}
        </div>
      </div>
    );
  }

  // @ts-ignore - Function kept for future implementation
  const handleRemoveTeacher = (assignmentId: number) => {
    if (confirm('Are you sure you want to remove this teacher assignment?')) {
      // TODO: Implement remove teacher assignment API
      // await api.subjects.removeTeacherAssignment(subjectData.id, assignmentId);
      setAssignedTeachers(prev => prev.filter(t => t.id !== assignmentId));
      alert('Teacher assignment removed successfully!');
    }
  };

  const assignTeacherFields: FormField[] = [
    {
      name: 'teacher',
      label: 'Select Teacher',
      type: 'select',
      required: true,
      options: availableTeachers
        .filter(t => t != null) // Filter out any null/undefined values
        .map(t => ({
          value: (t._id || t.id || t.mongoId || '').toString(),
          label: `${t.name || 'Unknown'} (${t.experience || 'N/A'})`,
        })),
    },
    {
      name: 'grades',
      label: 'Assign to Grades',
      type: 'select',
      required: true,
      multiple: true,
      placeholder: 'Select grades this teacher will teach',
      options: gradeOptions.filter(option => 
        subjectData.grades?.includes(option.value)
      ),
    },
  ];

  const editAssignmentFields: FormField[] = [
    {
      name: 'grades',
      label: 'Assign to Grades',
      type: 'select',
      required: true,
      multiple: true,
      placeholder: 'Select grades this teacher will teach',
      options: gradeOptions.filter(option => 
        subjectData.grades?.includes(option.value)
      ),
    },
  ];

  const handleAssignTeacher = (data: Record<string, any>) => {
    if (!subjectData) return;
    
    const teacherId = data.teacher;
    const teacher = availableTeachers.find(t => 
      String(t._id || t.id || t.mongoId) === String(teacherId)
    );
    if (teacher) {
      const grades = Array.isArray(data.grades) ? data.grades : [];
      // TODO: Implement add teacher assignment API
      // const response = await api.subjects.addTeacherAssignment(subjectData._id, {
      const newAssignment: TeacherSubjectAssignment = {
        subjectId: subjectData._id || subjectData.id || subjectData.mongoId,
        teacherId: teacher._id || teacher.id || teacher.mongoId,
        teacherName: teacher.name,
        teacherEmail: teacher.email || 'N/A',
        experience: teacher.experience || 'N/A',
        status: teacher.status || 'Active',
        grades: grades,
        id: Date.now(), // Temporary ID
      };
      setAssignedTeachers(prev => [...prev, newAssignment]);
      setIsAssignTeacherModalOpen(false);
      alert(`Teacher ${teacher.name} assigned successfully to ${grades.join(', ')}!`);
    }
  };

  // @ts-ignore - Function kept for future implementation
  const handleEditAssignment = (assignment: TeacherSubjectAssignment) => {
    setEditingAssignment(assignment);
    setIsEditAssignmentModalOpen(true);
  };

  const handleUpdateAssignment = (data: Record<string, any>) => {
    if (!editingAssignment) return;
    
    const grades = Array.isArray(data.grades) ? data.grades : [];
    // TODO: Implement update teacher assignment API
    // const response = await api.subjects.updateTeacherAssignment(subjectData.id, editingAssignment.id, { grades });
    const updated: TeacherSubjectAssignment = {
      ...editingAssignment,
      grades: grades,
    };
    
    if (updated) {
      setAssignedTeachers(prev => 
        prev.map(a => a.id === updated.id ? updated : a)
      );
      setIsEditAssignmentModalOpen(false);
      setEditingAssignment(null);
      alert(`Grades updated successfully for ${updated.teacherName}!`);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/subjects')}
          title="Back to Subjects"
        />
      </div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '0.875rem' }}>Subject Details: {subjectData.name}</h1>
      </div>

      {/* Subject Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
        <Card
          variant="stat"
          icon={<BookOpen size={28} />}
          value={subjectData.name}
          label="Subject Name"
          color="#667eea"
          fontSize={0.65}
        />
        <Card
          variant="stat"
          icon={<Users size={28} />}
          value={assignedTeachers.length}
          label="Assigned Teachers"
          color="#48bb78"
          fontSize={0.65}
        />
        <Card
          variant="stat"
          icon={<FolderOpen size={28} />}
          value={subjectData.category}
          label="Category"
          color="#ed8936"
          fontSize={0.65}
        />
        <Card
          variant="stat"
          icon={<GraduationCap size={28} />}
          value={subjectData.credits}
          label="Credits"
          color="#9f7aea"
          fontSize={0.65}
        />
      </div>

      {/* Subject Information */}
      <Card variant="custom" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <ViewForm
          columns={6}
          sections={[
            {
              title: 'Subject Information',
              icon: BookOpen,
              fields: [
                { 
                  label: 'Subject Code', 
                  value: subjectData.code || 'N/A', 
                  icon: Tag 
                },
                { 
                  label: 'Category', 
                  value: subjectData.category || 'N/A', 
                  renderAsBadge: { variant: 'info', size: 'sm' }
                },
                { 
                  label: 'Level', 
                  value: subjectData.level || 'N/A', 
                  icon: Award 
                },
                { 
                  label: 'Credits', 
                  value: (subjectData.credits != null ? subjectData.credits : 0).toString(), 
                  icon: Award 
                },
                { 
                  label: 'Status', 
                  value: subjectData.status || 'Active', 
                  renderAsBadge: { 
                    variant: (subjectData.status?.toLowerCase() === 'active' ? 'success' : 'secondary'), 
                    size: 'sm' 
                  }
                },
                { 
                  label: 'Description', 
                  value: subjectData.description || 'No description available', 
                  icon: FileText
                },
                {
                  label: 'Assigned Grades',
                  value: subjectData.grades && subjectData.grades.length > 0 
                    ? subjectData.grades.join(', ') 
                    : 'No grades assigned',
                  icon: GraduationCap,
                  spanFull: true,
                },
              ],
            },
            ...(subjectData.schedule && subjectData.schedule.length > 0 ? [{
              title: 'Schedule',
              icon: Clock,
              fields: [],
              customContent: (() => {
                // Group schedule entries by grade, then by time, room, and section
                type ScheduleGroup = { days: string[], startTime: string, endTime: string, room: string, grade: string, section: string };
                const gradeMap = new Map<string, Map<string, ScheduleGroup>>();
                
                subjectData.schedule.forEach((sched: any) => {
                  const grade = sched.grade || 'Unknown';
                  const timeKey = `${sched.startTime || ''}_${sched.endTime || ''}_${sched.room || ''}_${sched.section || ''}`;
                  
                  if (!gradeMap.has(grade)) {
                    gradeMap.set(grade, new Map<string, ScheduleGroup>());
                  }
                  
                  const timeMap = gradeMap.get(grade)!;
                  
                  if (timeMap.has(timeKey)) {
                    const existing = timeMap.get(timeKey)!;
                    const day = sched.day || sched.days?.[0];
                    if (day && !existing.days.includes(day)) {
                      existing.days.push(day);
                    }
                  } else {
                    const day = sched.day || sched.days?.[0] || 'Monday';
                    timeMap.set(timeKey, {
                      days: [day],
                      startTime: sched.startTime || '',
                      endTime: sched.endTime || '',
                      room: sched.room || '',
                      grade: grade,
                      section: sched.section || '',
                    });
                  }
                });
                
                // Sort days in weekday order
                const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const dayAbbrMap: { [key: string]: string } = {
                  'Monday': 'Mon',
                  'Tuesday': 'Tue',
                  'Wednesday': 'Wed',
                  'Thursday': 'Thu',
                  'Friday': 'Fri',
                  'Saturday': 'Sat',
                  'Sunday': 'Sun',
                };
                
                // Extract grade number for sorting (e.g., "Grade 1" -> 1, "Grade 2" -> 2)
                const getGradeNumber = (grade: string): number => {
                  const match = grade.match(/\d+/);
                  return match ? parseInt(match[0], 10) : 999;
                };
                
                // Sort grades by number
                const sortedGrades = Array.from(gradeMap.keys()).sort((a, b) => {
                  return getGradeNumber(a) - getGradeNumber(b);
                });
                
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {sortedGrades.map((grade) => {
                      const timeMap = gradeMap.get(grade)!;
                      const scheduleGroups = Array.from(timeMap.values());
                      
                      // Sort sections alphabetically
                      scheduleGroups.sort((a, b) => {
                        if (a.section < b.section) return -1;
                        if (a.section > b.section) return 1;
                        return 0;
                      });
                      
                      return (
                        <div key={grade} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {grade}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                            {scheduleGroups.map((group, idx) => {
                              const sortedDays = group.days.sort((a, b) => {
                                return dayOrder.indexOf(a) - dayOrder.indexOf(b);
                              });
                              
                              const dayLabels = sortedDays.map(day => {
                                const abbr = dayAbbrMap[day] || day.substring(0, 3);
                                return `${abbr} ✓`;
                              }).join(', ');
                              
                              const scheduleValue = `${group.startTime} - ${group.endTime}${group.room ? ` (Room: ${group.room})` : ''}${group.section ? ` | Section: ${group.section}` : ''}`;
                              
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    {dayLabels}
                                  </label>
                                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                                    {scheduleValue}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })(),
            }] : []),
          ]}
        />
      </Card>

      {/* Assigned Teachers */}
      <Card variant="custom" style={{ padding: '1.5rem', fontSize: '1em' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
            Assigned Teachers
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignedTeachers.map((teacher) => {
            // Get schedule entries for this teacher
            const teacherSchedule = (subjectData.schedule || []).filter((sched: any) => {
              if (!sched.teacherId) return false;
              const scheduleTeacherId = typeof sched.teacherId === 'object' 
                ? (sched.teacherId._id || sched.teacherId.id || '').toString()
                : sched.teacherId.toString();
              return String(scheduleTeacherId) === String(teacher.teacherId);
            });
            
            // Group schedule entries by time, room, grade, and section
            const scheduleMap = new Map<string, { days: string[], startTime: string, endTime: string, room: string, grade: string, section: string }>();
            
            teacherSchedule.forEach((sched: any) => {
              const key = `${sched.startTime || ''}_${sched.endTime || ''}_${sched.room || ''}_${sched.grade || ''}_${sched.section || ''}`;
              
              if (scheduleMap.has(key)) {
                const existing = scheduleMap.get(key)!;
                const day = sched.day || sched.days?.[0];
                if (day && !existing.days.includes(day)) {
                  existing.days.push(day);
                }
              } else {
                const day = sched.day || sched.days?.[0] || 'Monday';
                scheduleMap.set(key, {
                  days: [day],
                  startTime: sched.startTime || '',
                  endTime: sched.endTime || '',
                  room: sched.room || '',
                  grade: sched.grade || '',
                  section: sched.section || '',
                });
              }
            });
            
            const scheduleGroups = Array.from(scheduleMap.values());
            const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const dayAbbrMap: { [key: string]: string } = {
              'Monday': 'Mon',
              'Tuesday': 'Tue',
              'Wednesday': 'Wed',
              'Thursday': 'Thu',
              'Friday': 'Fri',
              'Saturday': 'Sat',
              'Sunday': 'Sun',
            };
            
            return (
              <div key={teacher.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#333' }}>{teacher.teacherName}</h3>
                    <Badge variant={teacher.status.toLowerCase() === 'active' ? 'success' : 'secondary'} size="sm">
                      {teacher.status}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Email: {teacher.teacherEmail}</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>•</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Experience: {teacher.experience}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666', marginRight: '0.25rem' }}>Grades:</span>
                    {teacher.grades && teacher.grades.length > 0 ? (
                      teacher.grades.map((grade, index) => (
                        <Badge key={index} variant="info" size="sm">
                          {grade}
                        </Badge>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>No grades</span>
                    )}
                  </div>
                </div>
                
                {/* Schedule for this teacher */}
                {scheduleGroups.length > 0 ? (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} />
                      Teaching Schedule
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {scheduleGroups.map((group, idx) => {
                        const sortedDays = group.days.sort((a, b) => {
                          return dayOrder.indexOf(a) - dayOrder.indexOf(b);
                        });
                        
                        const dayLabels = sortedDays.map(day => {
                          const abbr = dayAbbrMap[day] || day.substring(0, 3);
                          return `${abbr} ✓`;
                        }).join(', ');
                        
                        const scheduleValue = `${group.startTime} - ${group.endTime}${group.room ? ` (Room: ${group.room})` : ''}${group.grade ? ` | Grade: ${group.grade}` : ''}${group.section ? ` | Section: ${group.section}` : ''}`;
                        
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.2rem', fontWeight: 500 }}>
                              <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                              {dayLabels}
                            </label>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>
                              {scheduleValue}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                      No schedule assigned yet for this teacher.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {assignedTeachers.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem', fontSize: '0.9rem' }}>
              No teachers assigned yet. Click "Assign Teacher" to add one.
            </div>
          )}
        </div>
      </Card>

      {/* Assign Teacher Modal */}
      <CreateFormModal
        isOpen={isAssignTeacherModalOpen}
        onClose={() => setIsAssignTeacherModalOpen(false)}
        title="Assign Teacher to Subject"
        fields={assignTeacherFields}
        onSubmit={handleAssignTeacher}
        submitButtonText="Assign Teacher"
        submitButtonIcon={<Check size={18} />}
        size="md"
      />

      {/* Edit Assignment Modal */}
      <CreateFormModal
        isOpen={isEditAssignmentModalOpen}
        onClose={() => {
          setIsEditAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        title={`Edit Grades for ${editingAssignment?.teacherName || 'Teacher'}`}
        fields={editAssignmentFields}
        onSubmit={handleUpdateAssignment}
        submitButtonText="Update Grades"
        submitButtonIcon={<Check size={18} />}
        size="md"
        initialData={editingAssignment ? { grades: editingAssignment.grades } : {}}
      />
    </div>
  );
};

export default SubjectDetails;

