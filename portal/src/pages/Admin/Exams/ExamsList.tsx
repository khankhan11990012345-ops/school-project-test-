import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { ViewButton, EditButton, AddButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Exams.css';

const ExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    // Load exams from API
    const loadExams = async () => {
      try {
        const response = await api.exams.getAll() as any;
        if (response.data?.exams) {
          setExams(response.data.exams);
        } else {
          setExams([]);
        }
      } catch (error) {
        console.error('Error loading exams:', error);
        setExams([]);
      }
    };
    
    loadExams();

    // Refresh interval
    const interval = setInterval(() => {
      loadExams();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'completed' ? 'approved' : status.toLowerCase() === 'scheduled' ? 'pending' : 'active';
  };

  // Helper function to extract compact grade format (e.g., "Grade 1A" -> "1A", "1 Section A" -> "1A", "1A" -> "1A")
  const getCompactGrade = (grade: string): string => {
    if (!grade) return '';
    
    // Handle format: "1 Section A", "2 Section B", etc.
    const sectionMatch = grade.match(/(\d+)\s+Section\s+([A-Z])/i);
    if (sectionMatch) {
      return `${sectionMatch[1]}${sectionMatch[2].toUpperCase()}`;
    }
    
    // Handle format: "Grade 1A", "Grade 2B", etc.
    const gradeMatch = grade.match(/Grade\s+(\d+)([A-Z])/i);
    if (gradeMatch) {
      return `${gradeMatch[1]}${gradeMatch[2].toUpperCase()}`;
    }
    
    // Handle format: "1A", "2B", etc. (already compact)
    const compactMatch = grade.match(/(\d+)([A-Z])/i);
    if (compactMatch) {
      return `${compactMatch[1]}${compactMatch[2].toUpperCase()}`;
    }
    
    // Handle format: "Grade 1 Sec A", "Grade 2 Sec B", etc.
    const gradeSecMatch = grade.match(/Grade\s+(\d+)\s+Sec\s+([A-Z])/i);
    if (gradeSecMatch) {
      return `${gradeSecMatch[1]}${gradeSecMatch[2].toUpperCase()}`;
    }
    
    // Handle format: "Grade 1 Section A", "Grade 2 Section B", etc.
    const gradeSectionMatch = grade.match(/Grade\s+(\d+)\s+Section\s+([A-Z])/i);
    if (gradeSectionMatch) {
      return `${gradeSectionMatch[1]}${gradeSectionMatch[2].toUpperCase()}`;
    }
    
    // If no match, try to extract any number and letter combination
    const fallbackMatch = grade.match(/(\d+).*?([A-Z])/i);
    if (fallbackMatch) {
      return `${fallbackMatch[1]}${fallbackMatch[2].toUpperCase()}`;
    }
    
    // If still no match, return cleaned string
    return grade.trim();
  };

  const handleFinishExam = async (examId: number | string) => {
    const exam = exams.find(e => e.id === examId || e._id === examId);
    if (!exam) {
      alert('Exam not found!');
      return;
    }
    
    if (confirm(`Are you sure you want to finish "${exam.name}"? This will mark the exam as completed and enable grading.`)) {
      try {
        // Update exam status to Completed
        await api.exams.update(examId, { status: 'Completed' }) as any;
        
        // Optimistically update the local state immediately
        setExams(prevExams => 
          prevExams.map(e => 
            (e.id === examId || e._id === examId) 
              ? { ...e, status: 'Completed' }
              : e
          )
        );
        
        // Reload exams from API to ensure consistency
        const response = await api.exams.getAll() as any;
        if (response.data?.exams) {
          setExams(response.data.exams);
        } else if (Array.isArray(response)) {
          setExams(response);
        }
        
        alert('Exam marked as completed! You can now proceed with grading.');
      } catch (error) {
        console.error('Error finishing exam:', error);
        // Revert optimistic update on error
        const response = await api.exams.getAll() as any;
        if (response.data?.exams) {
          setExams(response.data.exams);
        } else if (Array.isArray(response)) {
          setExams(response);
        }
        alert('Failed to finish exam. Please try again.');
      }
    }
  };

  const handleViewExam = async (examId: number | string) => {
    try {
      const response = await api.exams.getById(examId) as any;
      if (response.data?.exam) {
        setSelectedExam(response.data.exam);
        setIsViewModalOpen(true);
      } else if (response.exam) {
        setSelectedExam(response.exam);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Failed to load exam details.');
    }
  };

  const handleEditExam = (examId: number | string) => {
    navigate(`/dashboard/admin/exams/edit/${examId}`);
  };

  const handleDeleteExam = async (examId: number | string) => {
    const exam = exams.find(e => e.id === examId || e._id === examId);
    if (exam && confirm(`Are you sure you want to delete "${exam.name}"?`)) {
      try {
        await api.exams.delete(examId);
        const response = await api.exams.getAll() as any;
        if (response.data?.exams) {
          setExams(response.data.exams);
        } else if (Array.isArray(response)) {
          setExams(response);
        }
        alert('Exam deleted successfully!');
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam. Please try again.');
      }
    }
  };

  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    loadTeachers();
  }, []);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : `Teacher #${teacherId}`;
  };

  const columns: TableColumn<any>[] = [
    { key: 'id', header: 'ID' },
    {
      key: 'name',
      header: 'Exam Name',
      render: (value) => <strong>{value}</strong>,
    },
    { key: 'subject', header: 'Subject' },
    {
      key: 'grades',
      header: 'Grades',
      render: (_value, row) => {
        // Use classes if available, otherwise fall back to grades
        const gradeList = row.classes && row.classes.length > 0 ? row.classes : (row.grades || []);
        if (gradeList.length === 0) {
          return <span style={{ fontSize: '0.8rem', color: '#999' }}>No classes</span>;
        }
        
        // Extract compact grade formats and sort them
        const compactGrades = gradeList
          .map((grade: string) => getCompactGrade(grade))
          .filter((g: string) => g) // Remove empty strings
          .sort((a: string, b: string) => {
            // Sort by number first, then by letter
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b);
          });
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
            {compactGrades.map((grade: string, index: number) => (
              <Badge key={index} variant="info" size="sm">
                {grade}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => {
        // Format date to show only date part (YYYY-MM-DD)
        let formattedDate = value;
        if (value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toISOString().split('T')[0];
            }
          } catch (error) {
            // If parsing fails, try to extract date part from string
            const dateMatch = String(value).match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
              formattedDate = dateMatch[1];
            }
          }
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} style={{ color: '#666' }} />
            {formattedDate}
          </div>
        );
      },
    },
    {
      key: 'time',
      header: 'Time',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={14} style={{ color: '#666' }} />
          {value}
        </div>
      ),
    },
    { key: 'duration', header: 'Duration' },
    {
      key: 'sections',
      header: 'Sections',
      render: (_value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={14} style={{ color: '#666' }} />
          {row.sections?.length || 0}
        </div>
      ),
    },
    {
      key: 'totalMarks',
      header: 'Total Marks',
      render: (value) => <strong>{value}</strong>,
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
      render: (_value, row) => {
        // Handle both id and _id for exam identification
        const examId = row.id || row._id;
        const status = (row.status || 'Scheduled').toLowerCase();
        const isCompleted = status === 'completed' || status === 'finished';
        const canFinish = status === 'scheduled' || status === 'in progress';
        
        return (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ViewButton size="sm" onClick={() => handleViewExam(examId)} />
            {!isCompleted && <EditButton size="sm" onClick={() => handleEditExam(examId)} />}
            {canFinish && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleFinishExam(examId)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Finish Exam
              </Button>
            )}
            {isCompleted && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/dashboard/admin/exams/grade/${examId}`)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Grade
              </Button>
            )}
            <DeleteButton size="sm" onClick={() => handleDeleteExam(examId)} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Exams</h1>
        <AddButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/exams/create')}
          title="Create New Exam"
        />
      </div>
      <Table
        columns={columns}
        data={exams.slice(0, 10)}
        emptyMessage="No exams found"
      />

      {/* View Exam Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedExam(null);
        }}
        title="Exam Details"
        size="lg"
      >
        {selectedExam && (
          <ViewForm
            sections={[
              {
                title: 'Exam Information',
                icon: BookOpen,
                fields: [
                  { label: 'Exam Name', value: selectedExam.name },
                  { label: 'Subject', value: selectedExam.subject },
                  { label: 'Date', value: selectedExam.date, icon: Calendar },
                  { label: 'Time', value: selectedExam.time, icon: Clock },
                  { label: 'Duration', value: selectedExam.duration },
                  { label: 'Total Marks', value: selectedExam.totalMarks.toString() },
                  ...(selectedExam.passingMarks ? [{ label: 'Passing Marks', value: selectedExam.passingMarks.toString() }] : []),
                  { 
                    label: 'Status', 
                    value: selectedExam.status, 
                    renderAsBadge: { variant: getStatusVariant(selectedExam.status) as any, size: 'sm' }
                  },
                  ...(selectedExam.description ? [{ label: 'Description', value: selectedExam.description, spanFull: true }] : []),
                ],
              },
              {
                title: 'Assigned Grades',
                fields: [
                  {
                    label: 'Grades',
                    value: selectedExam.grades && selectedExam.grades.length > 0 
                      ? selectedExam.grades.map((grade: string, idx: number) => (
                          <Badge key={idx} variant="info" size="sm" style={{ marginRight: '0.25rem' }}>
                            {grade}
                          </Badge>
                        ))
                      : 'No grades assigned',
                    spanFull: true,
                  },
                ],
              },
              {
                title: 'Exam Sections',
                icon: FileText,
                fields: selectedExam.sections && selectedExam.sections.length > 0
                  ? selectedExam.sections.map((section: any, _idx: number) => ({
                      label: section.name,
                      value: `${section.marks} marks${section.description ? ` - ${section.description}` : ''}`,
                      spanFull: true,
                    }))
                  : [{ label: 'Sections', value: 'No sections defined', spanFull: true }],
              },
              {
                title: 'Grade Assignments',
                icon: Users,
                fields: selectedExam.gradeAssignments && selectedExam.gradeAssignments.length > 0
                  ? selectedExam.gradeAssignments.map((assignment: any, _idx: number) => ({
                      label: assignment.grade,
                      value: getTeacherName(assignment.teacherId),
                      spanFull: false,
                    }))
                  : [{ label: 'Assignments', value: 'No grade assignments', spanFull: true }],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default ExamsList;
