import { useState, useEffect } from 'react';
import { Mail, Phone, GraduationCap, Users, Calendar, MapPin, Search } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { ViewButton, EditButton } from '../../components/Button/iconbuttons';
import { Modal } from '../../components/Modal';
import { ViewForm } from '../../components/Form';
import { CreateFormModal } from '../../components/Form';
import { FormField } from '../../components/Form/CreateForm';
import api from '../../services/api';
import '../../styles/universal.css';
import './Teacher.css';

const TeacherStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        // In a real app, filter by teacher's assigned classes
        // For now, show all students
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

  useEffect(() => {
    const loadClassOptions = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes
            .filter((c: any) => c.status === 'Active')
            .map((c: any) => ({
              value: c._id || c.code || c.id,
              label: `${c.name} (${c.code})`,
            }));
          setClassOptions(classes);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadClassOptions();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'active' ? 'active' : 'rejected';
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (data: Record<string, any>) => {
    if (selectedStudent) {
      try {
        const updated = await api.students.update(selectedStudent.id, {
          name: data.name || selectedStudent.name,
          email: data.email || selectedStudent.email,
          phone: data.phone || selectedStudent.phone,
          class: data.class || selectedStudent.class,
          parent: data.parent || selectedStudent.parent,
          parentPhone: data.parentPhone || selectedStudent.parentPhone,
          parentEmail: data.parentEmail || selectedStudent.parentEmail,
          address: data.address || selectedStudent.address,
          dateOfBirth: data.dateOfBirth || selectedStudent.dateOfBirth,
          admissionDate: data.admissionDate || selectedStudent.admissionDate,
          status: data.status || selectedStudent.status,
        });
        if (updated) {
          alert('Student updated successfully!');
          setIsEditModalOpen(false);
          setSelectedStudent(null);
          // Reload students
          const studentsResponse = await api.students.getAll() as any;
          const allStudents = studentsResponse?.data?.students || studentsResponse || [];
          if (Array.isArray(allStudents)) {
            setStudents(allStudents);
          }
        }
      } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
      }
    }
  };

  const editFields: FormField[] = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
    { name: 'class', label: 'Class', type: 'select', options: classOptions, required: true },
    { name: 'parent', label: 'Parent/Guardian Name', type: 'text', required: true },
    { name: 'parentPhone', label: 'Parent Phone', type: 'tel', required: true },
    { name: 'parentEmail', label: 'Parent Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text', spanFull: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ], required: true },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Students</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    <strong>{student.name}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} style={{ color: '#666' }} />
                      {student.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} style={{ color: '#666' }} />
                      {student.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GraduationCap size={14} style={{ color: '#666' }} />
                      {student.class}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(student.status)} size="sm">
                      {student.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ViewButton size="sm" onClick={() => handleViewStudent(student)} />
                      <EditButton size="sm" onClick={() => handleEditStudent(student)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                icon: Users,
                fields: [
                  { label: 'Name', value: selectedStudent.name },
                  { label: 'Email', value: selectedStudent.email, icon: Mail },
                  { label: 'Phone', value: selectedStudent.phone, icon: Phone },
                  { label: 'Class', value: selectedStudent.class, icon: GraduationCap },
                  { label: 'Date of Birth', value: selectedStudent.dateOfBirth, icon: Calendar },
                  { label: 'Admission Date', value: selectedStudent.admissionDate, icon: Calendar },
                  { label: 'Address', value: selectedStudent.address, icon: MapPin, spanFull: true },
                  {
                    label: 'Status',
                    value: selectedStudent.status,
                    renderAsBadge: { variant: getStatusVariant(selectedStudent.status) as any, size: 'sm' },
                  },
                ],
              },
              {
                title: 'Parent/Guardian Information',
                icon: Users,
                fields: [
                  { label: 'Parent Name', value: selectedStudent.parent },
                  { label: 'Parent Phone', value: selectedStudent.parentPhone, icon: Phone },
                  { label: 'Parent Email', value: selectedStudent.parentEmail, icon: Mail },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Student Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Update Student"
        fields={editFields}
        onSubmit={handleUpdateStudent}
        submitButtonText="Update Student"
        initialData={selectedStudent || {}}
      />
    </div>
  );
};

export default TeacherStudents;

