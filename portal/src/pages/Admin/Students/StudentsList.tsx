import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, GraduationCap, Users, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { ViewButton, EditButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { Table, TableColumn } from '../../../components/Table';
import { Button } from '../../../components/Button';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Students.css';

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    // Load students from API
    const loadStudents = async () => {
      try {
        const response = await api.students.getAll() as any;
        if (response.data?.students) {
          setStudents(response.data.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error loading students:', error);
        setStudents([]);
      }
    };
    loadStudents();

    // Refresh interval (since we can't use storage events for API)
    const interval = setInterval(() => {
      loadStudents();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'active' ? 'active' : 'rejected';
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: number | string) => {
    const student = displayedStudents.find(s => String(s.id) === String(studentId));
    if (student && confirm(`Are you sure you want to delete "${student.name}"?`)) {
      try {
        // Use MongoDB _id for deletion
        const idToDelete = student.mongoId || student._id || studentId;
        await api.students.delete(idToDelete);
        const response = await api.students.getAll() as any;
        if (response.data?.students) {
          setStudents(response.data.students);
        }
        alert('Student deleted successfully!');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  // Map all students (no grade filter - show all students)
  const filteredStudents = useMemo(() => {
    // Map students to include id (studentId) and mongoId (_id) for operations
    return students.map(student => ({
      ...student,
      id: student.studentId || student._id || student.id, // Display studentId (S001) in table
      mongoId: student._id || student.id, // Use MongoDB _id for API operations
    }));
  }, [students]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  
  // Get students for current page
  const displayedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, startIndex, endIndex]);

  // Reset to page 1 when filtered students change (but only if current page is out of bounds)
  useEffect(() => {
    const maxPage = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [filteredStudents.length, currentPage, studentsPerPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: TableColumn<any>[] = [
    { 
      key: 'id', 
      header: 'Student ID',
      render: (value, row) => (
        <span
          style={{
            color: '#3b82f6',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: 600,
          }}
          onClick={() => navigate(`/dashboard/admin/students/${row.mongoId || row._id || row.id}`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#3b82f6';
          }}
        >
          {value || row.studentId || row.id || 'N/A'}
        </span>
      )
    },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'class', header: 'Class' },
    { key: 'phone', header: 'Phone' },
    { key: 'parent', header: 'Parent/Guardian' },
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
          <ViewButton size="sm" onClick={() => handleViewStudent(row)} />
          <EditButton size="sm" onClick={() => navigate(`/dashboard/admin/students/edit/${row.mongoId || row._id || row.id}`)} />
          <DeleteButton size="sm" onClick={() => handleDeleteStudent(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>All Students</h1>
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        data={displayedStudents}
        emptyMessage="No students found"
      />

      {/* Pagination Controls */}
      {filteredStudents.length > studentsPerPage && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginTop: '2rem',
          padding: '1rem'
        }}>
          <Button
            variant="secondary"
            size="md"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(() => {
              const pages: (number | string)[] = [];
              
              // If total pages is 7 or less, show all pages
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                // Calculate which pages to show
                let startPage = Math.max(2, currentPage - 1);
                let endPage = Math.min(totalPages - 1, currentPage + 1);
                
                // Adjust if we're near the start
                if (currentPage <= 3) {
                  endPage = Math.min(5, totalPages - 1);
                }
                
                // Adjust if we're near the end
                if (currentPage >= totalPages - 2) {
                  startPage = Math.max(2, totalPages - 4);
                }
                
                // Add ellipsis after first page if needed
                if (startPage > 2) {
                  pages.push('...');
                }
                
                // Add middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                
                // Add ellipsis before last page if needed
                if (endPage < totalPages - 1) {
                  pages.push('...');
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages.map((page, index) => {
                if (typeof page === 'string') {
                  return (
                    <span key={`ellipsis-${index}`} style={{ padding: '0 0.25rem', color: '#666' }}>
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.375rem',
                      backgroundColor: currentPage === page ? '#3b82f6' : '#fff',
                      color: currentPage === page ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: currentPage === page ? 600 : 400,
                      minWidth: '2.5rem',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {/* View Student Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <ViewForm
            sections={[
              {
                title: 'Student Information',
                fields: [
                  { label: 'Name', value: selectedStudent.name },
                  { label: 'Email', value: selectedStudent.email, icon: Mail },
                  { label: 'Phone', value: selectedStudent.phone, icon: Phone },
                  { label: 'Class', value: selectedStudent.class, icon: GraduationCap },
                  ...(selectedStudent.dateOfBirth ? [{ label: 'Date of Birth', value: selectedStudent.dateOfBirth, icon: Calendar }] : []),
                  ...(selectedStudent.admissionDate ? [{ label: 'Admission Date', value: selectedStudent.admissionDate, icon: Calendar }] : []),
                  { 
                    label: 'Status', 
                    value: selectedStudent.status, 
                    renderAsBadge: { variant: getStatusVariant(selectedStudent.status) as any, size: 'sm' }
                  },
                  ...(selectedStudent.address ? [{ label: 'Address', value: selectedStudent.address, icon: MapPin, spanFull: true }] : []),
                ],
              },
              {
                title: 'Parent/Guardian Information',
                icon: Users,
                fields: [
                  { label: 'Parent/Guardian Name', value: selectedStudent.parent },
                  ...(selectedStudent.parentPhone ? [{ label: 'Parent Phone', value: selectedStudent.parentPhone, icon: Phone }] : []),
                  ...(selectedStudent.parentEmail ? [{ label: 'Parent Email', value: selectedStudent.parentEmail, icon: Mail }] : []),
                ],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default StudentsList;
