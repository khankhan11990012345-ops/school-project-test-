import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { ViewButton, EditButton, DeleteButton, AddButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Classes.css';

const GradesList = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [gradeSubjects, setGradeSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    // Load grades and students from API
    const loadGrades = async () => {
      try {
        // Fetch both grades and students
        const [gradesResponse, studentsResponse] = await Promise.all([
          api.grades.getAll() as any,
          api.students.getAll() as any,
        ]);

        // Handle different response structures
        let students: any[] = [];
        if (Array.isArray(studentsResponse)) {
          students = studentsResponse;
        } else if (studentsResponse?.data?.students) {
          students = studentsResponse.data.students;
        } else if (studentsResponse?.data && Array.isArray(studentsResponse.data)) {
          students = studentsResponse.data;
        } else if (studentsResponse?.students) {
          students = studentsResponse.students;
        }
        
        const activeStudents = Array.isArray(students) 
          ? students.filter((s: any) => (s.status === 'Active' || !s.status) && s.class)
          : [];


        if (gradesResponse.data?.classes) {
          // Show each class section as a separate entry
          const classesList = gradesResponse.data.classes.map((c: any) => {
            // Count students in this class (matching grade and section)
            const gradeName = c.grade || c.name || '';
            const section = c.section || '';
            
            // Match students by class (e.g., "Grade 1A" matches grade "Grade 1" and section "A")
            const studentsInClass = activeStudents.filter((s: any) => {
              const studentClass = (s.class || '').trim();
              if (!studentClass) return false;
              
              // Normalize grade name for comparison (ensure "Grade X" format)
              const normalizedGrade = gradeName.startsWith('Grade') ? gradeName : `Grade ${gradeName}`;
              
              // Check if student class starts with the grade name
              // e.g., "Grade 1A" should match grade "Grade 1"
              if (!studentClass.startsWith(normalizedGrade)) return false;
              
              // Extract section from student class (e.g., "Grade 1A" -> "A")
              // Remove the grade name and any spaces
              const studentSection = studentClass.replace(normalizedGrade, '').trim();
              
              // Compare sections (case-insensitive)
              return studentSection.toLowerCase() === section.toLowerCase();
            });

            const currentStudentsCount = studentsInClass.length;

            return {
              // Preserve all original data from backend first
              ...c,
              // Then override with calculated/display values
              id: c._id || c.code || c.id,
              name: c.grade || c.name || 'Unknown',
              section: c.section || '',
              capacity: c.capacity || 0,
              currentStudents: currentStudentsCount, // Use actual count from students (override backend value)
              description: c.description || '', // Use actual description from backend
              status: c.status || 'Active',
              code: c.code || '',
              room: c.room || '',
              schedule: c.schedule || '',
              teacher: c.teacher || '',
              classId: c._id, // Store the actual class ID for editing
            };
          });
          setGrades(classesList);
        } else {
          setGrades([]);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
        setGrades([]);
      }
    };
    
    loadGrades();

    // Refresh interval (since we can't use storage events for API)
    const interval = setInterval(() => {
      loadGrades();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleViewGrade = async (grade: any) => {
    setSelectedGrade(grade);
    setIsViewModalOpen(true);
    setLoadingSubjects(true);
    
    try {
      // Fetch all subjects
      const subjectsResponse = await api.subjects.getAll() as any;
      const subjects = subjectsResponse?.data?.subjects || subjectsResponse?.data || subjectsResponse || [];
      const subjectsArray = Array.isArray(subjects) ? subjects : [];
      
      // Filter subjects that have this grade level in their grades array
      const gradeName = grade.name || grade.grade || '';
      const subjectsForGrade = subjectsArray.filter((subject: any) => {
        const subjectGrades = subject.grades || [];
        return subjectGrades.includes(gradeName);
      });
      
      setGradeSubjects(subjectsForGrade);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setGradeSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };


  const handleEdit = (grade: any) => {
    // Use the actual class ID (_id) for editing
    const classId = grade.classId || grade._id || grade.id;
    navigate(`/dashboard/admin/classes/edit/${classId}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await api.grades.delete(String(id));
        // Reload grades and students to recalculate counts
        const [gradesResponse, studentsResponse] = await Promise.all([
          api.grades.getAll() as any,
          api.students.getAll() as any,
        ]);

        // Handle different response structures
        let students: any[] = [];
        if (Array.isArray(studentsResponse)) {
          students = studentsResponse;
        } else if (studentsResponse?.data?.students) {
          students = studentsResponse.data.students;
        } else if (studentsResponse?.data && Array.isArray(studentsResponse.data)) {
          students = studentsResponse.data;
        } else if (studentsResponse?.students) {
          students = studentsResponse.students;
        }
        
        const activeStudents = Array.isArray(students) 
          ? students.filter((s: any) => (s.status === 'Active' || !s.status) && s.class)
          : [];

        if (gradesResponse.data?.classes) {
          // Show each class section as a separate entry
          const classesList = gradesResponse.data.classes.map((c: any) => {
            // Count students in this class (matching grade and section)
            const gradeName = c.grade || c.name || '';
            const section = c.section || '';
            
            // Match students by class (e.g., "Grade 1A" matches grade "Grade 1" and section "A")
            const studentsInClass = activeStudents.filter((s: any) => {
              const studentClass = (s.class || '').trim();
              if (!studentClass) return false;
              
              // Normalize grade name for comparison (ensure "Grade X" format)
              const normalizedGrade = gradeName.startsWith('Grade') ? gradeName : `Grade ${gradeName}`;
              
              // Check if student class starts with the grade name
              // e.g., "Grade 1A" should match grade "Grade 1"
              if (!studentClass.startsWith(normalizedGrade)) return false;
              
              // Extract section from student class (e.g., "Grade 1A" -> "A")
              // Remove the grade name and any spaces
              const studentSection = studentClass.replace(normalizedGrade, '').trim();
              
              // Compare sections (case-insensitive)
              return studentSection.toLowerCase() === section.toLowerCase();
            });

            const currentStudentsCount = studentsInClass.length;

            return {
              // Preserve all original data from backend first
              ...c,
              // Then override with calculated/display values
              id: c._id || c.code || c.id,
              name: c.grade || c.name || 'Unknown',
              section: c.section || '',
              capacity: c.capacity || 0,
              currentStudents: currentStudentsCount, // Use actual count from students (override backend value)
              description: c.description || '',
              status: c.status || 'Active',
              code: c.code || '',
              room: c.room || '',
              schedule: c.schedule || '',
              teacher: c.teacher || '',
              classId: c._id,
            };
          });
          setGrades(classesList);
        }
        alert('Grade deleted successfully!');
      } catch (error) {
        console.error('Error deleting grade:', error);
        alert('Failed to delete grade. Please try again.');
      }
    }
  };

  const getStatusVariant = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
    return status === 'Active' ? 'success' : 'danger';
  };

  const columns: TableColumn<any>[] = [
    {
      key: 'name',
      header: 'Grade',
      render: (_value, row) => <strong>{row.name}</strong>,
    },
    {
      key: 'section',
      header: 'Section',
      render: (_value, row) => (
        <Badge variant="info" size="sm">Sec {row.section}</Badge>
      ),
    },
    { key: 'capacity', header: 'Capacity' },
    { key: 'currentStudents', header: 'Current Students' },
    {
      key: 'available',
      header: 'Available',
      render: (_value, row) => {
        const available = row.capacity - row.currentStudents;
        const usagePercent = (row.currentStudents / row.capacity) * 100;
        return (
          <div>
            <span style={{ color: available > 0 ? '#10b981' : '#ef4444' }}>
              {available}
            </span>
            <div
              style={{
                width: '60px',
                height: '4px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px',
                marginTop: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${usagePercent}%`,
                  height: '100%',
                  backgroundColor: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (value, row) => {
        const description = row.description || value || '';
        return (
          <span style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '300px', display: 'block' }}>
            {description || 'No description'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value as string)} size="sm">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ViewButton size="sm" onClick={() => handleViewGrade(row)} />
          <EditButton size="sm" onClick={() => handleEdit(row)} />
          <DeleteButton size="sm" onClick={() => handleDelete(row.classId || row._id || row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Classes (Grades)</h1>
        <AddButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/classes/add')}
          title="Add New Grade"
        />
      </div>
      <Table
        columns={columns}
        data={grades.slice(0, 10)}
        emptyMessage="No grades found"
      />

      {/* View Grade Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedGrade(null);
        }}
        title="Grade Details"
        size="lg"
      >
        {selectedGrade && (
          <ViewForm
            sections={[
              {
                title: 'Grade Information',
                icon: GraduationCap,
                fields: [
                  { label: 'Grade Name', value: selectedGrade.name, icon: GraduationCap },
                  { label: 'Section', value: `Section ${selectedGrade.section}`, icon: BookOpen },
                  { label: 'Student Capacity', value: selectedGrade.capacity.toString(), icon: Users },
                  { label: 'Current Students', value: selectedGrade.currentStudents.toString(), icon: Users },
                  { 
                    label: 'Available Spots', 
                    value: (selectedGrade.capacity - selectedGrade.currentStudents).toString(),
                  },
                  { 
                    label: 'Status', 
                    value: selectedGrade.status, 
                    renderAsBadge: { variant: getStatusVariant(selectedGrade.status) as any, size: 'sm' }
                  },
                  ...(selectedGrade.description ? [{ 
                    label: 'Description', 
                    value: selectedGrade.description, 
                    spanFull: true 
                  }] : []),
                  {
                    label: 'Assigned Subjects',
                    value: loadingSubjects 
                      ? 'Loading subjects...' 
                      : gradeSubjects.length === 0 
                        ? 'No subjects assigned' 
                        : gradeSubjects.map((s: any, index: number) => `${index + 1}. ${s.name}`).join('\n'),
                    spanFull: true,
                    customRender: (_value: any) => {
                      if (loadingSubjects) {
                        return <div style={{ color: '#6b7280' }}>Loading subjects...</div>;
                      }
                      if (gradeSubjects.length === 0) {
                        return <div style={{ color: '#6b7280' }}>No subjects assigned</div>;
                      }
                      return (
                        <div style={{ lineHeight: '1.8' }}>
                          {gradeSubjects.map((s: any, index: number) => (
                            <div key={s._id || s.id} style={{ marginBottom: '0.25rem' }}>
                              {index + 1}. {s.name} {s.code && `(${s.code})`}
                            </div>
                          ))}
                        </div>
                      );
                    },
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default GradesList;

