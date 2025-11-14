import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, CheckCircle, Clock as ClockIcon, User, Award } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { ViewButton } from '../../components/Button/iconbuttons';
import { Modal } from '../../components/Modal';
import { ViewForm } from '../../components/Form';
import api from '../../services/api';
import { Exam, StudentExamGrade, ExamResult } from '../../types';
import '../../styles/universal.css';
import './Student.css';

// For now, using a mock student ID. In a real app, this would come from auth context
const CURRENT_STUDENT_ID = 1; // Alice Johnson - Grade 10A

interface PaperData {
  exam: Exam;
  status: 'Scheduled' | 'Submitted' | 'Graded';
  studentGrade?: StudentExamGrade;
  examResult?: ExamResult;
}

const Papers = () => {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current student
        const studentsResponse = await api.students.getAll() as any;
        if (!studentsResponse.data?.students) {
          setPapers([]);
          return;
        }
        const students = studentsResponse.data.students;
        const student = students.find((s: any) => s.id === CURRENT_STUDENT_ID);

        // Get all exams
        const examsResponse = await api.exams.getAll() as any;
        const allExams = examsResponse.data?.exams || [];
        
        // Get all exam results
        // TODO: Implement exam results API
        const examResults: ExamResult[] = [];

        // Filter exams that match student's class/grade
        const studentClass = student?.class || '';
        const studentGrade = studentClass.match(/Grade\s+(\d+)/)?.[1] 
          ? `Grade ${studentClass.match(/Grade\s+(\d+)/)?.[1]}`
          : '';

        const relevantExams = allExams.filter((exam: any) => {
          // First check if exam has specific classes assigned
          if (exam.classes && exam.classes.length > 0) {
            return exam.classes.includes(studentClass);
          }
          // Fallback to grades for backward compatibility
          if (exam.grades && exam.grades.length > 0) {
            return exam.grades.some((grade: string) => {
              const examGradeNum = grade.match(/Grade\s+(\d+)/)?.[1];
              const studentGradeNum = studentGrade.match(/Grade\s+(\d+)/)?.[1];
              return examGradeNum === studentGradeNum;
            });
          }
          return false;
        });

        // Map exams to paper data with status and grades
        const papersData: PaperData[] = relevantExams.map((exam: any) => {
          const examResult = examResults.find((er: ExamResult) => er.examId === exam.id);
          const studentGrade = examResult?.studentGrades.find((sg: StudentExamGrade) => sg.studentId === CURRENT_STUDENT_ID);

          let status: 'Scheduled' | 'Submitted' | 'Graded' = 'Scheduled';
          if (studentGrade) {
            status = 'Graded';
          } else if (examResult && examResult.studentGrades.length > 0) {
            // Exam has been graded for other students but not this one yet
            status = 'Submitted';
          } else if (exam.status === 'Completed') {
            // Exam is completed but no results yet
            status = 'Submitted';
          }

          return {
            exam,
            status,
            studentGrade,
            examResult,
          };
        });

        // Sort by exam date (most recent first)
        papersData.sort((a, b) => {
          const dateA = new Date(a.exam.date).getTime();
          const dateB = new Date(b.exam.date).getTime();
          return dateB - dateA;
        });

        setPapers(papersData);
      } catch (error) {
        console.error('Error loading papers:', error);
        setPapers([]);
      }
    };
    loadData();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'pending';
      case 'submitted':
        return 'info';
      case 'graded':
        return 'approved';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <ClockIcon size={16} />;
      case 'submitted':
        return <ClockIcon size={16} />;
      case 'graded':
        return <CheckCircle size={16} />;
      default:
        return <ClockIcon size={16} />;
    }
  };

  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers && Array.isArray(response.data.teachers)) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    loadTeachers();
  }, []);

  const getConductedBy = (exam: Exam): string => {
    // Get teacher name from gradeAssignments
    if (exam.gradeAssignments && exam.gradeAssignments.length > 0) {
      const teacherId = exam.gradeAssignments[0]?.teacherId;
      if (teacherId) {
        const teacher = teachers.find((t: any) => t.id === teacherId);
        if (teacher) {
          return teacher.name;
        }
      }
      return 'Teacher';
    }
    return 'Not Assigned';
  };

  const handleViewPaper = (paper: PaperData) => {
    setSelectedPaper(paper);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Papers</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Exam Date</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Conducted By</th>
              <th>Status</th>
              <th>Marks Obtained</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No papers found. Papers will appear here when exams are assigned to your class.
                </td>
              </tr>
            ) : (
              papers.map((paper) => {
                const { exam, status, studentGrade } = paper;
                return (
                  <tr key={exam.id}>
                    <td>
                      <div>
                        <strong>{exam.name}</strong>
                        {exam.description && (
                          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                            {exam.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{exam.subject}</td>
                    <td>{exam.grades.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} style={{ color: '#666' }} />
                        {formatDate(exam.date)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} style={{ color: '#666' }} />
                        {exam.duration}
                      </div>
                    </td>
                    <td>
                      <strong>{exam.totalMarks}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} style={{ color: '#666' }} />
                        {getConductedBy(exam)}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(status)} size="sm">
                        {getStatusIcon(status)}
                        {status}
                      </Badge>
                    </td>
                    <td>
                      {studentGrade ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Award size={14} style={{ color: '#22c55e' }} />
                          <strong style={{ color: '#22c55e' }}>
                            {studentGrade.totalMarks} / {exam.totalMarks}
                          </strong>
                          <Badge variant="success" size="sm">
                            {studentGrade.grade}
                          </Badge>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ViewButton size="sm" onClick={() => handleViewPaper(paper)} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Paper Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPaper(null);
        }}
        title="Paper Details"
        size="lg"
      >
        {selectedPaper && (
          <ViewForm
            sections={[
              {
                title: 'Exam Information',
                icon: FileText,
                fields: [
                  { label: 'Title', value: selectedPaper.exam.name },
                  { label: 'Subject', value: selectedPaper.exam.subject },
                  { label: 'Date', value: formatDate(selectedPaper.exam.date), icon: Calendar },
                  { label: 'Time', value: selectedPaper.exam.time, icon: Clock },
                  { label: 'Duration', value: selectedPaper.exam.duration },
                  { label: 'Total Marks', value: selectedPaper.exam.totalMarks.toString() },
                  ...(selectedPaper.exam.passingMarks ? [
                    { label: 'Passing Marks', value: selectedPaper.exam.passingMarks.toString() }
                  ] : []),
                  {
                    label: 'Status',
                    value: selectedPaper.status,
                    renderAsBadge: { variant: getStatusVariant(selectedPaper.status) as any, size: 'sm' }
                  },
                  ...(selectedPaper.exam.description ? [
                    { label: 'Description', value: selectedPaper.exam.description, spanFull: true }
                  ] : []),
                ],
              },
              ...(selectedPaper.studentGrade ? [
                {
                  title: 'Your Results',
                  icon: Award,
                  fields: [
                    {
                      label: 'Total Marks',
                      value: `${selectedPaper.studentGrade.totalMarks} / ${selectedPaper.exam.totalMarks}`,
                    },
                    {
                      label: 'Percentage',
                      value: `${selectedPaper.studentGrade.percentage}%`,
                    },
                    {
                      label: 'Grade',
                      value: selectedPaper.studentGrade.grade,
                      renderAsBadge: { variant: 'success' as any, size: 'sm' as const }
                    },
                    {
                      label: 'Status',
                      value: selectedPaper.studentGrade.status,
                      renderAsBadge: { 
                        variant: selectedPaper.studentGrade.status === 'Passed' ? 'success' : 'danger' as any, 
                        size: 'sm' as const
                      }
                    },
                    ...(selectedPaper.studentGrade.remarks ? [
                      { label: 'Remarks', value: selectedPaper.studentGrade.remarks, spanFull: true }
                    ] : []),
                    ...(selectedPaper.studentGrade.gradedAt ? [
                      { label: 'Graded On', value: formatDate(selectedPaper.studentGrade.gradedAt), icon: Calendar }
                    ] : []),
                  ],
                },
                ...(selectedPaper.studentGrade.sectionGrades && selectedPaper.studentGrade.sectionGrades.length > 0 ? [
                  {
                    title: 'Section-wise Marks',
                    icon: FileText,
                    fields: selectedPaper.studentGrade.sectionGrades.map((section: any) => ({
                      label: section.sectionName,
                      value: `${section.marksObtained} / ${section.maxMarks}`,
                      spanFull: true,
                    })),
                  }
                ] : []),
              ] : []),
              ...(selectedPaper.exam.sections && selectedPaper.exam.sections.length > 0 ? [
                {
                  title: 'Exam Sections',
                  icon: FileText,
                  fields: selectedPaper.exam.sections.map((section: any) => ({
                    label: section.name,
                    value: `${section.marks} marks${section.description ? ` - ${section.description}` : ''}`,
                    spanFull: true,
                  })),
                }
              ] : []),
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Papers;

