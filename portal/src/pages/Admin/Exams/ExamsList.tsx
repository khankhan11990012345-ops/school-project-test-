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

  const handleViewExam = async (examId: number) => {
    try {
      const response = await api.exams.getById(examId) as any;
      if (response.data?.exam) {
        setSelectedExam(response.data.exam);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading exam:', error);
    }
  };

  const handleEditExam = (examId: number) => {
    navigate(`/dashboard/admin/exams/edit/${examId}`);
  };

  const handleDeleteExam = async (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    if (exam && confirm(`Are you sure you want to delete "${exam.name}"?`)) {
      try {
        await api.exams.delete(examId);
        const response = await api.exams.getAll() as any;
        if (response.data?.exams) {
          setExams(response.data.exams);
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
      render: (_value, row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {row.grades && row.grades.length > 0 ? (
            row.grades.map((grade: string, index: number) => (
              <Badge key={index} variant="info" size="sm">
                {grade}
              </Badge>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#999' }}>No grades</span>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: '#666' }} />
          {value}
        </div>
      ),
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
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ViewButton size="sm" onClick={() => handleViewExam(row.id)} />
          <EditButton size="sm" onClick={() => handleEditExam(row.id)} />
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/dashboard/admin/exams/grade/${row.id}`)}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            Grade
          </Button>
          <DeleteButton size="sm" onClick={() => handleDeleteExam(row.id)} />
        </div>
      ),
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
