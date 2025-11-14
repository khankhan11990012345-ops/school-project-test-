import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, CheckCircle, Clock as ClockIcon, User, Award, Upload, BookOpen, Send } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { ViewButton } from '../../components/Button/iconbuttons';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ViewForm } from '../../components/Form';
import api from '../../services/api';
import { Assignment, StudentAssignmentSubmission, Student } from '../../types';
import '../../styles/universal.css';
import './Student.css';

// For now, using a mock student ID. In a real app, this would come from auth context
const CURRENT_STUDENT_ID = 1; // Alice Johnson - Grade 10A

interface AssignmentData {
  assignment: Assignment;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  submission?: StudentAssignmentSubmission;
}

const MyAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  const loadAssignments = async () => {
    try {
      // Get current student
      const studentsResponse = await api.students.getAll() as any;
      if (studentsResponse.data?.students) {
        const students = studentsResponse.data.students;
      const student = students.find((s: any) => s.id === CURRENT_STUDENT_ID);
      setCurrentStudent(student || null);

      if (!student) return;

      // Get assignments for student's class
        // Note: Assignments API may need to be implemented
        const allAssignments: Assignment[] = []; // TODO: Implement assignments API
      const studentAssignments = allAssignments.filter((a: Assignment) => a.class === student.class);
      
      // Get all student submissions
        const submissions: StudentAssignmentSubmission[] = []; // TODO: Implement submissions API

      // Map assignments to assignment data with status and submissions
      const assignmentsData: AssignmentData[] = studentAssignments.map((assignment: Assignment) => {
        const submission = submissions.find((s: StudentAssignmentSubmission) => s.assignmentId === assignment.id);
        
        let status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue' = 'Pending';
        if (submission) {
          if (submission.status === 'Graded') {
            status = 'Graded';
          } else {
            status = submission.status === 'Late' ? 'Overdue' : 'Submitted';
          }
        } else {
          // Check if due date has passed
          const dueDate = new Date(assignment.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate < today && assignment.status === 'Active') {
            status = 'Overdue';
          }
        }

        return {
          assignment,
          status,
          submission,
        };
      });

      // Sort by due date (most urgent first)
      assignmentsData.sort((a, b) => {
        const dateA = new Date(a.assignment.dueDate).getTime();
        const dateB = new Date(b.assignment.dueDate).getTime();
        return dateA - dateB;
      });

      setAssignments(assignmentsData);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'submitted':
        return 'info';
      case 'graded':
        return 'approved';
      case 'overdue':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon size={16} />;
      case 'submitted':
        return <Upload size={16} />;
      case 'graded':
        return <CheckCircle size={16} />;
      case 'overdue':
        return <ClockIcon size={16} />;
      default:
        return <ClockIcon size={16} />;
    }
  };

  const getAssignedBy = async (assignment: Assignment): Promise<string> => {
    try {
      const response = await api.teachers.getAll() as any;
      if (response.data?.teachers) {
        const teachers = response.data.teachers;
    const teacher = teachers.find((t: any) => t.id === assignment.assignedBy);
    return teacher ? teacher.name : 'Teacher';
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
    return 'Teacher';
  };

  const handleViewAssignment = (assignmentData: AssignmentData) => {
    setSelectedAssignment(assignmentData);
    setIsViewModalOpen(true);
  };

  const handleSubmitAssignment = (assignmentData: AssignmentData) => {
    setSelectedAssignment(assignmentData);
    setSubmissionText(assignmentData.submission?.submissionText || '');
    setIsSubmitModalOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedAssignment || !currentStudent) return;

    if (!submissionText.trim()) {
      alert('Please enter your answer before submitting.');
      return;
    }

    // Submit the assignment
    // const assignment = selectedAssignment.assignment;
    // TODO: Implement assignment submission API
    // await api.assignments.submit({
    //   assignmentId: assignment.id,
    //   studentId: CURRENT_STUDENT_ID,
    //   studentName: currentStudent.name,
    //   class: currentStudent.class,
    //   submittedAt: new Date().toISOString().split('T')[0],
    //   submissionText: submissionText.trim(),
    //   status: 'Submitted',
    //   totalMarks: assignment.totalMarks,
    // });

    alert('Assignment submitted successfully!');
    setIsSubmitModalOpen(false);
    setSubmissionText('');
    setSelectedAssignment(null);
    
    // Reload assignments
    loadAssignments();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Assignments</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Assigned Date</th>
              <th>Due Date</th>
              <th>Days Remaining</th>
              <th>Total Marks</th>
              <th>Assigned By</th>
              <th>Status</th>
              <th>Marks Obtained</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No assignments found. Assignments will appear here when teachers assign work to your class.
                </td>
              </tr>
            ) : (
              assignments.map((assignmentData) => {
                const { assignment, status, submission } = assignmentData;
                const daysRemaining = getDaysRemaining(assignment.dueDate);
                const isOverdue = daysRemaining < 0 && status !== 'Graded';

                return (
                  <tr key={assignment.id}>
                    <td>
                      <div>
                        <strong>{assignment.title}</strong>
                        {assignment.description && (
                          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                            {assignment.description.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={14} style={{ color: '#666' }} />
                        {assignment.subject}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} style={{ color: '#666' }} />
                        {formatDate(assignment.assignedDate)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} style={{ color: '#666' }} />
                        {formatDate(assignment.dueDate)}
                      </div>
                    </td>
                    <td>
                      {isOverdue ? (
                        <Badge variant="rejected" size="sm">
                          {Math.abs(daysRemaining)} days overdue
                        </Badge>
                      ) : daysRemaining === 0 ? (
                        <Badge variant="pending" size="sm">
                          Due today
                        </Badge>
                      ) : (
                        <span style={{ color: daysRemaining <= 3 ? '#f59e0b' : '#666' }}>
                          {daysRemaining} days
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{assignment.totalMarks || 'N/A'}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} style={{ color: '#666' }} />
                        {getAssignedBy(assignment)}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(status)} size="sm">
                        {getStatusIcon(status)}
                        {status}
                      </Badge>
                    </td>
                    <td>
                      {submission && submission.marksObtained !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Award size={14} style={{ color: '#22c55e' }} />
                          <strong style={{ color: '#22c55e' }}>
                            {submission.marksObtained} / {submission.totalMarks || assignment.totalMarks || 'N/A'}
                          </strong>
                          {submission.grade && (
                            <Badge variant="success" size="sm">
                              {submission.grade}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ViewButton size="sm" onClick={() => handleViewAssignment(assignmentData)} />
                        {(status === 'Pending' || status === 'Overdue' || status === 'Submitted') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSubmitAssignment(assignmentData)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                          >
                            <Send size={12} style={{ marginRight: '0.25rem' }} />
                            {status === 'Submitted' ? 'Edit' : 'Submit'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Assignment Details Modal */}
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
                  { label: 'Title', value: selectedAssignment.assignment.title },
                  { label: 'Subject', value: selectedAssignment.assignment.subject, icon: BookOpen },
                  { label: 'Class', value: selectedAssignment.assignment.class },
                  { label: 'Assigned Date', value: formatDate(selectedAssignment.assignment.assignedDate), icon: Calendar },
                  { label: 'Due Date', value: formatDate(selectedAssignment.assignment.dueDate), icon: Clock },
                  { label: 'Total Marks', value: (selectedAssignment.assignment.totalMarks || 'N/A').toString() },
                  { label: 'Assigned By', value: getAssignedBy(selectedAssignment.assignment), icon: User },
                  {
                    label: 'Status',
                    value: selectedAssignment.status,
                    renderAsBadge: { variant: getStatusVariant(selectedAssignment.status) as any, size: 'sm' }
                  },
                  { label: 'Description', value: selectedAssignment.assignment.description, spanFull: true },
                ],
              },
              ...(selectedAssignment.submission ? [
                {
                  title: 'Your Submission',
                  icon: Upload,
                  fields: [
                    {
                      label: 'Submitted On',
                      value: formatDate(selectedAssignment.submission.submittedAt),
                      icon: Calendar,
                    },
                    {
                      label: 'Status',
                      value: selectedAssignment.submission.status,
                      renderAsBadge: { 
                        variant: getStatusVariant(selectedAssignment.submission.status) as any, 
                        size: 'sm' as const
                      }
                    },
                    ...(selectedAssignment.submission.submissionText ? [
                      { label: 'Submission Text', value: selectedAssignment.submission.submissionText, spanFull: true }
                    ] : []),
                    ...(selectedAssignment.submission.submittedFile ? [
                      { label: 'Submitted File', value: selectedAssignment.submission.submittedFile, spanFull: true }
                    ] : []),
                  ],
                },
                ...(selectedAssignment.submission.status === 'Graded' ? [
                  {
                    title: 'Grading Results',
                    icon: Award,
                    fields: [
                      {
                        label: 'Marks Obtained',
                        value: `${selectedAssignment.submission.marksObtained} / ${selectedAssignment.submission.totalMarks || selectedAssignment.assignment.totalMarks || 'N/A'}`,
                      },
                      ...(selectedAssignment.submission.grade ? [
                        {
                          label: 'Grade',
                          value: selectedAssignment.submission.grade,
                          renderAsBadge: { variant: 'success' as any, size: 'sm' as const }
                        }
                      ] : []),
                      ...(selectedAssignment.submission.feedback ? [
                        { label: 'Feedback', value: selectedAssignment.submission.feedback, spanFull: true }
                      ] : []),
                      ...(selectedAssignment.submission.gradedAt ? [
                        { label: 'Graded On', value: formatDate(selectedAssignment.submission.gradedAt), icon: Calendar }
                      ] : []),
                    ],
                  }
                ] : []),
              ] : []),
            ]}
          />
        )}
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSubmissionText('');
          setSelectedAssignment(null);
        }}
        title={selectedAssignment ? `Submit Assignment: ${selectedAssignment.assignment.title}` : 'Submit Assignment'}
        size="lg"
      >
        {selectedAssignment && (
          <div>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>Assignment Details</h3>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <div><strong>Subject:</strong> {selectedAssignment.assignment.subject}</div>
                <div><strong>Due Date:</strong> {formatDate(selectedAssignment.assignment.dueDate)}</div>
                <div><strong>Total Marks:</strong> {selectedAssignment.assignment.totalMarks || 'N/A'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Assignment Question/Description:
              </label>
              <div style={{ 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '0.5rem',
                border: '1px solid #e0e0e0',
                fontSize: '0.9rem',
                color: '#333',
                whiteSpace: 'pre-wrap',
                minHeight: '60px'
              }}>
                {selectedAssignment.assignment.description}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Your Answer: <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your answer here..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {submissionText.length} characters
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setSubmissionText('');
                  setSelectedAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={!submissionText.trim()}
              >
                <Send size={18} style={{ marginRight: '0.5rem' }} />
                Submit Assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAssignments;

