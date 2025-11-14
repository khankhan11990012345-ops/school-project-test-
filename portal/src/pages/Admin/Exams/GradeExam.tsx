import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, User, BookOpen } from 'lucide-react';
import { BackButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import api from '../../../services/api';
import { UserRole, Exam, Student, StudentExamGrade } from '../../../types';
import '../../../styles/universal.css';
import './Exams.css';

const GradeExam = () => {
  const { id, role } = useParams<{ id: string; role?: UserRole }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract role from URL path if not in params
  const currentRole: UserRole = role || (location.pathname.includes('/teacher/') ? 'teacher' : 'admin');
  const [exam, setExam] = useState<Exam | undefined>();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGrades, setStudentGrades] = useState<Record<string | number, StudentExamGrade>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const response = await api.exams.getById(parseInt(id)) as any;
        if (response.data?.exam) {
          const examData = response.data.exam;
        setExam(examData);

        if (examData) {
          try {
            // Get students enrolled in this exam (based on specific classes)
            const studentsResponse = await api.students.getAll() as any;
            if (!studentsResponse.data?.students) {
              setStudents([]);
              return;
            }
            const allStudents = studentsResponse.data.students;
            
            let enrolledStudents: Student[] = [];
            
            // If exam has specific classes, use those
            if (examData.classes && examData.classes.length > 0) {
              enrolledStudents = allStudents.filter((student: Student) => 
                examData.classes!.includes(student.class)
              );
            } else {
              // Fallback to grades for backward compatibility
              enrolledStudents = allStudents.filter((student: Student) => {
                return examData.grades.some((examGrade: string) => {
                  const examGradeNum = examGrade.replace('Grade', '').trim();
                  const studentGradeMatch = student.class.match(/Grade\s+(\d+)/i);
                  if (studentGradeMatch) {
                    const studentGradeNum = studentGradeMatch[1];
                    return studentGradeNum === examGradeNum;
                  }
                  return false;
                });
              });
            }
            
            setStudents(enrolledStudents);

            // Load existing grades if any
            // TODO: Implement exam results API
            // const response = await api.examResults.getByExamId(examData.id) as any;
            // const existingResult = response.data?.result || null;
            const existingResult: any = null;
            if (existingResult && existingResult.studentGrades) {
              const gradesMap: Record<string | number, StudentExamGrade> = {};
              existingResult.studentGrades.forEach((grade: StudentExamGrade) => {
                gradesMap[String(grade.studentId)] = grade;
              });
              setStudentGrades(gradesMap);
            } else {
              // Initialize empty grades for all students
              const initialGrades: Record<string | number, StudentExamGrade> = {};
              enrolledStudents.forEach(student => {
                initialGrades[String(student.id)] = {
                  studentId: student.id,
                  studentName: student.name,
                  class: student.class,
                  sectionGrades: examData.sections.map((section: any) => ({
                    sectionId: section.id,
                    sectionName: section.name,
                    marksObtained: 0,
                    maxMarks: section.marks,
                  })),
                  totalMarks: 0,
                  percentage: 0,
                  grade: 'F',
                  status: 'Failed',
                };
              });
              setStudentGrades(initialGrades);
            }
          } catch (error) {
            console.error('Error loading students:', error);
            setStudents([]);
          }
          }
        }
      }
    };

    loadData();
  }, [id]);

  const handleSectionGradeChange = useCallback((studentId: string | number, sectionId: number, marks: number) => {
    setStudentGrades(prev => {
      const studentGrade = prev[String(studentId)];
      if (!studentGrade) return prev;

      const section = exam?.sections.find((s: any) => s.id === sectionId);
      if (!section) return prev;

      const maxMarks = section.marks;
      const marksObtained = Math.min(Math.max(0, marks), maxMarks); // Clamp between 0 and maxMarks

      const updatedSectionGrades = studentGrade.sectionGrades.map((sg: any) =>
        sg.sectionId === sectionId
          ? { ...sg, marksObtained }
          : sg
      );

      const totalMarks = updatedSectionGrades.reduce((sum: number, sg: any) => sum + sg.marksObtained, 0);
      const percentage = exam ? (totalMarks / exam.totalMarks) * 100 : 0;
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
      const passingPercentage = exam?.passingMarks ? (exam.passingMarks / (exam.totalMarks || 100)) * 100 : 50;
      const status = percentage >= passingPercentage ? 'Passed' : 'Failed';

      return {
        ...prev,
        [String(studentId)]: {
          ...studentGrade,
          sectionGrades: updatedSectionGrades,
          totalMarks,
          percentage: Math.round(percentage * 100) / 100,
          grade,
          status,
        },
      };
    });
  }, [exam]);

  const handleSaveGrades = () => {
    if (!exam) return;

    // TODO: Implement save exam result API
    // const gradesArray = Object.values(studentGrades);
    // const examResult: ExamResult = {
    //   id: 0, // Will be set by saveExamResult
    //   examId: exam.id,
    //   examName: exam.name,
    //   subject: exam.subject,
    //   date: exam.date,
    //   studentGrades: gradesArray,
    // };
    // await api.examResults.create(examResult);
    alert('Grades saved successfully!');
    navigate(`/dashboard/${currentRole}/exams`);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const getGradeVariant = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'excellent';
    if (grade === 'B') return 'good';
    if (grade === 'C') return 'average';
    return 'poor';
  };

  if (!exam) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Exam not found</p>
          <Button variant="primary" onClick={() => navigate(`/dashboard/${currentRole}/exams`)}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton 
            size="md" 
            onClick={() => navigate(`/dashboard/${currentRole}/exams`)}
            title="Back to Exams"
          />
          <div>
            <h1>Grade Exam: {exam.name}</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              {exam.subject} - {exam.date} | Total Marks: {exam.totalMarks}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSaveGrades}>
          <Save size={18} />
          Save All Grades
        </Button>
      </div>

      {/* Exam Sections Info */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600 }}>Exam Sections</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {exam.sections.map((section: any) => (
            <Badge key={section.id} variant="info" size="sm">
              {section.name} ({section.marks} marks)
            </Badge>
          ))}
        </div>
      </div>

      {/* Students Grading Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Class</th>
              {exam.sections.map((section: any) => (
                <th key={section.id}>
                  {section.name}
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#999' }}>
                    (Max: {section.marks})
                  </div>
                </th>
              ))}
              <th>Total</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7 + exam.sections.length} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No students enrolled in this exam
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const grade = studentGrades[String(student.id)];
                if (!grade) return null;

                return (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.class}</td>
                    {exam.sections.map((section: any) => {
                      const sectionGrade = grade.sectionGrades.find((sg: any) => sg.sectionId === section.id);
                      return (
                        <td key={section.id}>
                          <input
                            type="number"
                            min="0"
                            max={section.marks}
                            value={sectionGrade?.marksObtained || 0}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || value === '-') {
                                handleSectionGradeChange(String(student.id), section.id, 0);
                              } else {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue)) {
                                  handleSectionGradeChange(String(student.id), section.id, numValue);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleSectionGradeChange(String(student.id), section.id, value);
                            }}
                            style={{
                              width: '60px',
                              padding: '0.375rem',
                              border: '1px solid #ddd',
                              borderRadius: '0.375rem',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                            }}
                          />
                        </td>
                      );
                    })}
                    <td>
                      <strong>{grade.totalMarks} / {exam.totalMarks}</strong>
                    </td>
                    <td>{grade.percentage.toFixed(1)}%</td>
                    <td>
                      <Badge variant={getGradeVariant(grade.grade) as any} size="sm">
                        {grade.grade}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={grade.status === 'Passed' ? 'success' : 'danger'} size="sm">
                        {grade.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <User size={14} />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Student Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && studentGrades[String(selectedStudent.id)] && (
          <ViewForm
            sections={[
              {
                title: 'Student Information',
                icon: User,
                fields: [
                  { label: 'Name', value: selectedStudent.name },
                  { label: 'Class', value: selectedStudent.class },
                  { label: 'Email', value: selectedStudent.email },
                ],
              },
              {
                title: 'Exam Grades',
                icon: BookOpen,
                fields: [
                  ...exam.sections.map((section: any) => {
                    const studentGrade = studentGrades[String(selectedStudent.id)];
                    const sectionGrade = studentGrade?.sectionGrades.find(
                      (sg: any) => sg.sectionId === section.id
                    );
                    return {
                      label: section.name,
                      value: `${sectionGrade?.marksObtained || 0} / ${section.marks}`,
                    };
                  }),
                  {
                    label: 'Total Marks',
                    value: `${studentGrades[String(selectedStudent.id)].totalMarks} / ${exam.totalMarks}`,
                  },
                  {
                    label: 'Percentage',
                    value: `${studentGrades[String(selectedStudent.id)].percentage.toFixed(1)}%`,
                  },
                  {
                    label: 'Grade',
                    value: studentGrades[String(selectedStudent.id)].grade,
                    renderAsBadge: {
                      variant: getGradeVariant(studentGrades[String(selectedStudent.id)].grade) as any,
                      size: 'sm',
                    },
                  },
                  {
                    label: 'Status',
                    value: studentGrades[String(selectedStudent.id)].status,
                    renderAsBadge: {
                      variant: studentGrades[String(selectedStudent.id)].status === 'Passed' ? 'success' : 'danger',
                      size: 'sm',
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

export default GradeExam;

