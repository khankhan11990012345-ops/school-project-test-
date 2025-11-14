import { useState, useEffect } from 'react';
import { FileText, Calendar, BookOpen, Clock } from 'lucide-react';
import { ViewButton, EditButton, DeleteButton, AddButton } from '../../components/Button/iconbuttons';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ViewForm } from '../../components/Form';
import { CreateFormModal } from '../../components/Form';
import { FormField } from '../../components/Form/CreateForm';
import api from '../../services/api';
import '../../styles/universal.css';
import './Teacher.css';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  class: string;
  assignedDate: string;
  dueDate: string;
  status: string;
  submittedBy: number;
  totalStudents: number;
  description: string;
}

const TeacherAssignments = () => {
  // Initialize with 3 assignments, sorted by assigned date in ascending order
  const initialAssignments: Assignment[] = [
    {
      id: 3,
      title: 'Science Project - Solar System',
      subject: 'Science',
      class: 'Grade 8A',
      assignedDate: '2024-03-08',
      dueDate: '2024-03-25',
      status: 'Active',
      submittedBy: 18,
      totalStudents: 25,
      description: 'Create a model of the solar system with all planets',
    },
    {
      id: 1,
      title: 'Mathematics Homework - Chapter 5',
      subject: 'Mathematics',
      class: 'Grade 10A',
      assignedDate: '2024-03-10',
      dueDate: '2024-03-20',
      status: 'Active',
      submittedBy: 25,
      totalStudents: 30,
      description: 'Complete exercises 1-10 from Chapter 5',
    },
    {
      id: 2,
      title: 'English Essay - Descriptive Writing',
      subject: 'English',
      class: 'Grade 9B',
      assignedDate: '2024-03-12',
      dueDate: '2024-03-22',
      status: 'Active',
      submittedBy: 20,
      totalStudents: 28,
      description: 'Write a 500-word descriptive essay about your favorite place',
    },
  ].sort((a, b) => {
    // Sort by assigned date in ascending order (oldest first)
    const dateA = new Date(a.assignedDate).getTime();
    const dateB = new Date(b.assignedDate).getTime();
    return dateA - dateB;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadClassOptions = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes
            .filter((c: any) => c.status === 'Active')
            .map((c: any) => ({
              value: c.id,
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

  const getStatusVariant = (status: string) => {
    return status.toLowerCase() === 'active' ? 'active' : 'pending';
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsViewModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssignment) {
      setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
      setIsDeleteModalOpen(false);
      setSelectedAssignment(null);
      alert('Assignment deleted successfully!');
    }
  };

  const handleCreateAssignment = (data: Record<string, any>) => {
    const newAssignment: Assignment = {
      id: assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1,
      title: data.title,
      subject: data.subject,
      class: data.class,
      assignedDate: data.assignedDate,
      dueDate: data.dueDate,
      status: 'Active',
      submittedBy: 0,
      totalStudents: parseInt(data.totalStudents) || 0,
      description: data.description || '',
    };
    // Add new assignment and sort by assigned date (ascending), then keep only first 3
    const updatedAssignments = [...assignments, newAssignment]
      .sort((a, b) => {
        const dateA = new Date(a.assignedDate).getTime();
        const dateB = new Date(b.assignedDate).getTime();
        return dateA - dateB; // Ascending order
      })
      .slice(0, 3); // Keep only first 3
    setAssignments(updatedAssignments);
    setIsCreateModalOpen(false);
    alert('Assignment created successfully!');
  };

  const handleUpdateAssignment = (data: Record<string, any>) => {
    if (selectedAssignment) {
      setAssignments(assignments.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              title: data.title || a.title,
              subject: data.subject || a.subject,
              class: data.class || a.class,
              assignedDate: data.assignedDate || a.assignedDate,
              dueDate: data.dueDate || a.dueDate,
              description: data.description || a.description,
            }
          : a
      ));
      setIsEditModalOpen(false);
      setSelectedAssignment(null);
      alert('Assignment updated successfully!');
    }
  };

  const assignmentFields: FormField[] = [
    { name: 'title', label: 'Assignment Title', type: 'text', required: true, spanFull: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'class', label: 'Class', type: 'select', options: classOptions, required: true },
    { name: 'assignedDate', label: 'Assigned Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { name: 'totalStudents', label: 'Total Students', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'textarea', spanFull: true },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Assignments</h1>
        <AddButton
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          title="Create New Assignment"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Assigned Date</th>
              <th>Due Date</th>
              <th>Submissions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  No assignments found
                </td>
              </tr>
            ) : (
              assignments.slice(0, 3).map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.id}</td>
                  <td>
                    <strong>{assignment.title}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={14} style={{ color: '#666' }} />
                      {assignment.subject}
                    </div>
                  </td>
                  <td>{assignment.class}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} style={{ color: '#666' }} />
                      {assignment.assignedDate}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: '#666' }} />
                      {assignment.dueDate}
                    </div>
                  </td>
                  <td>
                    {assignment.submittedBy} / {assignment.totalStudents}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(assignment.status)} size="sm">
                      {assignment.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ViewButton size="sm" onClick={() => handleViewAssignment(assignment)} />
                      <EditButton size="sm" onClick={() => handleEditAssignment(assignment)} />
                      <DeleteButton size="sm" onClick={() => handleDeleteAssignment(assignment)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Assignment Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Assignment Details"
        size="lg"
      >
        {selectedAssignment && (
          <ViewForm
            sections={[
              {
                title: 'Assignment Information',
                icon: FileText,
                fields: [
                  { label: 'Title', value: selectedAssignment.title },
                  { label: 'Subject', value: selectedAssignment.subject, icon: BookOpen },
                  { label: 'Class', value: selectedAssignment.class },
                  { label: 'Assigned Date', value: selectedAssignment.assignedDate, icon: Calendar },
                  { label: 'Due Date', value: selectedAssignment.dueDate, icon: Clock },
                  { label: 'Submissions', value: `${selectedAssignment.submittedBy} / ${selectedAssignment.totalStudents}` },
                  {
                    label: 'Status',
                    value: selectedAssignment.status,
                    renderAsBadge: { variant: getStatusVariant(selectedAssignment.status) as any, size: 'sm' },
                  },
                  { label: 'Description', value: selectedAssignment.description, spanFull: true },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Create Assignment Modal */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assignment"
        fields={assignmentFields}
        onSubmit={handleCreateAssignment}
        submitButtonText="Create Assignment"
      />

      {/* Edit Assignment Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Edit Assignment"
        fields={assignmentFields}
        onSubmit={handleUpdateAssignment}
        submitButtonText="Update Assignment"
        initialData={selectedAssignment || {}}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Delete Assignment"
        size="md"
      >
        {selectedAssignment && (
          <div>
            <p>Are you sure you want to delete "{selectedAssignment.title}"?</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedAssignment(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: '#e53e3e',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherAssignments;

