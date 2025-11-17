import { useState, useEffect } from 'react';
import { FileText, Download, Printer, Search } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Table, TableColumn } from '../../../components/Table';
import { Modal } from '../../../components/Modal';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Exams.css';

const AdmitCards = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [studentExams, setStudentExams] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadExams();
    loadStudents();
  }, []);

  useEffect(() => {
    if (exams.length > 0 && students.length > 0) {
      mapStudentsToExams();
    }
  }, [exams, students]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedClass, selectedGrade, studentExams]);

  const loadExams = async () => {
    try {
      const response = await api.exams.getAll() as any;
      if (response.data?.exams) {
        setExams(response.data.exams);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.students.getAll() as any;
      const allStudents = response.data?.students || [];
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const normalizeClass = (className: string): string => {
    if (!className) return '';
    // Remove "Grade" prefix and spaces, convert to uppercase
    // "Grade 1A" -> "1A", "1A" -> "1A", "Grade 1 Section A" -> "1A"
    let normalized = className.replace(/Grade\s*/gi, '').trim();
    // Handle "Section A" format
    normalized = normalized.replace(/Section\s*/gi, '').trim();
    // Extract grade number and section letter
    const match = normalized.match(/(\d+)\s*([A-Z])?/i);
    if (match) {
      const gradeNum = match[1];
      const section = match[2] ? match[2].toUpperCase() : '';
      return `${gradeNum}${section}`;
    }
    return normalized.toUpperCase();
  };

  const mapStudentsToExams = () => {
    // Map each student to all exams they're enrolled in
    const mapping: Record<string, any[]> = {};

    students.forEach((student: any) => {
      const studentId = String(student.id || student._id);
      const studentClass = student.class || '';
      const normalizedStudentClass = normalizeClass(studentClass);
      
      // Find all exams where this student's class is assigned
      const studentExamsList = exams.filter((exam: any) => {
        const examClasses = exam.classes || [];
        if (examClasses.length === 0) return false;
        
        return examClasses.some((examClass: string) => {
          const normalizedExamClass = normalizeClass(examClass);
          
          // Direct match
          if (normalizedStudentClass === normalizedExamClass) {
            return true;
          }
          
          // If exam class is just grade number (e.g., "1"), match any section of that grade
          if (/^\d+$/.test(normalizedExamClass)) {
            const studentGradeMatch = normalizedStudentClass.match(/^(\d+)/);
            return studentGradeMatch && studentGradeMatch[1] === normalizedExamClass;
          }
          
          // If student class is just grade number, match any section of that grade in exam
          if (/^\d+$/.test(normalizedStudentClass)) {
            const examGradeMatch = normalizedExamClass.match(/^(\d+)/);
            return examGradeMatch && examGradeMatch[1] === normalizedStudentClass;
          }
          
          return false;
        });
      });

      if (studentExamsList.length > 0) {
        mapping[studentId] = studentExamsList;
      }
    });

    setStudentExams(mapping);
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }

    // Filter by grade
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => {
        const studentClass = s.class || '';
        return studentClass.toLowerCase().includes(selectedGrade.toLowerCase());
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        (s.studentId || s.id)?.toString().toLowerCase().includes(term) ||
        s.class?.toLowerCase().includes(term)
      );
    }

    // Only show students who have exams
    filtered = filtered.filter(s => {
      const studentId = String(s.id || s._id);
      return studentExams[studentId] && studentExams[studentId].length > 0;
    });

    setFilteredStudents(filtered);
  };

  const getUniqueClasses = () => {
    const classes = students.map(s => s.class).filter(Boolean);
    return Array.from(new Set(classes)).sort();
  };

  const handlePreview = (student: any) => {
    setPreviewStudent(student);
    setIsPreviewModalOpen(true);
  };

  const handlePrint = (student: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateAdmitCardHTML(student));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintAll = () => {
    filteredStudents.forEach((student, index) => {
      setTimeout(() => {
        handlePrint(student);
      }, index * 500); // Delay to prevent print dialog overlap
    });
  };

  const handleDownloadAll = () => {
    // Generate PDF for all students (would need PDF library)
    alert('Download all admit cards feature - to be implemented with PDF library');
  };

  const generateAdmitCardHTML = (student: any) => {
    const studentId = String(student.id || student._id);
    const studentExamsList = studentExams[studentId] || [];
    
    // Get exam names for display (all unique exam names)
    const examNames = Array.from(new Set(studentExamsList.map((exam: any) => exam.name).filter((name: any) => Boolean(name))));
    const examNamesDisplay = examNames.length > 0 ? examNames.join(', ') : 'All Examinations';

    // Helper function to calculate end time
    const calculateEndTime = (startTime: string, duration: string): string => {
      if (!startTime || !duration) return 'N/A';
      
      try {
        // Parse start time (format: "HH:MM" or "HH:MM AM/PM")
        let startHour = 0, startMinute = 0;
        const timeMatch = startTime.match(/(\d+):(\d+)/);
        if (timeMatch) {
          startHour = parseInt(timeMatch[1]);
          startMinute = parseInt(timeMatch[2]);
        }
        
        // Parse duration (format: "2h", "2h 30m", "2 hours", etc.)
        let durationHours = 0, durationMinutes = 0;
        const hourMatch = duration.match(/(\d+)\s*h/i);
        const minuteMatch = duration.match(/(\d+)\s*m/i);
        if (hourMatch) durationHours = parseInt(hourMatch[1]);
        if (minuteMatch) durationMinutes = parseInt(minuteMatch[1]);
        
        // Calculate end time
        let endHour = startHour + durationHours;
        let endMinute = startMinute + durationMinutes;
        if (endMinute >= 60) {
          endHour += Math.floor(endMinute / 60);
          endMinute = endMinute % 60;
        }
        if (endHour >= 24) {
          endHour = endHour % 24;
        }
        
        return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      } catch (e) {
        return 'N/A';
      }
    };

    // Generate exams table rows
    const examsRows = studentExamsList.map((exam: any, index: number) => {
      const examDate = exam.date ? new Date(exam.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A';
      // const examTime = exam.time || exam.startTime || 'N/A';
      const startTime = exam.startTime || exam.time || 'N/A';
      const endTime = calculateEndTime(startTime, exam.duration || '');
      const subjectCode = exam.subjectId?.code || '';
      const subjectName = exam.subject || 'N/A';
      const venue = exam.venue || exam.room || exam.venueName || 'N/A';
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          <td style="padding: 10px; text-align: center; border-right: 1px solid #e0e0e0;">${index + 1}</td>
          <td style="padding: 10px; border-right: 1px solid #e0e0e0;">
            ${subjectCode ? `<strong>${subjectCode}</strong> - ` : ''}
            ${subjectName}
          </td>
          <td style="padding: 10px; border-right: 1px solid #e0e0e0;">${examDate}</td>
          <td style="padding: 10px; border-right: 1px solid #e0e0e0;">${startTime}</td>
          <td style="padding: 10px; border-right: 1px solid #e0e0e0;">${endTime}</td>
          <td style="padding: 10px;">${venue}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admit Card</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f5f5f5;
            }
            .admit-card {
              background: white;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 30px;
              max-width: 800px;
              margin: 0 auto;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header-content {
              flex: 1;
              text-align: center;
            }
            .header h1 {
              color: #2563eb;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .photo-section {
              width: 120px;
              height: 150px;
              border: 1px dashed #ccc;
              padding: 10px;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .info-field {
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              color: #333;
              font-size: 12px;
              margin-bottom: 3px;
            }
            .info-value {
              color: #666;
              font-size: 14px;
            }
            .exams-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 1px solid #d1d5db;
            }
            .exams-table th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: bold;
              border: 1px solid #1e40af;
              border-bottom: 2px solid #1e40af;
            }
            .exams-table td {
              padding: 10px;
              font-size: 13px;
              border-right: 1px solid #e0e0e0;
              border-bottom: 1px solid #e0e0e0;
            }
            .exams-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .exams-table tr:nth-child(odd) {
              background: #ffffff;
            }
            .exams-table tr:hover {
              background: #f3f4f6;
            }
            .instructions {
              border-top: 1px solid #e5e5e5;
              padding-top: 20px;
              margin-top: 20px;
            }
            .instructions h3 {
              color: #2563eb;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .instructions ul {
              list-style: none;
              padding-left: 0;
            }
            .instructions li {
              padding: 5px 0;
              color: #666;
              font-size: 13px;
            }
            .signature {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
            }
            .signature div {
              text-align: center;
              border-top: 1px solid #ccc;
              padding-top: 10px;
              width: 45%;
            }
            @media print {
              body { background: white; padding: 0; }
              .admit-card { border: 2px solid #000; box-shadow: none; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="admit-card">
            <div class="header">
              <div style="flex: 0 0 auto;">
                <div class="brand-name">MySchool</div>
              </div>
              <div class="header-content">
                <h1>EXAM ADMIT CARD</h1>
                <p>Academic Year ${new Date().getFullYear()}</p>
                <p style="margin-top: 5px; font-size: 13px; font-weight: 600; color: #333;">${examNamesDisplay}</p>
              </div>
              <div class="photo-section">
                <div style="width: 100%; height: 100%; border: 1px solid #ccc; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
                  Photo
                </div>
              </div>
            </div>
            <div class="student-info">
              <div class="info-field">
                <div class="info-label">Student ID</div>
                <div class="info-value">${student.studentId || student.id || 'N/A'}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Student Name</div>
                <div class="info-value"><strong>${student.name || 'N/A'}</strong></div>
              </div>
              <div class="info-field">
                <div class="info-label">Class</div>
                <div class="info-value">${student.class || 'N/A'}</div>
              </div>
              <div class="info-field">
                <div class="info-label">Section</div>
                <div class="info-value">${student.section || 'N/A'}</div>
              </div>
            </div>
            <h3 style="color: #2563eb; margin: 20px 0 10px 0; font-size: 16px;">Examination Schedule</h3>
            <table class="exams-table">
              <thead>
                <tr>
                  <th style="text-align: center; width: 40px; border-right: 1px solid #1e40af;">Sr.</th>
                  <th style="border-right: 1px solid #1e40af;">Subject</th>
                  <th style="border-right: 1px solid #1e40af;">Date</th>
                  <th style="border-right: 1px solid #1e40af;">Start Time</th>
                  <th style="border-right: 1px solid #1e40af;">End Time</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                ${examsRows || '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999; border-right: 1px solid #e0e0e0;">No exams scheduled</td></tr>'}
              </tbody>
            </table>
            <div class="instructions">
              <h3>Instructions:</h3>
              <ul>
                <li>✓ Bring this admit card to the examination hall</li>
                <li>✓ Arrive 15 minutes before the exam time</li>
                <li>✓ Bring required stationery items</li>
                <li>✓ Mobile phones and electronic devices are not allowed</li>
                <li>✓ Follow all examination rules and regulations</li>
                <li>✓ Keep this card safe and bring it for all examinations</li>
              </ul>
            </div>
            <div class="signature">
              <div>
                <div style="font-weight: bold;">Student Signature</div>
              </div>
              <div>
                <div style="font-weight: bold;">Authorized Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const columns: TableColumn[] = [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (_value: any, row: any) => {
        if (!row) return 'N/A';
        return row.studentId || row.id || row._id || 'N/A';
      }
    },
    {
      key: 'name',
      header: 'Student Name',
      render: (_value: any, row: any) => {
        if (!row) return <strong>N/A</strong>;
        return <strong>{row.name || 'N/A'}</strong>;
      }
    },
    {
      key: 'class',
      header: 'Class',
      render: (_value: any, row: any) => row?.class || 'N/A'
    },
    {
      key: 'section',
      header: 'Section',
      render: (_value: any, row: any) => row?.section || 'N/A'
    },
    {
      key: 'examsCount',
      header: 'Exams',
      render: (_value: any, row: any) => {
        if (!row) return <Badge variant="info" size="sm">0 Exams</Badge>;
        const studentId = String(row.id || row._id || '');
        const examsList = studentExams[studentId] || [];
        return (
          <Badge variant="info" size="sm">
            {examsList.length} {examsList.length === 1 ? 'Exam' : 'Exams'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, row: any) => {
        if (!row) return null;
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePreview(row)}
            >
              <FileText size={16} />
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePrint(row)}
            >
              <Printer size={16} />
              Print
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Generate Admit Cards</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Generate admit cards showing all exams for each student
          </p>
        </div>
        {filteredStudents.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              onClick={handlePrintAll}
            >
              <Printer size={18} />
              Print All
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadAll}
            >
              <Download size={18} />
              Download All
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      {students.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search by name, ID, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e0e0e0',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e0e0e0',
                fontSize: '0.9rem',
                background: 'white'
              }}
            >
              <option value="all">All Classes</option>
              {getUniqueClasses().map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '120px' }}>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e0e0e0',
                fontSize: '0.9rem',
                background: 'white'
              }}
            >
              <option value="all">All Grades</option>
              {Array.from(new Set(students.map(s => {
                const classStr = s.class || '';
                const match = classStr.match(/grade\s*(\d+)/i);
                return match ? `Grade ${match[1]}` : null;
              }).filter(Boolean))).sort().map(grade => (
                <option key={grade || ''} value={grade || ''}>{grade}</option>
              ))}
            </select>
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            Showing {filteredStudents.length} of {students.filter(s => {
              const studentId = String(s.id || s._id);
              return studentExams[studentId] && studentExams[studentId].length > 0;
            }).length} students with exams
          </div>
        </div>
      )}

      {/* Students Table */}
      {students.length > 0 && (
        <div className="table-container">
          <Table
            data={filteredStudents}
            columns={columns}
            emptyMessage="No students found with exams"
          />
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Admit Card Preview"
        size="lg"
      >
        {previewStudent && (
          <div>
            <div style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '20px',
              background: 'white',
              marginBottom: '1rem',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 0, flexShrink: 0 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '5px' }}>MySchool</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h2 style={{ color: '#2563eb', margin: 0 }}>EXAM ADMIT CARD</h2>
                  <p style={{ color: '#666', margin: '5px 0 0 0' }}>Academic Year {new Date().getFullYear()}</p>
                  {(() => {
                    const studentId = String(previewStudent.id || previewStudent._id);
                    const examsList = studentExams[studentId] || [];
                    const examNames = Array.from(new Set(examsList.map((exam: any) => exam.name).filter((name: any) => Boolean(name))));
                    const examNamesDisplay = examNames.length > 0 ? examNames.join(', ') : 'All Examinations';
                    return (
                      <p style={{ marginTop: '5px', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                        {examNamesDisplay}
                      </p>
                    );
                  })()}
                </div>
                <div style={{ width: '120px', height: '150px', border: '1px dashed #ccc', padding: '10px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', border: '1px solid #ccc', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                    Photo
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
                <div><strong>Student ID:</strong> {previewStudent.studentId || previewStudent.id || 'N/A'}</div>
                <div><strong>Student Name:</strong> {previewStudent.name || 'N/A'}</div>
                <div><strong>Class:</strong> {previewStudent.class || 'N/A'}</div>
                <div><strong>Section:</strong> {previewStudent.section || 'N/A'}</div>
              </div>
              <h3 style={{ color: '#2563eb', margin: '20px 0 10px 0', fontSize: '16px' }}>Examination Schedule</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ background: '#2563eb', color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>Sr.</th>
                    <th style={{ padding: '10px', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>Subject</th>
                    <th style={{ padding: '10px', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>Date</th>
                    <th style={{ padding: '10px', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>Start Time</th>
                    <th style={{ padding: '10px', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>End Time</th>
                    <th style={{ padding: '10px', fontSize: '12px', border: '1px solid #1e40af', borderBottom: '2px solid #1e40af' }}>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const studentId = String(previewStudent.id || previewStudent._id);
                    const examsList = studentExams[studentId] || [];
                    
                    const calculateEndTime = (startTime: string, duration: string): string => {
                      if (!startTime || !duration) return 'N/A';
                      try {
                        const timeMatch = startTime.match(/(\d+):(\d+)/);
                        if (!timeMatch) return 'N/A';
                        let startHour = parseInt(timeMatch[1]);
                        let startMinute = parseInt(timeMatch[2]);
                        const hourMatch = duration.match(/(\d+)\s*h/i);
                        const minuteMatch = duration.match(/(\d+)\s*m/i);
                        let durationHours = hourMatch ? parseInt(hourMatch[1]) : 0;
                        let durationMinutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
                        let endHour = startHour + durationHours;
                        let endMinute = startMinute + durationMinutes;
                        if (endMinute >= 60) {
                          endHour += Math.floor(endMinute / 60);
                          endMinute = endMinute % 60;
                        }
                        if (endHour >= 24) endHour = endHour % 24;
                        return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                      } catch (e) {
                        return 'N/A';
                      }
                    };
                    
                    return examsList.length > 0 ? examsList.map((exam: any, index: number) => {
                      const examDate = exam.date ? new Date(exam.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A';
                      const subjectCode = exam.subjectId?.code || '';
                      const subjectName = exam.subject || 'N/A';
                      const startTime = exam.startTime || exam.time || 'N/A';
                      const endTime = calculateEndTime(startTime, exam.duration || '');
                      const venue = exam.venue || exam.room || exam.venueName || 'N/A';
                      return (
                        <tr key={exam._id || exam.id} style={{ borderBottom: '1px solid #e0e0e0', background: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>{index + 1}</td>
                          <td style={{ padding: '10px', borderRight: '1px solid #e0e0e0' }}>
                            {subjectCode ? <strong>{subjectCode}</strong> : ''}
                            {subjectCode ? ' - ' : ''}
                            {subjectName}
                          </td>
                          <td style={{ padding: '10px', borderRight: '1px solid #e0e0e0' }}>{examDate}</td>
                          <td style={{ padding: '10px', borderRight: '1px solid #e0e0e0' }}>{startTime}</td>
                          <td style={{ padding: '10px', borderRight: '1px solid #e0e0e0' }}>{endTime}</td>
                          <td style={{ padding: '10px' }}>{venue}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#999', borderRight: '1px solid #e0e0e0' }}>
                          No exams scheduled
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '15px' }}>
                <h3 style={{ color: '#2563eb', fontSize: '14px', marginBottom: '10px' }}>Instructions:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Bring this admit card to the examination hall</li>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Arrive 15 minutes before the exam time</li>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Bring required stationery items</li>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Mobile phones and electronic devices are not allowed</li>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Follow all examination rules and regulations</li>
                  <li style={{ padding: '3px 0', fontSize: '12px', color: '#666' }}>✓ Keep this card safe and bring it for all examinations</li>
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handlePrint(previewStudent)}
              >
                <Printer size={18} />
                Print
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {students.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#999',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '0.75rem'
        }}>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading students and exams...</p>
        </div>
      )}
    </div>
  );
};

export default AdmitCards;

