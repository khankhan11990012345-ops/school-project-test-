import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Printer } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Exams.css';

const ExamResults = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSelectedClass, setPrintSelectedClass] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedClass, examResults]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load students
      const studentsResponse = await api.students.getAll() as any;
      const allStudents = studentsResponse.data?.students || studentsResponse.data || [];
      
      // Load exam results
      const resultsResponse = await api.examResults.getAll() as any;
      const allResults = resultsResponse.data?.results || resultsResponse.data || [];
      
      setStudents(allStudents);
      setExamResults(allResults);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallPercentage = (student: any): number => {
    const studentId = student.studentId || student.id || student._id;
    const studentResults = examResults.filter((result: any) => {
      const resultStudentId = result.studentId?.studentId || result.studentId?._id || result.studentId;
      return String(resultStudentId) === String(studentId);
    });

    if (studentResults.length === 0) return 0;

    const totalObtained = studentResults.reduce((sum: number, result: any) => {
      return sum + (result.marksObtained || 0);
    }, 0);

    const totalPossible = studentResults.reduce((sum: number, result: any) => {
      return sum + (result.totalMarks || 0);
    }, 0);

    if (totalPossible === 0) return 0;
    return (totalObtained / totalPossible) * 100;
  };

  const getTotalMarks = (student: any): { obtained: number; total: number } => {
    const studentId = student.studentId || student.id || student._id;
    const studentResults = examResults.filter((result: any) => {
      const resultStudentId = result.studentId?.studentId || result.studentId?._id || result.studentId;
      return String(resultStudentId) === String(studentId);
    });

    if (studentResults.length === 0) {
      return { obtained: 0, total: 0 };
    }

    const totalObtained = studentResults.reduce((sum: number, result: any) => {
      return sum + (result.marksObtained || 0);
    }, 0);

    const totalPossible = studentResults.reduce((sum: number, result: any) => {
      return sum + (result.totalMarks || 0);
    }, 0);

    return { obtained: totalObtained, total: totalPossible };
  };

  const getOverallStatus = (student: any): { status: string; variant: string } => {
    const studentId = student.studentId || student.id || student._id;
    const studentResults = examResults.filter((result: any) => {
      const resultStudentId = result.studentId?.studentId || result.studentId?._id || result.studentId;
      return String(resultStudentId) === String(studentId);
    });

    if (studentResults.length === 0) {
      return { status: 'No Results', variant: 'secondary' };
    }

    // Check if all exams are passed
    const allPassed = studentResults.every((result: any) => {
      const status = result.status || '';
      return status.toLowerCase() === 'pass' || status.toLowerCase() === 'passed';
    });

    // Also check overall percentage (consider 50% as passing threshold)
    const overallPercentage = calculateOverallPercentage(student);
    const passedByPercentage = overallPercentage >= 50;

    if (allPassed && passedByPercentage) {
      return { status: 'Pass', variant: 'excellent' };
    } else if (allPassed || passedByPercentage) {
      return { status: 'Pass', variant: 'excellent' };
    } else {
      return { status: 'Fail', variant: 'poor' };
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class === selectedClass);
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

    setFilteredStudents(filtered);
  };

  const getUniqueClasses = () => {
    const classes = students.map(s => s.class).filter(Boolean);
    return Array.from(new Set(classes)).sort();
  };

  const handleStudentClick = (student: any) => {
    const studentId = student.studentId || student.id || student._id;
    navigate(`/dashboard/admin/exams/results/${studentId}`);
  };

  const handlePrint = () => {
    // Filter students based on selected class
    const classStudents = printSelectedClass === 'all' 
      ? students 
      : students.filter(s => s.class === printSelectedClass);
    
    const classResults = classStudents.map(student => {
      const percentage = calculateOverallPercentage(student);
      const { obtained, total } = getTotalMarks(student);
      const { status, variant } = getOverallStatus(student);
      return {
        studentId: student.studentId || student.id || student._id,
        name: student.name,
        class: student.class,
        marks: total > 0 ? `${obtained} / ${total}` : 'N/A',
        percentage: percentage.toFixed(1),
        status: status,
        variant: variant
      };
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the results');
      return;
    }

    const tableRows = classResults.map((result, index) => {
      const getPercentageColor = (percent: number) => {
        if (percent >= 90) return '#065f46';
        if (percent >= 80) return '#92400e';
        if (percent >= 70) return '#9a3412';
        return '#991b1b';
      };
      const getStatusColor = (variant: string) => {
        if (variant === 'excellent') return '#065f46';
        if (variant === 'poor') return '#991b1b';
        return '#64748b';
      };
      const percentage = parseFloat(result.percentage);
      return `
        <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          <td style="padding: 10px; text-align: center; border-right: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 10px; border-right: 1px solid #e5e7eb; color: #2563eb; font-weight: 600;">${result.studentId}</td>
          <td style="padding: 10px; border-right: 1px solid #e5e7eb;"><strong>${result.name}</strong></td>
          <td style="padding: 10px; border-right: 1px solid #e5e7eb;">${result.class}</td>
          <td style="padding: 10px; text-align: center; border-right: 1px solid #e5e7eb; font-weight: 600;">${result.marks}</td>
          <td style="padding: 10px; text-align: center; border-right: 1px solid #e5e7eb;">
            <span style="
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: 700;
              font-size: 0.75rem;
              color: ${getPercentageColor(percentage)};
              background: ${getPercentageColor(percentage)}20;
            ">${result.percentage}%</span>
          </td>
          <td style="padding: 10px; text-align: center;">
            <span style="
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: 700;
              font-size: 0.75rem;
              color: ${getStatusColor(result.variant)};
              background: ${getStatusColor(result.variant)}20;
            ">${result.status}</span>
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exam Results - ${printSelectedClass}</title>
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
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              color: #1f2937;
              background: #ffffff;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 3px solid #1e40af;
            }
            .header h1 {
              margin: 0 0 5px 0;
              color: #1e40af;
              font-size: 24px;
              font-weight: 700;
            }
            .header p {
              margin: 5px 0;
              color: #64748b;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              border: 2px solid #e2e8f0;
              border-radius: 6px;
              overflow: hidden;
            }
            thead {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
            }
            th {
              padding: 12px 10px;
              text-align: left;
              font-weight: 700;
              font-size: 0.8rem;
              text-transform: uppercase;
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
            }
            tbody tr:last-child {
              border-bottom: none;
            }
            td {
              padding: 10px;
              font-size: 0.85rem;
              border-right: 1px solid #e5e7eb;
            }
            td:last-child {
              border-right: none;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #64748b;
              font-size: 0.8rem;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EXAM RESULTS</h1>
            <p>${printSelectedClass === 'all' ? 'All Classes' : `Class: ${printSelectedClass}`}</p>
            <p>Academic Year ${new Date().getFullYear()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 40px;">Sr.</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th style="text-align: center;">Marks</th>
                <th style="text-align: center;">Percentage</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
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
    setIsPrintModalOpen(false);
  };

  const columns: TableColumn[] = [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (_value: any, row: any) => {
        const studentId = row.studentId || row.id || row._id || 'N/A';
        return (
          <span
            style={{
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600
            }}
            onClick={() => handleStudentClick(row)}
          >
            {studentId}
          </span>
        );
      }
    },
    {
      key: 'name',
      header: 'Student Name',
      render: (_value: any, row: any) => <strong>{row?.name || 'N/A'}</strong>
    },
    {
      key: 'class',
      header: 'Class',
      render: (_value: any, row: any) => row?.class || 'N/A'
    },
    {
      key: 'totalMarks',
      header: 'Marks',
      render: (_value: any, row: any) => {
        const { obtained, total } = getTotalMarks(row);
        if (total === 0) {
          return <span style={{ color: '#999' }}>N/A</span>;
        }
        return (
          <span style={{ fontWeight: 600, color: '#1e293b' }}>
            {obtained} / {total}
          </span>
        );
      }
    },
    {
      key: 'overallPercentage',
      header: 'Percentage',
      render: (_value: any, row: any) => {
        const percentage = calculateOverallPercentage(row);
        const getPercentageVariant = (percent: number) => {
          if (percent >= 90) return 'excellent'; // Green
          if (percent >= 80) return 'warning'; // Yellow
          if (percent >= 70) return 'average'; // Orange
          return 'poor'; // Red
        };
        return (
          <Badge variant={getPercentageVariant(percentage) as any} size="sm">
            {percentage.toFixed(1)}%
          </Badge>
        );
      }
    },
    {
      key: 'overallStatus',
      header: 'Status',
      render: (_value: any, row: any) => {
        const { status, variant } = getOverallStatus(row);
        return (
          <Badge variant={variant as any} size="sm">
            {status}
          </Badge>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Exam Results</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Click on a student ID to view their exam report
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsPrintModalOpen(true)}
          style={{ marginTop: '0.5rem' }}
        >
          <Printer size={18} style={{ marginRight: '0.5rem' }} />
          Print Results
        </Button>
      </div>

      {/* Print Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Print Exam Results"
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
              Select Class
            </label>
            <select
              value={printSelectedClass}
              onChange={(e) => setPrintSelectedClass(e.target.value)}
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setIsPrintModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
            >
              <Printer size={16} style={{ marginRight: '0.5rem' }} />
              Print
            </Button>
          </div>
        </div>
      </Modal>

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
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      )}

      {/* Students Table */}
      {students.length > 0 && (
        <div className="table-container">
          <Table
            data={filteredStudents}
            columns={columns}
            emptyMessage="No students found"
          />
        </div>
      )}

      {students.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#999',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '0.75rem'
        }}>
          <GraduationCap size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No students found</p>
        </div>
      )}
    </div>
  );
};

export default ExamResults;
