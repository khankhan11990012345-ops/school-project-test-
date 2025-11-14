import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { ViewButton, AddButton } from '../../components/Button/iconbuttons';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ViewForm } from '../../components/Form';
import { CreateFormModal } from '../../components/Form';
import { FormField } from '../../components/Form/CreateForm';
import api from '../../services/api';
import { Exam, Grade } from '../../types';
import '../../styles/universal.css';
import './Teacher.css';

const TeacherExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // @ts-ignore - State kept for future implementation
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

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

  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

  const handleGradeExam = (examId: number | string) => {
    navigate(`/dashboard/teacher/exams/grade/${examId}`);
  };

  const handleCreateExam = async (data: Record<string, any>) => {
    const newExam: Exam = {
      id: exams.length > 0 ? Math.max(...exams.map(e => typeof e.id === 'number' ? e.id : Number(e.id) || 0)) + 1 : 1,
      name: data.name,
      subject: data.subject,
      grades: Array.isArray(data.grades) ? data.grades : [data.grades],
      classes: Array.isArray(data.grades) ? data.grades : [data.grades], // Use grades as classes for now
      date: data.date,
      time: data.time,
      duration: data.duration,
      totalMarks: parseInt(data.totalMarks),
      passingMarks: data.passingMarks ? parseInt(data.passingMarks) : undefined,
      description: data.description || '',
      sections: [],
      gradeAssignments: [],
      status: 'Scheduled',
      createdAt: new Date().toISOString().split('T')[0],
    };
    await api.exams.create(newExam);
    const response = await api.exams.getAll() as any;
    if (response.data?.exams) {
      setExams(response.data.exams);
    }
    setIsCreateModalOpen(false);
    alert('Exam created successfully!');
  };

  const [subjects, setSubjects] = useState<any[]>([]);
  const [gradeOptions, setGradeOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await api.subjects.getAll() as any;
        if (response.data?.subjects) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    const loadGradeOptions = async () => {
      try {
        const response = await api.grades.getAll() as any;
        if (response.data?.classes) {
          const gradeMap = new Map<string, Partial<Grade>>();
          response.data.classes.forEach((c: any) => {
            const gradeKey = c.grade || 'Unknown';
            if (!gradeMap.has(gradeKey)) {
              const gradeClasses = response.data.classes.filter((cls: any) => (cls.grade || 'Unknown') === gradeKey);
              gradeMap.set(gradeKey, {
                id: gradeKey,
                name: gradeKey,
                status: gradeClasses[0]?.status || 'Active',
                section: '',
                capacity: 0,
                currentStudents: 0,
                description: '',
              } as Grade);
            }
          });
          const grades = Array.from(gradeMap.values());
          const options = grades
            .filter(g => g.status === 'Active' && g.id && g.name)
            .map(g => ({ value: String(g.id), label: String(g.name) }));
          setGradeOptions(options);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };
    loadGradeOptions();
  }, []);

  const subjectOptions = subjects.map(s => ({ value: s.name, label: s.name }));

  const examFields: FormField[] = [
    { name: 'name', label: 'Exam Name', type: 'text', required: true, spanFull: true },
    { name: 'subject', label: 'Subject', type: 'select', options: subjectOptions, required: true },
    { name: 'grades', label: 'Grades', type: 'select', multiple: true, options: gradeOptions, required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time', type: 'time', required: true },
    { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 2 hours' },
    { name: 'totalMarks', label: 'Total Marks', type: 'number', required: true },
    { name: 'passingMarks', label: 'Passing Marks', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea', spanFull: true },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Exams & Results</h1>
        <AddButton
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          title="Create New Exam"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Exam Name</th>
              <th>Subject</th>
              <th>Grades</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                  No exams found
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.id}</td>
                  <td>
                    <strong>{exam.name}</strong>
                  </td>
                  <td>{exam.subject}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {exam.grades && exam.grades.length > 0 ? (
                        exam.grades.map((grade, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {grade}
                          </Badge>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#999' }}>No grades</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} style={{ color: '#666' }} />
                      {exam.date}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: '#666' }} />
                      {exam.time}
                    </div>
                  </td>
                  <td>{exam.duration}</td>
                  <td>
                    <strong>{exam.totalMarks}</strong>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(exam.status)} size="sm">
                      {exam.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <ViewButton size="sm" onClick={() => handleViewExam(exam)} />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGradeExam(typeof exam.id === 'number' ? exam.id : Number(exam.id) || 0)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Grade
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                    renderAsBadge: { variant: getStatusVariant(selectedExam.status) as any, size: 'sm' },
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
                      ? selectedExam.grades.map((grade, idx) => (
                          <Badge key={idx} variant="info" size="sm" style={{ marginRight: '0.25rem' }}>
                            {grade}
                          </Badge>
                        ))
                      : 'No grades assigned',
                    spanFull: true,
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Create Exam Modal */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Exam"
        fields={examFields}
        onSubmit={handleCreateExam}
        submitButtonText="Create Exam"
      />
    </div>
  );
};

export default TeacherExams;

