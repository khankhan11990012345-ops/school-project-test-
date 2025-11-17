import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Award, Printer } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { BackButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Exams.css';

const StudentExamResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStudentExamResults();
    }
  }, [id]);

  const loadStudentExamResults = async () => {
    try {
      setLoading(true);
      
      // Load student first
      const studentResponse = await api.students.getById(id || '') as any;
      const studentData = studentResponse?.data?.student || studentResponse?.data || studentResponse;
      
      if (!studentData) {
        setStudent(null);
        return;
      }

      setStudent(studentData);

      // Load exam results for this student - use studentId query parameter for better filtering
      const studentIdForQuery = studentData.studentId || studentData._id || studentData.id;
      
      // Fetch all exams first to use as a lookup
      let allExams: any[] = [];
      try {
        const examsResponse = await api.exams.getAll() as any;
        allExams = examsResponse?.data?.exams || examsResponse?.data || examsResponse || [];
        if (!Array.isArray(allExams)) allExams = [];
      } catch (error) {
        console.error('Error fetching all exams:', error);
      }
      
      // Try to fetch results filtered by studentId first
      let resultsResponse;
      try {
        // Try fetching with studentId query parameter
        resultsResponse = await api.examResults.getAll() as any;
        // The backend should support ?studentId= query, but if not, we'll filter client-side
      } catch (error) {
        console.error('Error fetching exam results:', error);
        resultsResponse = { data: { results: [] } };
      }
      
      const allResults = resultsResponse?.data?.results || resultsResponse?.data || resultsResponse || [];
      const resultsArray = Array.isArray(allResults) ? allResults : [];
      
      // Filter results for this student
      const studentResults = resultsArray.filter((result: any) => {
        const resultStudentId = result.studentId?.studentId || result.studentId?._id || result.studentId || result.studentIdCustom;
        return String(resultStudentId) === String(studentIdForQuery) || 
               String(resultStudentId) === String(studentData._id) ||
               String(resultStudentId) === String(studentData.id);
      });

      console.log('Filtered student results:', {
        studentIdForQuery,
        totalResults: resultsArray.length,
        studentResultsCount: studentResults.length,
        allExamsCount: allExams.length,
        firstResult: studentResults[0],
        firstResultExamId: studentResults[0]?.examId,
        firstResultExamIdType: typeof studentResults[0]?.examId
      });

      // The backend already populates examId with 'name subject date totalMarks examId'
      // But it transforms examId to a string, so we need to fetch full exam details for subjectId
      const resultsWithExamDetails = await Promise.all(
        studentResults.map(async (result: any) => {
          try {
            // The backend transforms examId to a string, so we need to fetch the exam
            let examData: any = null;
            let examIdForFetch: string | null = null;
            
            // Extract examId - backend transforms it to custom ID string or ObjectId string
            // Also check examIdCustom field as fallback
            if (result.examId) {
              if (typeof result.examId === 'object' && result.examId !== null) {
                // Still an object (shouldn't happen after transformation, but handle it)
                examIdForFetch = result.examId._id || result.examId.examId || null;
                // Use populated data if available
                if (result.examId.name) {
                  examData = {
                    name: result.examId.name,
                    subject: result.examId.subject,
                    date: result.examId.date,
                    totalMarks: result.examId.totalMarks
                  };
                }
              } else if (typeof result.examId === 'string') {
                // It's a string (custom ID like "EXM001" or ObjectId string)
                examIdForFetch = result.examId;
              }
            } else if (result.examIdCustom) {
              // examId is null but examIdCustom exists
              examIdForFetch = result.examIdCustom;
            }
            
            console.log('Processing result:', {
              resultExamId: result.examId,
              examIdForFetch,
              resultKeys: Object.keys(result)
            });
            
            // Fetch full exam details to get subjectId populated
            if (examIdForFetch) {
              // First, try to find exam in the pre-fetched allExams array
              let fullExamData = allExams.find((exam: any) => 
                exam.examId === examIdForFetch || 
                exam._id === examIdForFetch ||
                String(exam._id) === String(examIdForFetch)
              );
              
              // If not found in pre-fetched list, try API call
              if (!fullExamData) {
                try {
                  console.log('Fetching exam with ID:', examIdForFetch);
                  const examResponse = await api.exams.getById(examIdForFetch) as any;
                  fullExamData = examResponse?.data?.exam || examResponse?.data || examResponse;
                  
                  console.log('Fetched exam response:', {
                    hasData: !!fullExamData,
                    examName: fullExamData?.name,
                    examSubject: fullExamData?.subject,
                    examSubjectId: fullExamData?.subjectId,
                    examDate: fullExamData?.date,
                    examKeys: fullExamData ? Object.keys(fullExamData) : []
                  });
                } catch (error: any) {
                  console.error('Error fetching full exam data:', error, 'for examId:', examIdForFetch);
                  // Try to find by matching examIdCustom in allExams
                  fullExamData = allExams.find((exam: any) => 
                    exam.examId === examIdForFetch
                  );
                }
              } else {
                console.log('Found exam in pre-fetched list:', {
                  examId: fullExamData.examId,
                  examName: fullExamData.name
                });
              }
              
              if (fullExamData) {
                examData = {
                  ...examData,
                  ...fullExamData,
                  // Ensure we have name, date, subject from full data
                  name: fullExamData.name || examData?.name,
                  date: fullExamData.date || examData?.date,
                  subject: fullExamData.subject || examData?.subject
                };
              } else {
                console.warn('No exam data found for examId:', examIdForFetch);
              }
            } else {
              console.warn('No examId found for result:', {
                examId: result.examId,
                examIdCustom: result.examIdCustom,
                resultId: result._id
              });
            }
            
            // Extract subject data
            let subjectData = null;
            
            // Priority 1: Check if subjectId is populated in examData
            if (examData?.subjectId && typeof examData.subjectId === 'object' && examData.subjectId.name) {
              subjectData = {
                name: examData.subjectId.name,
                code: examData.subjectId.code || ''
              };
            }
            // Priority 2: Use subject name from examData
            else if (examData?.subject) {
              subjectData = {
                name: examData.subject,
                code: ''
              };
            }
            // Priority 3: Try to fetch subject if we have subjectId as ObjectId
            else if (examData?.subjectId && (typeof examData.subjectId === 'string' || typeof examData.subjectId === 'object')) {
              try {
                const subjectIdStr = typeof examData.subjectId === 'string' 
                  ? examData.subjectId 
                  : (examData.subjectId._id || examData.subjectId.toString());
                const subjectResponse = await api.subjects.getById(subjectIdStr) as any;
                const fetchedSubject = subjectResponse?.data?.subject || subjectResponse?.data || subjectResponse;
                if (fetchedSubject && fetchedSubject.name) {
                  subjectData = {
                    name: fetchedSubject.name,
                    code: fetchedSubject.code || ''
                  };
                }
              } catch (error) {
                console.error('Error fetching subject:', error);
              }
            }
            
            return {
              ...result,
              exam: examData || {},
              subject: subjectData
            };
          } catch (error) {
            console.error('Error processing result:', error, result);
            return result;
          }
        })
      );

      setExamResults(resultsWithExamDetails);
    } catch (error) {
      console.error('Error loading student exam results:', error);
      setStudent(null);
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeVariant = (grade: string) => {
    if (!grade) return 'secondary';
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper === 'A+' || gradeUpper === 'A') return 'excellent';
    if (gradeUpper === 'B+' || gradeUpper === 'B') return 'warning';
    if (gradeUpper === 'C+') return 'average';
    if (gradeUpper === 'C' || gradeUpper === 'D' || gradeUpper === 'F') return 'poor';
    return 'secondary';
  };

  const handlePrint = () => {
    if (!student || examResults.length === 0) {
      alert('No data available to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the result card');
      return;
    }

    // Calculate overall marks and percentage
    const overallMarks = examResults.reduce((sum: number, result: any) => {
      return sum + (result.marksObtained || 0);
    }, 0);
    const overallTotalMarks = examResults.reduce((sum: number, result: any) => {
      const exam = result.exam || {};
      const totalMarks = result.totalMarks || exam.totalMarks || 100;
      return sum + totalMarks;
    }, 0);
    const overallPercentage = overallTotalMarks > 0 
      ? ((overallMarks / overallTotalMarks) * 100).toFixed(1)
      : '0.0';

    // Generate HTML for the result card
    const resultRows = examResults.map((result: any, index: number) => {
      const exam = result.exam || {};
      const subject = result.subject || exam.subjectId || {};
      const subjectCode = subject?.code || '';
      const subjectName = subject?.name || exam.subject || 'N/A';
      // const examName = exam.name || 'N/A';
      const marksObtained = result.marksObtained || 0;
      const totalMarks = result.totalMarks || exam.totalMarks || 100;
      const percentage = result.percentage || 0;
      const grade = result.grade || 'N/A';
      const status = result.status || 'N/A';

      return `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>
            ${subjectCode ? `<strong style="color: #1e40af;">${subjectCode}</strong> - ` : ''}
            ${subjectName}
          </td>
          <td style="text-align: center;">
            <strong>${marksObtained} / ${totalMarks}</strong>
          </td>
          <td style="text-align: center;">${percentage.toFixed(1)}%</td>
          <td style="text-align: center;">
            <span style="
              padding: 4.5px 9px;
              border-radius: 4.5px;
              font-weight: 700;
              font-size: 0.6375rem;
              letter-spacing: 0.225px;
              display: inline-block;
              ${grade === 'A+' || grade === 'A' ? 'background: #d1fae5; color: #065f46; border: 0.75px solid #a7f3d0;' : ''}
              ${grade === 'B+' || grade === 'B' ? 'background: #fef3c7; color: #92400e; border: 0.75px solid #fde68a;' : ''}
              ${grade === 'C+' ? 'background: #fed7aa; color: #9a3412; border: 0.75px solid #fdba74;' : ''}
              ${grade === 'C' || grade === 'D' || grade === 'F' ? 'background: #fee2e2; color: #991b1b; border: 0.75px solid #fecaca;' : ''}
            ">${grade}</span>
          </td>
          <td style="text-align: center;">
            <span style="
              padding: 4.5px 9px;
              border-radius: 4.5px;
              font-weight: 700;
              font-size: 0.6375rem;
              letter-spacing: 0.225px;
              display: inline-block;
              ${status === 'Pass' || status === 'Passed' ? 'background: #d1fae5; color: #065f46; border: 0.75px solid #a7f3d0;' : 'background: #fee2e2; color: #991b1b; border: 0.75px solid #fecaca;'}
            ">${status}</span>
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Result Card - ${student.name}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 0.8cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 22.5px;
              padding-bottom: 120px;
              color: #1f2937;
              background: #ffffff;
              line-height: 1.5;
              position: relative;
              min-height: 100vh;
            }
            
            .branding {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .branding h2 {
              margin: 0;
              color: #1e40af;
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            
            .branding p {
              margin: 5px 0 0 0;
              color: #64748b;
              font-size: 11px;
              font-weight: 500;
            }
            
            .header {
              text-align: center;
              margin-bottom: 26px;
              padding-bottom: 19px;
              border-bottom: 3px solid #1e40af;
              position: relative;
            }
            
            .header::after {
              content: '';
              position: absolute;
              bottom: -3px;
              left: 50%;
              transform: translateX(-50%);
              width: 75px;
              height: 3px;
              background: #3b82f6;
            }
            
            .header h1 {
              margin: 0 0 7.5px 0;
              color: #1e40af;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.75px;
              text-transform: uppercase;
            }
            
            .header p {
              margin: 3.75px 0;
              color: #4b5563;
              font-size: 12px;
              font-weight: 500;
            }
            
            .student-info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 26px;
              padding: 19px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1.5px solid #e2e8f0;
              border-radius: 9px;
              box-shadow: 0 1.5px 6px rgba(0, 0, 0, 0.08);
            }
            
            .info-item {
              margin-bottom: 0;
            }
            
            .info-label {
              font-weight: 600;
              color: #64748b;
              font-size: 0.64rem;
              text-transform: uppercase;
              letter-spacing: 0.375px;
              margin-bottom: 4.5px;
            }
            
            .info-value {
              font-size: 0.825rem;
              color: #1e293b;
              margin-top: 0;
              font-weight: 500;
            }
            
            .info-value strong {
              color: #1e40af;
              font-weight: 700;
            }
            
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 19px;
              background: white;
              border: 1.5px solid #e2e8f0;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 1.5px 6px rgba(0, 0, 0, 0.06);
            }
            
            thead {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
            }
            
            th {
              padding: 10.5px 9px;
              text-align: left;
              font-weight: 700;
              font-size: 0.675rem;
              text-transform: uppercase;
              letter-spacing: 0.375px;
              border-right: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            th:last-child {
              border-right: none;
            }
            
            th[style*="text-align: center"] {
              text-align: center;
            }
            
            tbody tr {
              border-bottom: 1px solid #e5e7eb;
              transition: background-color 0.2s;
            }
            
            tbody tr:last-child {
              border-bottom: none;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            tbody tr:hover {
              background-color: #f3f4f6;
            }
            
            td {
              padding: 10.5px 9px;
              font-size: 0.7125rem;
              border-right: 1px solid #e5e7eb;
            }
            
            td:last-child {
              border-right: none;
            }
            
            tbody tr:last-child td {
              border-top: 2.25px solid #1e40af;
              background: #eff6ff !important;
              font-size: 0.75rem;
            }
            
            .footer {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              margin-top: 0;
              display: flex;
              justify-content: space-between;
              padding: 22.5px 22.5px;
              border-top: 2.25px solid #e5e7eb;
              background: white;
            }
            
            .signature {
              text-align: center;
              width: 187.5px;
            }
            
            .signature-line {
              border-top: 1.5px solid #1f2937;
              margin-top: 45px;
              padding-top: 6px;
              font-weight: 600;
              color: #374151;
              font-size: 0.675rem;
            }
            
            /* Badge styles for grade and status */
            span[style*="padding: 4px 8px"] {
              display: inline-block;
              padding: 4.5px 9px !important;
              border-radius: 4.5px !important;
              font-weight: 700 !important;
              font-size: 0.6375rem !important;
              letter-spacing: 0.225px;
            }
          </style>
        </head>
        <body>
          <div class="branding">
            <h2>MySchool</h2>
            <p>Excellence in Education</p>
          </div>
          
          <div class="header">
            <h1>DETAILED MARKS CERTIFICATE (DMC)</h1>
            <p>Academic Year ${new Date().getFullYear()}</p>
          </div>

          <div class="student-info">
            <div class="info-item">
              <div class="info-label">Student ID</div>
              <div class="info-value"><strong>${student.studentId || student.id || 'N/A'}</strong></div>
            </div>
            <div class="info-item">
              <div class="info-label">Student Name</div>
              <div class="info-value"><strong>${student.name || 'N/A'}</strong></div>
            </div>
            <div class="info-item">
              <div class="info-label">Class</div>
              <div class="info-value">${student.class || 'N/A'}</div>
            </div>
            ${student.section ? `
            <div class="info-item">
              <div class="info-label">Section</div>
              <div class="info-value">${student.section}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Exam Name</div>
              <div class="info-value">
                ${(() => {
                  const examNames = examResults
                    .map((result: any) => result.exam?.name)
                    .filter(Boolean)
                    .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
                  return examNames.length > 0 ? examNames.join(', ') : 'N/A';
                })()}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 50px;">Sr.</th>
                <th>Subject</th>
                <th style="text-align: center;">Marks</th>
                <th style="text-align: center;">Percentage</th>
                <th style="text-align: center;">Grade</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${resultRows}
              <tr>
                <td colspan="2" style="text-align: right; font-weight: 700; color: #1e40af;">
                  <strong>Total Marks:</strong>
                </td>
                <td style="text-align: center; font-weight: 700; color: #1e40af; font-size: 0.7875rem;">
                  <strong>${overallMarks} / ${overallTotalMarks}</strong>
                </td>
                <td style="text-align: center; font-weight: 700; color: #1e40af; font-size: 0.7875rem;">
                  <strong>${overallPercentage}%</strong>
                </td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature">
              <div class="signature-line">Student Signature</div>
            </div>
            <div class="signature">
              <div class="signature-line">Authorized Signature</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading exam results...</p>
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
            onClick={() => navigate('/dashboard/admin/exams/results')}
            title="Back to Exam Results"
          />
        </div>
      </div>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'subject',
      header: 'Subject',
      render: (_value: any, row: any) => {
        // Try multiple ways to get subject data
        const subject = row.subject || row.exam?.subjectId || {};
        const subjectCode = subject?.code || '';
        const subjectName = subject?.name || row.exam?.subject || 'N/A';
        
        // Debug log
        if (!subjectName || subjectName === 'N/A') {
          console.log('Subject data for row:', {
            rowSubject: row.subject,
            examSubjectId: row.exam?.subjectId,
            examSubject: row.exam?.subject,
            fullRow: row
          });
        }
        
        return (
          <div>
            {subjectCode && <strong>{subjectCode} - </strong>}
            {subjectName}
          </div>
        );
      }
    },
    {
      key: 'marks',
      header: 'Marks',
      render: (_value: any, row: any) => {
        const marksObtained = row.marksObtained || 0;
        const totalMarks = row.totalMarks || row.exam?.totalMarks || 100;
        return (
          <div style={{ fontWeight: 600 }}>
            {marksObtained} / {totalMarks}
          </div>
        );
      }
    },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (_value: any, row: any) => {
        const percentage = row.percentage || 0;
        return `${percentage.toFixed(1)}%`;
      }
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (_value: any, row: any) => {
        const grade = row.grade || 'N/A';
        return (
          <Badge variant={getGradeVariant(grade) as any} size="sm">
            {grade}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (_value: any, row: any) => {
        const status = row.status || 'N/A';
        return (
          <Badge 
            variant={(status === 'Pass' || status === 'Passed') ? 'success' : 'danger'} 
            size="sm"
          >
            {status}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="page-container" style={{ paddingTop: '0.5rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '0.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/exams/results')}
          title="Back to Exam Results"
        />
      </div>

      {/* Student Header */}
      <Card variant="custom" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#333', marginBottom: '0.5rem' }}>
              {student.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666', marginBottom: '0.75rem' }}>
              <div>
                <strong>Student ID:</strong> {student.studentId || student.id || 'N/A'}
              </div>
              <div>
                <strong>Class:</strong> {student.class || 'N/A'}
              </div>
              {student.section && (
                <div>
                  <strong>Section:</strong> {student.section}
                </div>
              )}
            </div>
            {examResults.length > 0 && (
              <>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  <strong>Exam Name:</strong>{' '}
                  <span style={{ color: '#333' }}>
                    {(() => {
                      const examNames = examResults
                        .map((result: any) => result.exam?.name)
                        .filter(Boolean)
                        .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
                      return examNames.length > 0 ? examNames.join(', ') : 'N/A';
                    })()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  <strong>Total Marks:</strong>{' '}
                  <span style={{ color: '#333', fontWeight: 600 }}>
                    {(() => {
                      const totalObtained = examResults.reduce((sum: number, result: any) => {
                        return sum + (result.marksObtained || 0);
                      }, 0);
                      const totalPossible = examResults.reduce((sum: number, result: any) => {
                        return sum + (result.totalMarks || result.exam?.totalMarks || 100);
                      }, 0);
                      return `${totalObtained} / ${totalPossible}`;
                    })()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  <strong>Overall Percentage:</strong>{' '}
                  <span style={{ color: '#333', fontWeight: 600 }}>
                    {(() => {
                      const totalObtained = examResults.reduce((sum: number, result: any) => {
                        return sum + (result.marksObtained || 0);
                      }, 0);
                      const totalPossible = examResults.reduce((sum: number, result: any) => {
                        return sum + (result.totalMarks || result.exam?.totalMarks || 100);
                      }, 0);
                      const overallPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
                      return `${overallPercentage.toFixed(1)}%`;
                    })()}
                  </span>
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge variant="info" size="lg">
              {examResults.length} {examResults.length === 1 ? 'Exam' : 'Exams'}
            </Badge>
            {examResults.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={handlePrint}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} />
                Print Result Card
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Exam Results Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} />
          Exam Results ({examResults.length})
        </h2>
        {examResults.length > 0 ? (
          <div className="table-container">
            <Table
              data={examResults}
              columns={columns}
              emptyMessage="No exam results available"
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <Award size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No exam results available for this student</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamResults;
