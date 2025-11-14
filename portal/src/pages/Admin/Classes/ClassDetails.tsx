import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';
import { CreateForm, FormField } from '../../../components/Form';
import '../../../styles/universal.css';
import './Classes.css';

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Mock class data
  const classData = {
    id: id || '1',
    name: 'Mathematics 101',
    code: 'MATH-101',
    subject: 'Mathematics',
    teacher: 'John Smith',
    capacity: 30,
    currentStudents: 28,
    room: 'Room 201',
    schedule: 'Mon, Wed, Fri - 9:00 AM',
    status: 'Active',
  };

  // Mock sections
  const sections = [
    { id: 'A', name: 'Section A', students: 14 },
    { id: 'B', name: 'Section B', students: 14 },
  ];

  // Mock students with grades
  const students = [
    { id: 1, name: 'Alice Johnson', section: 'A', grade: 92, letterGrade: 'A', attendance: 95 },
    { id: 2, name: 'Bob Williams', section: 'A', grade: 88, letterGrade: 'B+', attendance: 90 },
    { id: 3, name: 'Charlie Brown', section: 'A', grade: 95, letterGrade: 'A', attendance: 98 },
    { id: 4, name: 'Diana Prince', section: 'B', grade: 85, letterGrade: 'B', attendance: 88 },
    { id: 5, name: 'Edward Lee', section: 'B', grade: 90, letterGrade: 'A-', attendance: 92 },
    { id: 6, name: 'Fiona Martinez', section: 'B', grade: 78, letterGrade: 'C+', attendance: 85 },
  ];

  const filteredStudents = selectedSection === 'All' 
    ? students 
    : students.filter(s => s.section === selectedSection);

  const getGradeVariant = (grade: number) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'warning';
    return 'danger';
  };

  const getLetterGradeVariant = (letter: string) => {
    if (letter.includes('A')) return 'success';
    if (letter.includes('B')) return 'info';
    if (letter.includes('C')) return 'warning';
    return 'danger';
  };

  const addStudentFields: FormField[] = [
    {
      name: 'studentId',
      label: 'Student',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Alice Johnson' },
        { value: '2', label: 'Bob Williams' },
        { value: '3', label: 'Charlie Brown' },
      ],
    },
    {
      name: 'section',
      label: 'Section',
      type: 'select',
      required: true,
      options: sections.map(s => ({ value: s.id, label: s.name })),
    },
  ];

  const addSectionFields: FormField[] = [
    {
      name: 'name',
      label: 'Section Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Section A, Section B',
    },
    {
      name: 'capacity',
      label: 'Capacity',
      type: 'number',
      required: true,
      placeholder: '15',
      min: 1,
      max: 30,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/classes')}>
          <ArrowLeft size={18} />
          Back to Classes
        </Button>
        <h1>Class Details: {classData.name}</h1>
      </div>

      {/* Class Overview Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <Card
          variant="stat"
          icon={<BookOpen size={28} />}
          value={classData.name}
          label="Class Name"
          color="#667eea"
        />
        <Card
          variant="stat"
          icon={<Users size={28} />}
          value={`${classData.currentStudents}/${classData.capacity}`}
          label="Students"
          color="#48bb78"
        />
        <Card
          variant="stat"
          icon={<GraduationCap size={28} />}
          value={sections.length}
          label="Sections"
          color="#ed8936"
        />
        <Card
          variant="stat"
          icon={<BookOpen size={28} />}
          value={classData.teacher}
          label="Assigned Teacher"
          color="#9f7aea"
        />
      </div>

      {/* Sections Management */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title">Sections</h2>
          <Button variant="primary" size="sm" onClick={() => setIsAddSectionModalOpen(true)}>
            <Plus size={18} />
            Add Section
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Button
            variant={selectedSection === 'All' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedSection('All')}
          >
            All Students ({students.length})
          </Button>
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={selectedSection === section.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedSection(section.id)}
            >
              {section.name} ({section.students})
            </Button>
          ))}
        </div>
      </div>

      {/* Students List with Grades */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title">Students & Grades</h2>
          <Button variant="primary" size="sm" onClick={() => setIsAddStudentModalOpen(true)}>
            <Plus size={18} />
            Add Student
          </Button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Section</th>
                <th>Grade</th>
                <th>Letter Grade</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>
                    <Badge variant="info" size="sm">
                      Section {student.section}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getGradeVariant(student.grade)} size="sm">
                      {student.grade}%
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getLetterGradeVariant(student.letterGrade)} size="sm">
                      {student.letterGrade}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={student.attendance >= 90 ? 'success' : 'warning'} size="sm">
                      {student.attendance}%
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="outline" size="sm">
                        <Edit size={14} />
                        Edit Grade
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title="Add Student to Class"
        size="md"
      >
        <CreateForm
          title=""
          fields={addStudentFields}
          onSubmit={(data) => {
            alert('Student added to class successfully!');
            setIsAddStudentModalOpen(false);
            console.log('Add student data:', data);
          }}
          submitButtonText="Add Student"
          submitButtonIcon={<Plus size={18} />}
        />
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        title="Add New Section"
        size="md"
      >
        <CreateForm
          title=""
          fields={addSectionFields}
          onSubmit={(data) => {
            alert('Section created successfully!');
            setIsAddSectionModalOpen(false);
            console.log('Add section data:', data);
          }}
          submitButtonText="Create Section"
          submitButtonIcon={<Plus size={18} />}
        />
      </Modal>
    </div>
  );
};

export default ClassDetails;

