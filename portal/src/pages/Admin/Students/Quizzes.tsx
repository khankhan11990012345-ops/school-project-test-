import { useState } from 'react';
import { HelpCircle, Calendar, Clock, CheckCircle, XCircle, BookOpen, Users, Award } from 'lucide-react';
import { ViewButton, EditButton, DeleteButton, PrintButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal, FormField } from '../../../components/Form';
import '../../../styles/universal.css';
import './Students.css';

interface Quiz {
  id: number;
  title: string;
  subject: string;
  class: string;
  quizDate: string;
  duration: string;
  totalQuestions: number;
  totalMarks: number;
  status: string;
  conductedBy: string;
  description: string;
  attemptsAllowed: number;
  passingMarks: number;
}

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: 'Mathematics Chapter 5 Quiz',
      subject: 'Mathematics',
      class: 'Grade 10A',
      quizDate: '2024-03-20',
      duration: '30 minutes',
      totalQuestions: 20,
      totalMarks: 20,
      status: 'Active',
      conductedBy: 'John Smith',
      description: 'Quick quiz on algebraic expressions and equations',
      attemptsAllowed: 2,
      passingMarks: 12,
    },
    {
      id: 2,
      title: 'English Vocabulary Quiz',
      subject: 'English',
      class: 'Grade 9B',
      quizDate: '2024-03-18',
      duration: '20 minutes',
      totalQuestions: 15,
      totalMarks: 15,
      status: 'Active',
      conductedBy: 'Sarah Johnson',
      description: 'Test your knowledge of advanced vocabulary words',
      attemptsAllowed: 1,
      passingMarks: 10,
    },
    {
      id: 3,
      title: 'Science Biology Quiz',
      subject: 'Science',
      class: 'Grade 8A',
      quizDate: '2024-03-25',
      duration: '25 minutes',
      totalQuestions: 18,
      totalMarks: 18,
      status: 'Scheduled',
      conductedBy: 'Michael Brown',
      description: 'Quiz on cell structure and functions',
      attemptsAllowed: 2,
      passingMarks: 11,
    },
    {
      id: 4,
      title: 'History World War II Quiz',
      subject: 'History',
      class: 'Grade 11A',
      quizDate: '2024-03-15',
      duration: '35 minutes',
      totalQuestions: 25,
      totalMarks: 25,
      status: 'Completed',
      conductedBy: 'Emily Davis',
      description: 'Multiple choice questions on World War II events',
      attemptsAllowed: 1,
      passingMarks: 15,
    },
    {
      id: 5,
      title: 'Physics Mechanics Quiz',
      subject: 'Physics',
      class: 'Grade 12A',
      quizDate: '2024-03-22',
      duration: '40 minutes',
      totalQuestions: 22,
      totalMarks: 22,
      status: 'Scheduled',
      conductedBy: 'David Wilson',
      description: 'Quiz on Newton\'s laws and motion',
      attemptsAllowed: 2,
      passingMarks: 14,
    },
  ]);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'scheduled':
        return 'pending';
      case 'completed':
        return 'approved';
      case 'cancelled':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'scheduled':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleViewQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsViewModalOpen(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditModalOpen(true);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedQuiz) {
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      alert('Quiz deleted successfully!');
    }
  };

  const handleUpdateQuiz = (data: Record<string, any>) => {
    if (selectedQuiz) {
      setQuizzes(quizzes.map(q =>
        q.id === selectedQuiz.id
          ? {
              ...q,
              title: data.title || q.title,
              subject: data.subject || q.subject,
              class: data.class || q.class,
              quizDate: data.quizDate || q.quizDate,
              duration: data.duration || q.duration,
              totalQuestions: parseInt(data.totalQuestions) || q.totalQuestions,
              totalMarks: parseInt(data.totalMarks) || q.totalMarks,
              passingMarks: parseInt(data.passingMarks) || q.passingMarks,
              attemptsAllowed: parseInt(data.attemptsAllowed) || q.attemptsAllowed,
              status: data.status || q.status,
              description: data.description || q.description,
            }
          : q
      ));
      setIsEditModalOpen(false);
      setSelectedQuiz(null);
      alert('Quiz updated successfully!');
    }
  };

  const handlePrintQuiz = (quiz: Quiz) => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${quiz.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .info { margin: 10px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${quiz.title}</h1>
            <div class="info"><span class="label">Subject:</span> ${quiz.subject}</div>
            <div class="info"><span class="label">Class:</span> ${quiz.class}</div>
            <div class="info"><span class="label">Date:</span> ${quiz.quizDate}</div>
            <div class="info"><span class="label">Duration:</span> ${quiz.duration}</div>
            <div class="info"><span class="label">Total Questions:</span> ${quiz.totalQuestions}</div>
            <div class="info"><span class="label">Total Marks:</span> ${quiz.totalMarks}</div>
            <div class="info"><span class="label">Passing Marks:</span> ${quiz.passingMarks}</div>
            <div class="info"><span class="label">Description:</span> ${quiz.description}</div>
            <div class="info"><span class="label">Conducted By:</span> ${quiz.conductedBy}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const quizFields: FormField[] = [
    { name: 'title', label: 'Quiz Title', type: 'text', required: true, spanFull: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'class', label: 'Class', type: 'text', required: true },
    { name: 'quizDate', label: 'Quiz Date', type: 'date', required: true },
    { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 30 minutes' },
    { name: 'totalQuestions', label: 'Total Questions', type: 'number', required: true, min: 1 },
    { name: 'totalMarks', label: 'Total Marks', type: 'number', required: true, min: 1 },
    { name: 'passingMarks', label: 'Passing Marks', type: 'number', required: true, min: 1 },
    { name: 'attemptsAllowed', label: 'Attempts Allowed', type: 'number', required: true, min: 1 },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
      ]
    },
    { name: 'description', label: 'Description', type: 'textarea', spanFull: true, rows: 3 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quizzes</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Quiz Date</th>
              <th>Duration</th>
              <th>Questions</th>
              <th>Total Marks</th>
              <th>Passing Marks</th>
              <th>Attempts</th>
              <th>Conducted By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>
                  <div>
                    <strong>{quiz.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      {quiz.description}
                    </div>
                  </div>
                </td>
                <td>{quiz.subject}</td>
                <td>{quiz.class}</td>
                <td>{quiz.quizDate}</td>
                <td>{quiz.duration}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <HelpCircle size={14} style={{ color: '#666' }} />
                    <strong>{quiz.totalQuestions}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award size={14} style={{ color: '#666' }} />
                    <strong>{quiz.totalMarks}</strong>
                  </div>
                </td>
                <td>
                  <Badge variant="info" size="sm">
                    {quiz.passingMarks} / {quiz.totalMarks}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} style={{ color: '#666' }} />
                    {quiz.attemptsAllowed}
                  </div>
                </td>
                <td>{quiz.conductedBy}</td>
                <td>
                  <Badge variant={getStatusVariant(quiz.status)} size="sm">
                    {getStatusIcon(quiz.status)}
                    {quiz.status}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ViewButton size="sm" onClick={() => handleViewQuiz(quiz)} />
                    <EditButton size="sm" onClick={() => handleEditQuiz(quiz)} />
                    <PrintButton size="sm" onClick={() => handlePrintQuiz(quiz)} />
                    <DeleteButton size="sm" onClick={() => handleDeleteQuiz(quiz)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Quiz Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedQuiz(null);
        }}
        title="Quiz Details"
        size="lg"
      >
        {selectedQuiz && (
          <ViewForm
            sections={[
              {
                title: 'Quiz Information',
                icon: BookOpen,
                fields: [
                  { label: 'Title', value: selectedQuiz.title },
                  { label: 'Subject', value: selectedQuiz.subject },
                  { label: 'Class', value: selectedQuiz.class },
                  { label: 'Quiz Date', value: selectedQuiz.quizDate, icon: Calendar },
                  { label: 'Duration', value: selectedQuiz.duration, icon: Clock },
                  { label: 'Total Questions', value: selectedQuiz.totalQuestions.toString() },
                  { label: 'Total Marks', value: selectedQuiz.totalMarks.toString() },
                  { label: 'Passing Marks', value: `${selectedQuiz.passingMarks} / ${selectedQuiz.totalMarks}` },
                  { label: 'Attempts Allowed', value: selectedQuiz.attemptsAllowed.toString() },
                  { label: 'Conducted By', value: selectedQuiz.conductedBy },
                  {
                    label: 'Status',
                    value: selectedQuiz.status,
                    renderAsBadge: { variant: getStatusVariant(selectedQuiz.status) as any, size: 'sm' },
                  },
                  { label: 'Description', value: selectedQuiz.description, spanFull: true },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Quiz Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuiz(null);
        }}
        title="Edit Quiz"
        fields={quizFields}
        onSubmit={handleUpdateQuiz}
        submitButtonText="Update Quiz"
        initialData={selectedQuiz ? {
          title: selectedQuiz.title,
          subject: selectedQuiz.subject,
          class: selectedQuiz.class,
          quizDate: selectedQuiz.quizDate,
          duration: selectedQuiz.duration,
          totalQuestions: selectedQuiz.totalQuestions.toString(),
          totalMarks: selectedQuiz.totalMarks.toString(),
          passingMarks: selectedQuiz.passingMarks.toString(),
          attemptsAllowed: selectedQuiz.attemptsAllowed.toString(),
          status: selectedQuiz.status,
          description: selectedQuiz.description,
        } : {}}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedQuiz(null);
        }}
        title="Delete Quiz"
        size="md"
      >
        {selectedQuiz && (
          <div>
            <p>Are you sure you want to delete "{selectedQuiz.title}"?</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedQuiz(null);
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

export default Quizzes;
