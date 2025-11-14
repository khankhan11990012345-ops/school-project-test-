import { useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { ViewButton, EditButton, DeleteButton, PrintButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal, FormField } from '../../../components/Form';
import '../../../styles/universal.css';
import './Students.css';

interface TestPaper {
  id: number;
  title: string;
  subject: string;
  class: string;
  examDate: string;
  duration: string;
  totalMarks: number;
  status: string;
  conductedBy: string;
  description: string;
}

const TestsPapers = () => {
  const [tests, setTests] = useState<TestPaper[]>([
    {
      id: 1,
      title: 'Mathematics Mid-Term Test',
      subject: 'Mathematics',
      class: 'Grade 10A',
      examDate: '2024-03-20',
      duration: '90 minutes',
      totalMarks: 100,
      status: 'Scheduled',
      conductedBy: 'John Smith',
      description: 'Covers chapters 1-5: Algebra, Geometry, and Trigonometry',
    },
    {
      id: 2,
      title: 'English Literature Test',
      subject: 'English',
      class: 'Grade 9B',
      examDate: '2024-03-18',
      duration: '60 minutes',
      totalMarks: 50,
      status: 'Completed',
      conductedBy: 'Sarah Johnson',
      description: 'Test on Shakespeare\'s Romeo and Juliet',
    },
    {
      id: 3,
      title: 'Science Practical Test',
      subject: 'Science',
      class: 'Grade 8A',
      examDate: '2024-03-25',
      duration: '120 minutes',
      totalMarks: 100,
      status: 'Scheduled',
      conductedBy: 'Michael Brown',
      description: 'Practical examination on Chemistry experiments',
    },
    {
      id: 4,
      title: 'History Quiz',
      subject: 'History',
      class: 'Grade 11A',
      examDate: '2024-03-15',
      duration: '45 minutes',
      totalMarks: 50,
      status: 'Completed',
      conductedBy: 'Emily Davis',
      description: 'Quiz on World War II and its aftermath',
    },
    {
      id: 5,
      title: 'Physics Unit Test',
      subject: 'Physics',
      class: 'Grade 12A',
      examDate: '2024-03-22',
      duration: '90 minutes',
      totalMarks: 100,
      status: 'Scheduled',
      conductedBy: 'David Wilson',
      description: 'Unit test on Mechanics and Thermodynamics',
    },
  ]);

  const [selectedTest, setSelectedTest] = useState<TestPaper | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
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

  const handleViewTest = (test: TestPaper) => {
    setSelectedTest(test);
    setIsViewModalOpen(true);
  };

  const handleEditTest = (test: TestPaper) => {
    setSelectedTest(test);
    setIsEditModalOpen(true);
  };

  const handleDeleteTest = (test: TestPaper) => {
    setSelectedTest(test);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTest) {
      setTests(tests.filter(t => t.id !== selectedTest.id));
      setIsDeleteModalOpen(false);
      setSelectedTest(null);
      alert('Test paper deleted successfully!');
    }
  };

  const handleUpdateTest = (data: Record<string, any>) => {
    if (selectedTest) {
      setTests(tests.map(t =>
        t.id === selectedTest.id
          ? {
              ...t,
              title: data.title || t.title,
              subject: data.subject || t.subject,
              class: data.class || t.class,
              examDate: data.examDate || t.examDate,
              duration: data.duration || t.duration,
              totalMarks: parseInt(data.totalMarks) || t.totalMarks,
              status: data.status || t.status,
              description: data.description || t.description,
            }
          : t
      ));
      setIsEditModalOpen(false);
      setSelectedTest(null);
      alert('Test paper updated successfully!');
    }
  };

  const handlePrintTest = (test: TestPaper) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${test.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .info { margin: 10px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${test.title}</h1>
            <div class="info"><span class="label">Subject:</span> ${test.subject}</div>
            <div class="info"><span class="label">Class:</span> ${test.class}</div>
            <div class="info"><span class="label">Exam Date:</span> ${test.examDate}</div>
            <div class="info"><span class="label">Duration:</span> ${test.duration}</div>
            <div class="info"><span class="label">Total Marks:</span> ${test.totalMarks}</div>
            <div class="info"><span class="label">Description:</span> ${test.description}</div>
            <div class="info"><span class="label">Conducted By:</span> ${test.conductedBy}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const testFields: FormField[] = [
    { name: 'title', label: 'Test Title', type: 'text', required: true, spanFull: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'class', label: 'Class', type: 'text', required: true },
    { name: 'examDate', label: 'Exam Date', type: 'date', required: true },
    { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 90 minutes' },
    { name: 'totalMarks', label: 'Total Marks', type: 'number', required: true, min: 1 },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true,
      options: [
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
        <h1>Tests Papers</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Exam Date</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Conducted By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id}>
                <td>
                  <div>
                    <strong>{test.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      {test.description}
                    </div>
                  </div>
                </td>
                <td>{test.subject}</td>
                <td>{test.class}</td>
                <td>{test.examDate}</td>
                <td>{test.duration}</td>
                <td>
                  <strong>{test.totalMarks}</strong>
                </td>
                <td>{test.conductedBy}</td>
                <td>
                  <Badge variant={getStatusVariant(test.status)} size="sm">
                    {getStatusIcon(test.status)}
                    {test.status}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ViewButton size="sm" onClick={() => handleViewTest(test)} />
                    <EditButton size="sm" onClick={() => handleEditTest(test)} />
                    <PrintButton size="sm" onClick={() => handlePrintTest(test)} />
                    <DeleteButton size="sm" onClick={() => handleDeleteTest(test)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Test Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTest(null);
        }}
        title="Test Paper Details"
        size="lg"
      >
        {selectedTest && (
          <ViewForm
            sections={[
              {
                title: 'Test Information',
                icon: FileText,
                fields: [
                  { label: 'Title', value: selectedTest.title },
                  { label: 'Subject', value: selectedTest.subject, icon: BookOpen },
                  { label: 'Class', value: selectedTest.class },
                  { label: 'Exam Date', value: selectedTest.examDate, icon: Calendar },
                  { label: 'Duration', value: selectedTest.duration, icon: Clock },
                  { label: 'Total Marks', value: selectedTest.totalMarks.toString() },
                  { label: 'Conducted By', value: selectedTest.conductedBy },
                  {
                    label: 'Status',
                    value: selectedTest.status,
                    renderAsBadge: { variant: getStatusVariant(selectedTest.status) as any, size: 'sm' },
                  },
                  { label: 'Description', value: selectedTest.description, spanFull: true },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Test Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTest(null);
        }}
        title="Edit Test Paper"
        fields={testFields}
        onSubmit={handleUpdateTest}
        submitButtonText="Update Test"
        initialData={selectedTest ? {
          title: selectedTest.title,
          subject: selectedTest.subject,
          class: selectedTest.class,
          examDate: selectedTest.examDate,
          duration: selectedTest.duration,
          totalMarks: selectedTest.totalMarks.toString(),
          status: selectedTest.status,
          description: selectedTest.description,
        } : {}}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTest(null);
        }}
        title="Delete Test Paper"
        size="md"
      >
        {selectedTest && (
          <div>
            <p>Are you sure you want to delete "{selectedTest.title}"?</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTest(null);
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

export default TestsPapers;
