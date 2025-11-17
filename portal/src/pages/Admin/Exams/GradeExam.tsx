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
        try {
          // Use id directly (MongoDB ObjectId is a string)
          const response = await api.exams.getById(id) as any;
          const examData = response.data?.exam || response.exam;
          
          if (!examData) {
            console.error('Exam not found');
            return;
          }
          
          setExam(examData);

          // Get students enrolled in this exam (based on specific classes)
          const studentsResponse = await api.students.getAll() as any;
          if (!studentsResponse.data?.students) {
            setStudents([]);
            return;
          }
          const allStudents = studentsResponse.data.students;
          
          // Debug: log student IDs to see what we're working with
          console.log('Sample students (first 3):', allStudents.slice(0, 3).map((s: any) => ({
            id: s.id || s._id,
            studentId: s.studentId,
            name: s.name,
            class: s.class
          })));
          
          let enrolledStudents: Student[] = [];
          
          // Helper function to normalize class names for comparison
          const normalizeClass = (className: string): string => {
            if (!className) return '';
            // Convert "Grade 1A" -> "1A", "1A" -> "1A", "Grade 1 Section A" -> "1A"
            const match = className.match(/(\d+)([A-Z])/i);
            if (match) {
              return `${match[1]}${match[2].toUpperCase()}`;
            }
            // If no section, just get the number
            const numMatch = className.match(/(\d+)/);
            return numMatch ? numMatch[1] : className;
          };
          
          // If exam has specific classes, use those
          if (examData.classes && examData.classes.length > 0) {
            // Normalize exam classes (e.g., "1A", "1B", "Grade 1A" -> "1A", "1B")
            const normalizedExamClasses = examData.classes.map((c: string) => {
              const match = c.match(/(\d+)([A-Z])/i);
              return match ? `${match[1]}${match[2].toUpperCase()}` : c;
            });
            
            enrolledStudents = allStudents.filter((student: Student) => {
              const studentClassNormalized = normalizeClass(student.class || '');
              return normalizedExamClasses.some((examClass: string) => {
                const examClassNormalized = normalizeClass(examClass);
                return studentClassNormalized === examClassNormalized || 
                       studentClassNormalized.includes(examClassNormalized) ||
                       examClassNormalized.includes(studentClassNormalized);
              });
            });
          } else if (examData.grades && examData.grades.length > 0) {
            // Fallback to grades for backward compatibility
            enrolledStudents = allStudents.filter((student: Student) => {
              return examData.grades.some((examGrade: string) => {
                const examGradeNum = examGrade.replace(/Grade\s*/i, '').trim();
                const studentGradeMatch = student.class?.match(/Grade\s*(\d+)/i);
                if (studentGradeMatch) {
                  const studentGradeNum = studentGradeMatch[1];
                  return studentGradeNum === examGradeNum;
                }
                return false;
              });
            });
          }
          
          setStudents(enrolledStudents);

          // Load existing exam results
          try {
            // Get current exam ID in all possible formats
            const currentExamId = examData._id || examData.id;
            const currentExamIdCustom = examData.examId;
            
            console.log('Loading exam results for exam:', {
              currentExamId,
              currentExamIdCustom
            });
            
            // Try to fetch by examId (ObjectId) first, then by custom examId if that fails
            let examResults: any[] = [];
            let resultsResponse: any;
            
            try {
              // Try with ObjectId first (this is what's stored in the database)
              resultsResponse = await api.examResults.getByExamId(currentExamId) as any;
              examResults = resultsResponse.data?.results || resultsResponse.data || [];
              console.log('Fetched results by ObjectId:', examResults.length);
            } catch (error) {
              console.warn('Failed to fetch by ObjectId, trying custom examId:', error);
            }
            
            // If no results found and we have a custom examId, try that
            if (examResults.length === 0 && currentExamIdCustom) {
              try {
                resultsResponse = await api.examResults.getByExamId(currentExamIdCustom) as any;
                examResults = resultsResponse.data?.results || resultsResponse.data || [];
                console.log('Fetched results by custom examId:', examResults.length);
              } catch (error) {
                console.warn('Failed to fetch by custom examId:', error);
              }
            }
            
            // Fallback: fetch all and filter (if direct query didn't work)
            if (examResults.length === 0) {
              console.log('Falling back to fetch all and filter');
              const allResultsResponse = await api.examResults.getAll() as any;
              const allResults = allResultsResponse.data?.results || allResultsResponse.data || [];
              
              examResults = allResults.filter((result: any) => {
                // Backend transforms examId to a string (custom ID or ObjectId)
                let resultExamIdValue: string | undefined;
                
                if (typeof result.examId === 'string') {
                  resultExamIdValue = result.examId;
                } else if (result.examId && typeof result.examId === 'object') {
                  resultExamIdValue = result.examId.examId || result.examId._id || result.examId.id || String(result.examId);
                } else {
                  resultExamIdValue = result.examId ? String(result.examId) : undefined;
                }
                
                if (!resultExamIdValue) {
                  return false;
                }
                
                const matchesById = String(resultExamIdValue) === String(currentExamId);
                const matchesByCustomId = currentExamIdCustom && String(resultExamIdValue) === String(currentExamIdCustom);
                
                return matchesById || matchesByCustomId;
              });
            }
            
            console.log('Final exam results count:', examResults.length);
            
            if (examResults.length > 0) {
              // Map existing results to student grades
              const gradesMap: Record<string | number, StudentExamGrade> = {};
              
              examResults.forEach((result: any) => {
                // Backend transforms studentId to custom ID string (e.g., 'S001') or ObjectId
                const resultStudentId = result.studentId?._id || result.studentId?.id || result.studentId || result.studentId?.studentId;
                
                // Find student by matching custom studentId or ObjectId
                const student = enrolledStudents.find(s => {
                  const sCustomId = (s as any).studentId; // Custom ID like 'S001'
                  const sObjectId = s.id || (s as any)._id; // MongoDB ObjectId
                  
                  // Try matching by custom ID first (if result has custom ID)
                  if (resultStudentId && typeof resultStudentId === 'string' && resultStudentId.startsWith('S')) {
                    if (sCustomId && String(sCustomId) === String(resultStudentId)) {
                      return true;
                    }
                  }
                  
                  // Try matching by ObjectId
                  if (sObjectId && String(sObjectId) === String(resultStudentId)) {
                    return true;
                  }
                  
                  // Try matching custom ID to ObjectId (fallback)
                  if (sCustomId && String(sCustomId) === String(resultStudentId)) {
                    return true;
                  }
                  
                  return false;
                });
                
                console.log('Processing result for student:', {
                  resultStudentId,
                  resultStudentIdType: typeof resultStudentId,
                  enrolledStudentsCount: enrolledStudents.length,
                  enrolledStudentIds: enrolledStudents.map(s => ({
                    customId: (s as any).studentId,
                    objectId: s.id || (s as any)._id,
                    name: s.name
                  })),
                  foundStudent: !!student,
                  studentName: student?.name,
                  remarks: result.remarks
                });
                
                if (student) {
                  // Try to parse section marks from remarks (stored as JSON)
                  let sectionMarksMap: Record<string, number> = {};
                  try {
                    if (result.remarks) {
                      const parsed = typeof result.remarks === 'string' ? JSON.parse(result.remarks) : result.remarks;
                      if (parsed.sectionMarks && typeof parsed.sectionMarks === 'object') {
                        sectionMarksMap = parsed.sectionMarks;
                        console.log('Loaded section marks map for student:', student.name, sectionMarksMap);
                      }
                    }
                  } catch (e) {
                    // If parsing fails, sectionMarksMap remains empty
                    console.error('Error parsing section marks:', e, result.remarks);
                  }
                  
                  // Calculate total marks from section marks (or use saved total)
                  const sectionGrades = examData.sections?.map((section: any) => {
                    const sectionId = section._id || section.id;
                    // Normalize sectionId to string for comparison
                    const sectionIdStr = sectionId?.toString ? sectionId.toString() : String(sectionId);
                    
                    // Try to find marks - check all possible key formats
                    let savedMarks: number | undefined = undefined;
                    
                    // Get all keys from the map for debugging
                    const mapKeys = Object.keys(sectionMarksMap);
                    console.log(`Section ${section.name} (ID: ${sectionIdStr}): Available keys in map:`, mapKeys);
                    
                    // Try direct match
                    savedMarks = sectionMarksMap[sectionIdStr];
                    
                    // Try with ObjectId string format (if sectionId is an object)
                    if (savedMarks === undefined && sectionId) {
                      const objIdStr = typeof sectionId === 'object' && sectionId.toString ? sectionId.toString() : String(sectionId);
                      savedMarks = sectionMarksMap[objIdStr];
                    }
                    
                    // Try all keys in the map to find a match (fallback - more aggressive)
                    if (savedMarks === undefined) {
                      for (const key of mapKeys) {
                        // Try exact string match
                        if (String(key) === sectionIdStr || String(key) === String(sectionId)) {
                          savedMarks = sectionMarksMap[key];
                          break;
                        }
                        // Try matching last part of ObjectId (in case of format differences)
                        const keyLastPart = String(key).slice(-12);
                        const sectionIdLastPart = String(sectionId).slice(-12);
                        if (keyLastPart === sectionIdLastPart && keyLastPart.length === 12) {
                          savedMarks = sectionMarksMap[key];
                          break;
                        }
                      }
                    }
                    
                    // If still not found, try matching by index (as last resort)
                    if (savedMarks === undefined && mapKeys.length === examData.sections?.length) {
                      const sectionIndex = examData.sections.findIndex((s: any) => 
                        String((s as any)._id || s.id) === String(sectionId)
                      );
                      if (sectionIndex >= 0 && sectionIndex < mapKeys.length) {
                        savedMarks = sectionMarksMap[mapKeys[sectionIndex]];
                      }
                    }
                    
                    console.log(`Section ${section.name} (ID: ${sectionIdStr}): savedMarks =`, savedMarks);
                    
                    return {
                      sectionId: section._id || section.id,
                      sectionName: section.name,
                      marksObtained: savedMarks !== undefined ? savedMarks : (null as any), // Use null instead of 0 for empty
                      maxMarks: section.marks,
                    };
                  }) || [];
                  
                  // Recalculate total marks from section marks
                  const totalMarks = sectionGrades.reduce((sum: number, sg: any) => {
                    const marks = sg.marksObtained;
                    return sum + (marks !== null && marks !== undefined ? marks : 0);
                  }, 0);
                  
                  const percentage = examData ? (totalMarks / examData.totalMarks) * 100 : 0;
                  
                  // Get passing marks (use exam passingMarks or default to 33% of total marks)
                  const passingMarks = examData?.passingMarks || (examData ? (examData.totalMarks * 0.33) : 33);
                  
                  // Recalculate grade and status based on passing marks
                  const hasPassed = totalMarks >= passingMarks;
                  
                  let grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'F';
                  let status: 'Passed' | 'Failed' = 'Failed';
                  
                  if (hasPassed) {
                    // Only assign letter grades if student passed
                    if (percentage >= 90) grade = 'A+';
                    else if (percentage >= 80) grade = 'A';
                    else if (percentage >= 70) grade = 'B+';
                    else if (percentage >= 60) grade = 'B';
                    else if (percentage >= 50) grade = 'C+';
                    else if (percentage >= 40) grade = 'C';
                    else if (percentage >= 33) grade = 'D';
                    else grade = 'F';
                    
                    status = 'Passed';
                  } else {
                    // If failed, grade is always F
                    grade = 'F';
                    status = 'Failed';
                  }
                  
                  gradesMap[String(student.id || (student as any)._id)] = {
                    studentId: student.id || (student as any)._id,
                    studentName: student.name,
                    class: student.class,
                    sectionGrades: sectionGrades,
                    totalMarks: totalMarks,
                    percentage: Math.round(percentage * 100) / 100,
                    grade: grade,
                    status: status,
                  };
                }
              });
              
              // Initialize grades for students without results
              enrolledStudents.forEach(student => {
                const studentId = String(student.id || (student as any)._id);
                if (!gradesMap[studentId]) {
                  gradesMap[studentId] = {
                    studentId: student.id || (student as any)._id,
                    studentName: student.name,
                    class: student.class,
                    sectionGrades: examData.sections?.map((section: any) => ({
                      sectionId: section._id || section.id,
                      sectionName: section.name,
                      marksObtained: null as any, // Use null for empty fields
                      maxMarks: section.marks,
                    })) || [],
                    totalMarks: 0,
                    percentage: 0,
                    grade: 'F',
                    status: 'Failed',
                  };
                }
              });
              
              setStudentGrades(gradesMap);
            } else {
              // Initialize empty grades for all students
              const initialGrades: Record<string | number, StudentExamGrade> = {};
              enrolledStudents.forEach(student => {
                const studentId = String(student.id || (student as any)._id);
                initialGrades[studentId] = {
                  studentId: student.id || (student as any)._id,
                  studentName: student.name,
                  class: student.class,
                  sectionGrades: examData.sections?.map((section: any) => ({
                    sectionId: section._id || section.id,
                    sectionName: section.name,
                    marksObtained: 0,
                    maxMarks: section.marks,
                  })) || [],
                  totalMarks: 0,
                  percentage: 0,
                  grade: 'F',
                  status: 'Failed',
                };
              });
              setStudentGrades(initialGrades);
            }
          } catch (error) {
            console.error('Error loading exam results:', error);
            // Initialize empty grades if loading fails
            const initialGrades: Record<string | number, StudentExamGrade> = {};
            enrolledStudents.forEach(student => {
                const studentId = String(student.id || (student as any)._id);
              initialGrades[studentId] = {
                studentId: student.id || (student as any)._id,
                studentName: student.name,
                class: student.class,
                sectionGrades: examData.sections?.map((section: any) => ({
                  sectionId: section._id || section.id,
                  sectionName: section.name,
                  marksObtained: 0,
                  maxMarks: section.marks,
                })) || [],
                totalMarks: 0,
                percentage: 0,
                grade: 'F',
                status: 'Failed',
              };
            });
            setStudentGrades(initialGrades);
          }
        } catch (error) {
          console.error('Error loading exam data:', error);
          setStudents([]);
        }
      }
    };

    loadData();
  }, [id]);

  const handleSectionGradeChange = useCallback((studentId: string | number, sectionId: string | number, marks: number | null) => {
    setStudentGrades(prev => {
      const studentGrade = prev[String(studentId)];
      if (!studentGrade) return prev;

      // Find section by _id or id
      const section = exam?.sections.find((s: any) => 
            String((s as any)._id || s.id) === String(sectionId)
      );
      if (!section) return prev;

      const maxMarks = section.marks;
      const marksObtained = marks === null ? null : Math.min(Math.max(0, marks), maxMarks); // Clamp between 0 and maxMarks, or null

      const updatedSectionGrades = studentGrade.sectionGrades.map((sg: any) =>
        String(sg.sectionId) === String(sectionId)
          ? { ...sg, marksObtained }
          : sg
      );

      const totalMarks = updatedSectionGrades.reduce((sum: number, sg: any) => {
        const marks = sg.marksObtained;
        return sum + (marks !== null && marks !== undefined ? marks : 0);
      }, 0);
      const percentage = exam ? (totalMarks / exam.totalMarks) * 100 : 0;
      
      // Get passing marks (use exam passingMarks or default to 33% of total marks)
      const passingMarks = exam?.passingMarks || (exam ? (exam.totalMarks * 0.33) : 33);
      // const passingPercentage = exam ? (passingMarks / exam.totalMarks) * 100 : 33;
      
      // Check if student passed first
      const hasPassed = totalMarks >= passingMarks;
      
      let grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'F';
      let status: 'Passed' | 'Failed' = 'Failed';
      
      if (hasPassed) {
        // Only assign letter grades if student passed
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C+';
        else if (percentage >= 40) grade = 'C';
        else if (percentage >= 33) grade = 'D';
        else grade = 'F';
        
        status = 'Passed';
      } else {
        // If failed, grade is always F
        grade = 'F';
        status = 'Failed';
      }

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

  const handleSaveGrades = async () => {
    if (!exam) return;

    try {
      const examId = (exam as any)._id || exam.id;
      const gradesArray = Object.values(studentGrades);
      
      // Save/update exam results for each student
      const savePromises = gradesArray.map(async (grade) => {
        // Store section marks in remarks as JSON
        const sectionMarksMap: Record<string, number> = {};
        grade.sectionGrades.forEach((sg: any) => {
          // Ensure consistent string format for sectionId
          const sectionId = sg.sectionId;
          const sectionIdStr = sectionId?.toString ? sectionId.toString() : String(sectionId);
          if (sg.marksObtained !== null && sg.marksObtained !== undefined) {
            sectionMarksMap[sectionIdStr] = sg.marksObtained;
          }
        });
        
        const resultData = {
          examId: examId,
          studentId: grade.studentId,
          marksObtained: grade.totalMarks,
          totalMarks: exam.totalMarks,
          percentage: grade.percentage,
          grade: grade.grade,
          status: grade.status === 'Passed' ? 'Pass' : 'Fail',
          remarks: JSON.stringify({ sectionMarks: sectionMarksMap }),
        };

        try {
          // Get the student's ObjectId (needed for database lookup)
          const student = students.find(s => {
            const sId = String(s.id || (s as any)._id);
            const gradeStudentId = String(grade.studentId);
            return sId === gradeStudentId || 
                   String((s as any).studentId) === gradeStudentId ||
                   sId === gradeStudentId;
          });
          
          if (!student) {
            console.error(`Student not found for grade:`, grade);
            return;
          }
          
          const studentObjectId = student.id || (student as any)._id;
          
          // Try to find existing result first - query by examId and studentId
          let existingResult: any = null;
          try {
            // Try fetching by examId and studentId
            const resultsByExam = await api.examResults.getByExamId(examId) as any;
            const examResults = resultsByExam.data?.results || resultsByExam.data || [];
            
            // Match by studentId (handle both custom ID and ObjectId)
            existingResult = examResults.find((r: any) => {
              const rStudentId = r.studentId?._id || r.studentId?.id || r.studentId || r.studentId?.studentId;
              const rStudentIdStr = String(rStudentId);
              const studentIdStr = String(studentObjectId);
              const studentCustomId = String((student as any).studentId || '');
              
              return rStudentIdStr === studentIdStr || 
                     rStudentIdStr === studentCustomId ||
                     String(rStudentId) === String(studentObjectId);
            });
          } catch (error) {
            console.warn('Error fetching existing results:', error);
          }
          
          // Ensure we're sending ObjectIds to the backend
          const resultDataToSend = {
            ...resultData,
            examId: examId, // ObjectId
            studentId: studentObjectId, // ObjectId
          };

          if (existingResult) {
            // Update existing result
            const resultId = existingResult._id || existingResult.id;
            console.log('Updating existing result:', resultId, resultDataToSend);
            await api.examResults.update(resultId, resultDataToSend);
          } else {
            // Create new result
            console.log('Creating new result:', resultDataToSend);
            await api.examResults.create(resultDataToSend);
          }
        } catch (error) {
          console.error(`Error saving grade for student ${grade.studentId}:`, error);
          // Continue with other students even if one fails
        }
      });

      await Promise.all(savePromises);
      alert('Grades saved successfully!');
      navigate(`/dashboard/${currentRole}/exams`);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades. Please try again.');
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const getGradeVariant = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'excellent'; // Green
    if (grade === 'B+' || grade === 'B') return 'warning'; // Yellow (using warning which is yellow/orange)
    if (grade === 'C+') return 'average'; // Orange
    if (grade === 'C') return 'poor'; // Red
    return 'poor'; // Default to red for D, F, etc.
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
              {(exam as any).examId && `${(exam as any).examId} | `}
              {(() => {
                const subjectCode = exam.subjectId && typeof exam.subjectId === 'object' 
                  ? (exam.subjectId as any).code 
                  : null;
                return subjectCode ? `${subjectCode} - ` : '';
              })()}
              {exam.subject} - {exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'} | 
              Total Marks: {exam.totalMarks}
              {exam.passingMarks && ` | Passing Marks: ${exam.passingMarks}`}
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
          {exam.sections?.map((section: any) => (
            <Badge key={section._id || section.id} variant="info" size="sm">
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
              {exam.sections?.map((section: any) => (
                <th key={section._id || section.id}>
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
                <td colSpan={7 + (exam.sections?.length || 0)} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No students enrolled in this exam
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const studentId = String(student.id || (student as any)._id);
                const grade = studentGrades[studentId];
                if (!grade) return null;

                return (
                  <tr key={studentId}>
                    <td>{student.studentId || student.id || (student as any)._id}</td>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.class}</td>
                    {exam.sections?.map((section: any) => {
                      const sectionId = section._id || section.id;
                      const sectionIdStr = String(sectionId);
                      
                      // Find section grade - try multiple matching strategies
                      let sectionGrade = grade.sectionGrades.find((sg: any) => {
                        const sgId = sg.sectionId;
                        const sgIdStr = sgId?.toString ? sgId.toString() : String(sgId);
                        return sgIdStr === sectionIdStr || String(sgId) === String(sectionId);
                      });
                      
                      // If not found, try matching by index as fallback
                      if (!sectionGrade && grade.sectionGrades.length === exam.sections.length) {
                        const sectionIndex = exam.sections.findIndex((s: any) => 
                          String(s._id || s.id) === sectionIdStr
                        );
                        if (sectionIndex >= 0 && sectionIndex < grade.sectionGrades.length) {
                          sectionGrade = grade.sectionGrades[sectionIndex];
                        }
                      }
                      
                      // Determine input value - handle 0 explicitly
                      const inputValue = (() => {
                        if (sectionGrade) {
                          const marks = sectionGrade.marksObtained;
                          if (marks !== null && marks !== undefined) {
                            return String(marks); // Convert to string, including 0
                          }
                        }
                        return ''; // Empty string for null/undefined
                      })();
                      
                      return (
                        <td key={sectionId}>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={String(section.marks).length + 1}
                            value={inputValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || value === '-') {
                                // Set to null for empty
                                handleSectionGradeChange(String(student.id || (student as any)._id), sectionId, null as any);
                              } else {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && numValue >= 0 && numValue <= section.marks) {
                                  handleSectionGradeChange(String(student.id || (student as any)._id), sectionId, numValue);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (value === '') {
                                handleSectionGradeChange(String(student.id || (student as any)._id), sectionId, null as any);
                              } else {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue)) {
                                  const clampedValue = Math.min(Math.max(0, numValue), section.marks);
                                  handleSectionGradeChange(String(student.id || (student as any)._id), sectionId, clampedValue);
                                }
                              }
                            }}
                            style={{
                              width: '60px',
                              padding: '0.375rem',
                              border: '1px solid #ddd',
                              borderRadius: '0.375rem',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              appearance: 'none',
                              MozAppearance: 'textfield',
                            }}
                            onWheel={(e) => {
                              // Prevent scroll from changing value
                              (e.target as HTMLElement).blur();
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
                  ...exam.sections?.map((section: any) => {
                    const sectionId = section._id || section.id;
                    const studentId = String(selectedStudent.id || (selectedStudent as any)._id);
                    const studentGrade = studentGrades[studentId];
                    const sectionGrade = studentGrade?.sectionGrades.find(
                      (sg: any) => String(sg.sectionId) === String(sectionId)
                    );
                    const marks = sectionGrade?.marksObtained !== null && sectionGrade?.marksObtained !== undefined 
                      ? sectionGrade.marksObtained 
                      : 0;
                    return {
                      label: section.name,
                      value: `${marks} / ${section.marks}`,
                    };
                  }) || [],
                  {
                    label: 'Total Marks',
                    value: `${studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].totalMarks} / ${exam.totalMarks}`,
                  },
                  {
                    label: 'Percentage',
                    value: `${studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].percentage.toFixed(1)}%`,
                  },
                  {
                    label: 'Grade',
                    value: studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].grade,
                    renderAsBadge: {
                      variant: getGradeVariant(studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].grade) as any,
                      size: 'sm',
                    },
                  },
                  {
                    label: 'Status',
                    value: studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].status,
                    renderAsBadge: {
                      variant: studentGrades[String(selectedStudent.id || (selectedStudent as any)._id)].status === 'Passed' ? 'success' : 'danger',
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

