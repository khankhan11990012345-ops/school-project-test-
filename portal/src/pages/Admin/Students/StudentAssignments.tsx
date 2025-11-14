import { useState, useEffect } from 'react';
import { FileText, Calendar, BookOpen, Clock } from 'lucide-react';
import { ViewButton, EditButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal, FormField } from '../../../components/Form';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Students.css';

interface Assignment {
  id: number | string;
  title: string;
  subject: string;
  subjectId?: number | string;
  class: string;
  grades?: string[];
  assignedDate: string;
  dueDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  totalMarks?: number;
  description: string;
  sections?: any[];
  assignedBy?: number | string;
}

interface AssignmentWithSubmissions extends Assignment {
  submittedBy: number;
  totalStudents: number;
}

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentWithSubmissions[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmissions | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse] = await Promise.all([
        api.assignments.getAll(),
        // Note: Assignment submissions endpoint may not exist yet
        // api.assignmentSubmissions.getAll().catch(() => ({ data: { submissions: [] } })),
      ]);
      
      // For now, use empty submissions array until backend endpoint is available
      const submissionsResponse = { data: { submissions: [] } };

      // Extract data from responses
      const assignmentsData = (assignmentsResponse as any).data?.assignments || [];
      const submissionsData = submissionsResponse.data?.submissions || submissionsResponse.data || [];

      // Calculate submission counts for each assignment
      const assignmentsWithSubmissions: AssignmentWithSubmissions[] = (assignmentsData as any[]).map((assignment: any) => {
        const assignmentId = assignment._id || assignment.id;
        const submissions = (submissionsData as any[]).filter(
          (s: any) => String(s.assignmentId) === String(assignmentId)
        );
        
        // Get unique student count
        const uniqueStudents = new Set(submissions.map((s: any) => s.studentId));
        const submittedBy = uniqueStudents.size;

        // Estimate total students (you might want to get this from class data)
        // For now, we'll use a default or calculate from submissions
        const totalStudents = Math.max(submittedBy, 25); // Default minimum

        return {
          id: assignmentId,
          title: assignment.title,
          subject: assignment.subject,
          class: assignment.class,
          assignedDate: assignment.assignedDate || assignment.createdAt || new Date().toISOString().split('T')[0],
          dueDate: assignment.dueDate,
          status: assignment.status,
          totalMarks: assignment.totalMarks,
          submittedBy,
          totalStudents,
          description: assignment.description || '',
        };
      });

      // Sort by assigned date in ascending order (oldest first)
      const sortedAssignments = assignmentsWithSubmissions.sort((a, b) => {
        const dateA = new Date(a.assignedDate).getTime();
        const dateB = new Date(b.assignedDate).getTime();
        return dateA - dateB; // Ascending order
      });

      // Show only first 3 assignments
      setAssignments(sortedAssignments.slice(0, 3));
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'completed':
        return 'approved';
      case 'cancelled':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getSubmissionRate = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  const handleViewAssignment = (assignment: AssignmentWithSubmissions) => {
    setSelectedAssignment(assignment);
    setIsViewModalOpen(true);
  };

  const handleEditAssignment = (assignment: AssignmentWithSubmissions) => {
    setSelectedAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAssignment = (assignment: AssignmentWithSubmissions) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAssignment) {
      try {
        await api.assignments.delete(selectedAssignment.id);
        await loadAssignments();
        setIsDeleteModalOpen(false);
        setSelectedAssignment(null);
        alert('Assignment deleted successfully!');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment. Please try again.');
      }
    }
  };

  const handleUpdateAssignment = async (data: Record<string, any>) => {
    if (selectedAssignment) {
      try {
        await api.assignments.update(selectedAssignment.id, {
          title: data.title || selectedAssignment.title,
          subject: data.subject || selectedAssignment.subject,
          class: data.class || selectedAssignment.class,
          assignedDate: data.assignedDate || selectedAssignment.assignedDate,
          dueDate: data.dueDate || selectedAssignment.dueDate,
          description: data.description || selectedAssignment.description,
          status: data.status || selectedAssignment.status,
        });
        await loadAssignments();
        setIsEditModalOpen(false);
        setSelectedAssignment(null);
        alert('Assignment updated successfully!');
      } catch (error) {
        console.error('Error updating assignment:', error);
        alert('Failed to update assignment. Please try again.');
      }
    }
  };

  const assignmentFields: FormField[] = [
    { name: 'title', label: 'Assignment Title', type: 'text', required: true, spanFull: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'class', label: 'Class', type: 'text', required: true },
    { name: 'assignedDate', label: 'Assigned Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
      ]
    },
    { name: 'description', label: 'Description', type: 'textarea', spanFull: true, rows: 4 },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Assignments</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
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
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No assignments found
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => {
                const submissionRate = getSubmissionRate(assignment.submittedBy, assignment.totalStudents);
                const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'Active';
                
                return (
                  <tr key={assignment.id}>
                    <td>
                      <div>
                        <strong>{assignment.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                          {assignment.description}
                        </div>
                      </div>
                    </td>
                    <td>{assignment.subject}</td>
                    <td>{assignment.class}</td>
                    <td>{assignment.assignedDate}</td>
                    <td>
                      <div>{assignment.dueDate}</div>
                      {isOverdue && (
                        <Badge variant="rejected" size="sm" style={{ marginTop: '0.25rem' }}>
                          Overdue
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{assignment.submittedBy} / {assignment.totalStudents}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                          {submissionRate}% submitted
                        </div>
                        <div style={{
                          width: '100%',
                          height: '4px',
                          background: '#e0e0e0',
                          borderRadius: '2px',
                          marginTop: '0.5rem',
                        }}>
                          <div style={{
                            width: `${submissionRate}%`,
                            height: '100%',
                            background: submissionRate === 100 ? '#22c55e' : submissionRate >= 50 ? '#f59e0b' : '#ef4444',
                            borderRadius: '2px',
                          }} />
                        </div>
                      </div>
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
                );
              })
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
                  { 
                    label: 'Submissions', 
                    value: `${selectedAssignment.submittedBy} / ${selectedAssignment.totalStudents} (${getSubmissionRate(selectedAssignment.submittedBy, selectedAssignment.totalStudents)}%)` 
                  },
                  {
                    label: 'Status',
                    value: selectedAssignment.status,
                    renderAsBadge: { variant: getStatusVariant(selectedAssignment.status) as any, size: 'sm' },
                  },
                  { label: 'Description', value: selectedAssignment.description, spanFull: true },
                  ...(selectedAssignment.totalMarks ? [{ label: 'Total Marks', value: selectedAssignment.totalMarks.toString() }] : []),
                ],
              },
            ]}
          />
        )}
      </Modal>

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
        initialData={selectedAssignment ? {
          title: selectedAssignment.title,
          subject: selectedAssignment.subject,
          class: selectedAssignment.class,
          assignedDate: selectedAssignment.assignedDate,
          dueDate: selectedAssignment.dueDate,
          status: selectedAssignment.status,
          description: selectedAssignment.description,
        } : {}}
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
              This action cannot be undone. All submissions for this assignment will also be deleted.
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

export default StudentAssignments;
