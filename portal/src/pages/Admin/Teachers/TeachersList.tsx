import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, BookOpen, Award, MapPin, Calendar, Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { ViewButton, EditButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Teachers.css';

const TeachersList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    // Load teachers from API
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        setTeachers([]);
      }
    };
    
    loadTeachers();

    // Refresh interval
    const interval = setInterval(() => {
      loadTeachers();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'active' ? 'active' : 'rejected';
  };

  // Format date to show only date without time
  const formatDateOnly = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return dateValue.toString();
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateValue.toString();
    }
  };

  const handleViewTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleEditTeacher = (teacher: any) => {
    const teacherId = teacher._id || teacher.teacherId || teacher.id;
    navigate(`/dashboard/admin/teachers/edit/${teacherId}`);
  };

  const handleDeleteTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTeacher) {
      try {
        const teacherId = selectedTeacher._id || selectedTeacher.teacherId || selectedTeacher.id;
        await api.teachers.delete(teacherId);
        alert(`Teacher ${selectedTeacher.name} deleted successfully`);
        setIsDeleteModalOpen(false);
        setSelectedTeacher(null);
        // Refresh teachers list
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher. Please try again.');
      }
    }
  };

  // Refresh list when navigating back to this page
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const columns: TableColumn<any>[] = [
    { key: 'id', header: 'ID', render: (_value, row) => row.teacherId || row._id || row.id || 'N/A' },
    {
      key: 'name',
      header: 'Name',
      render: (value, row) => (
        <span
          onClick={() => navigate(`/dashboard/admin/teachers/${row._id || row.teacherId || row.id}`)}
          style={{
            color: '#667eea',
            cursor: 'pointer',
            fontWeight: 500,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          {value || row.name || 'N/A'}
        </span>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'subject', header: 'Subject' },
    { key: 'phone', header: 'Phone' },
    { key: 'experience', header: 'Experience' },
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
          <ViewButton size="sm" onClick={() => handleViewTeacher(row)} />
          <EditButton size="sm" onClick={() => handleEditTeacher(row)} />
          <DeleteButton size="sm" onClick={() => handleDeleteTeacher(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Teachers</h1>
        <Button variant="primary" size="md" onClick={() => navigate('/dashboard/admin/teachers/add')}>
          <UserPlus size={18} />
          Add New Teacher
        </Button>
      </div>
      <Table
        columns={columns}
        data={teachers.slice(0, 10)}
        emptyMessage="No teachers found"
      />

      {/* View Teacher Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTeacher(null);
        }}
        title="Teacher Details"
        size="lg"
      >
        {selectedTeacher && (
          <ViewForm
            sections={[
              {
                title: 'Basic Information',
                fields: [
                  { label: 'Name', value: selectedTeacher.name },
                  { label: 'Email', value: selectedTeacher.email, icon: Mail },
                  { label: 'Phone', value: selectedTeacher.phone, icon: Phone },
                  { label: 'Subject', value: selectedTeacher.subject, icon: BookOpen },
                  { label: 'Experience', value: selectedTeacher.experience, icon: Award },
                  ...(selectedTeacher.qualification ? [{ label: 'Qualification', value: selectedTeacher.qualification }] : []),
                  ...(selectedTeacher.joinDate ? [{ label: 'Join Date', value: formatDateOnly(selectedTeacher.joinDate), icon: Calendar }] : []),
                  { 
                    label: 'Status', 
                    value: selectedTeacher.status, 
                    renderAsBadge: { variant: getStatusVariant(selectedTeacher.status) as any, size: 'sm' }
                  },
                  ...(selectedTeacher.address ? [{ label: 'Address', value: selectedTeacher.address, icon: MapPin, spanFull: true }] : []),
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTeacher(null);
        }}
        title="Delete Teacher"
        size="md"
      >
        {selectedTeacher && (
          <div style={{ padding: '1rem 0' }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#333' }}>
              Are you sure you want to delete <strong>{selectedTeacher.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTeacher(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={18} />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachersList;
