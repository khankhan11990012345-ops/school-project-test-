import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { CreateForm, FormField, FormSection } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { ExamSection, ExamGradeAssignment, Grade } from '../../../types';

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [sections, setSections] = useState<ExamSection[]>([
    { id: 1, name: 'Section A', description: '', marks: 0 },
  ]);
  const [gradeAssignments, setGradeAssignments] = useState<ExamGradeAssignment[]>([]);
  const [initialData, setInitialData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isEditMode && id) {
      const loadExam = async () => {
        const response = await api.exams.getById(parseInt(id)) as any;
        if (response.data?.exam) {
          const exam = response.data.exam;
        setInitialData({
          name: exam.name,
          subject: exam.subject,
          classes: exam.classes || exam.grades || [],
          date: exam.date,
          time: exam.time,
          duration: exam.duration,
          totalMarks: exam.totalMarks.toString(),
          passingMarks: exam.passingMarks?.toString() || '',
          description: exam.description || '',
        });
        if (exam.sections && exam.sections.length > 0) {
          setSections(exam.sections);
        }
        if (exam.gradeAssignments && exam.gradeAssignments.length > 0) {
          setGradeAssignments(exam.gradeAssignments);
        }
      }
      };
      loadExam();
    }
  }, [id, isEditMode]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isGradeAssignmentModalOpen, setIsGradeAssignmentModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Partial<ExamSection>>({});
  const [currentGradeAssignment, setCurrentGradeAssignment] = useState<Partial<ExamGradeAssignment>>({});

  const [uniqueClasses, setUniqueClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    // Get all unique classes from students (only once on mount)
    const loadData = async () => {
      try {
        const response = await api.students.getAll() as any;
        if (response.data?.students) {
          const students = response.data.students;
          const classes = Array.from(new Set(students.map((s: any) => s.class)))
            .sort()
            .map((className: unknown) => ({
              value: String(className),
              label: String(className),
            }));
          setUniqueClasses(classes);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Load subjects
    const loadSubjects = async () => {
      try {
        const response = await api.subjects.getAll() as any;
        if (response.data?.subjects) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    // Load teachers
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    const loadGradeOptions = async () => {
      try {
        const response = await api.grades.getAll() as any;
        if (response.data?.classes) {
          const gradeMap = new Map<string, Partial<Grade>>();
          response.data.classes.forEach((c: any) => {
            const gradeKey = c.grade || 'Unknown';
            if (!gradeMap.has(gradeKey)) {
              const gradeClasses = response.data.classes.filter((cls: any) => (cls.grade || 'Unknown') === gradeKey);
              gradeMap.set(gradeKey, {
                id: gradeKey,
                name: gradeKey,
                status: gradeClasses[0]?.status || 'Active',
                section: '',
                capacity: 0,
                currentStudents: 0,
                description: '',
              } as Grade);
            }
          });
          const grades = Array.from(gradeMap.values());
          const options = grades
            .filter(g => g.status === 'Active' && g.id && g.name)
            .map(g => ({ value: String(g.id), label: String(g.name) }));
          setGradeOptions(options);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };
    loadGradeOptions();
  }, []);

  const fields: FormField[] = useMemo(() => [
    {
      name: 'name',
      label: 'Exam Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Mid-Term Exam, Final Exam',
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'select',
      required: true,
      options: subjects.map(s => ({
        value: s.name,
        label: `${s.name} (${s.code})`,
      })),
    },
    {
      name: 'classes',
      label: 'Assign to Classes',
      type: 'select',
      required: true,
      multiple: true,
      placeholder: 'Select specific classes (e.g., Grade 1 Sec A, Grade 2 Sec B)',
      options: uniqueClasses,
    },
    {
      name: 'date',
      label: 'Exam Date',
      type: 'date',
      required: true,
      halfWidth: true,
    },
    {
      name: 'time',
      label: 'Exam Time',
      type: 'time',
      required: true,
      halfWidth: true,
    },
    {
      name: 'duration',
      label: 'Duration',
      type: 'text',
      required: true,
      placeholder: 'e.g., 2 hours, 90 minutes',
      halfWidth: true,
    },
    {
      name: 'totalMarks',
      label: 'Total Marks',
      type: 'number',
      required: true,
      placeholder: '100',
      min: 0,
      halfWidth: true,
    },
    {
      name: 'passingMarks',
      label: 'Passing Marks',
      type: 'number',
      placeholder: 'e.g., 40',
      min: 0,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter exam description or instructions',
      rows: 4,
    },
  ], [subjects, uniqueClasses]);

  const sectionsField: FormSection[] = useMemo(() => [
    {
      title: 'Exam Information',
      fieldNames: ['name', 'subject', 'classes', 'date', 'time', 'duration', 'totalMarks', 'passingMarks', 'description'],
    },
  ], []);

  const handleAddSection = () => {
    setCurrentSection({ name: '', description: '', marks: 0 });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = () => {
    if (currentSection.name && currentSection.marks) {
      const newSection: ExamSection = {
        id: sections.length + 1,
        name: currentSection.name,
        description: currentSection.description || '',
        marks: typeof currentSection.marks === 'number' ? currentSection.marks : parseInt(currentSection.marks) || 0,
      };
      setSections([...sections, newSection]);
      setIsSectionModalOpen(false);
      setCurrentSection({});
    }
  };

  const handleRemoveSection = (sectionId: number) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleAddGradeAssignment = () => {
    setCurrentGradeAssignment({ grade: '', teacherId: undefined });
    setIsGradeAssignmentModalOpen(true);
  };

  const handleSaveGradeAssignment = () => {
    if (currentGradeAssignment.grade && currentGradeAssignment.teacherId) {
      const newAssignment: ExamGradeAssignment = {
        grade: currentGradeAssignment.grade,
        teacherId: typeof currentGradeAssignment.teacherId === 'number' 
          ? currentGradeAssignment.teacherId 
          : parseInt(currentGradeAssignment.teacherId) || 0,
      };
      setGradeAssignments([...gradeAssignments, newAssignment]);
      setIsGradeAssignmentModalOpen(false);
      setCurrentGradeAssignment({});
    }
  };

  const handleRemoveGradeAssignment = (grade: string) => {
    setGradeAssignments(gradeAssignments.filter(a => a.grade !== grade));
  };

  const handleSubmit = async (data: Record<string, any>) => {
    // Validate sections
    if (sections.length === 0) {
      alert('Please add at least one exam section!');
      return;
    }

    // Validate total marks match sections
    const sectionsTotal = sections.reduce((sum, s) => sum + s.marks, 0);
    const totalMarks = parseInt(data.totalMarks) || 0;
    if (sectionsTotal !== totalMarks) {
      if (!confirm(`Section marks total (${sectionsTotal}) doesn't match total marks (${totalMarks}). Continue anyway?`)) {
        return;
      }
    }

    // Get selected classes
    const selectedClasses = Array.isArray(data.classes) ? data.classes : [];
    if (selectedClasses.length === 0) {
      alert('Please select at least one class!');
      return;
    }

    // Extract grades from classes for backward compatibility
    const selectedGrades = Array.from(new Set(
      selectedClasses.map((className: string) => {
        const match = className.match(/Grade\s+(\d+)/i);
        return match ? `Grade ${match[1]}` : '';
      }).filter(Boolean)
    ));

    if (isEditMode && id) {
      const updated = await api.exams.update(parseInt(id), {
        name: data.name,
        subject: data.subject,
        grades: selectedGrades,
        classes: selectedClasses,
        date: data.date,
        time: data.time,
        duration: data.duration,
        totalMarks: totalMarks,
        passingMarks: data.passingMarks ? parseInt(data.passingMarks) : undefined,
        description: data.description || '',
        sections: sections,
        gradeAssignments: gradeAssignments,
      });
      if (updated) {
        const examName = (updated as any)?.data?.exam?.name || (updated as any)?.name || 'Exam';
        alert(`Exam "${examName}" updated successfully!`);
        navigate('/dashboard/admin/exams');
      }
    } else {
      const response = await api.exams.create({
        name: data.name,
        subject: data.subject,
        grades: selectedGrades,
        classes: selectedClasses,
        date: data.date,
        time: data.time,
        duration: data.duration,
        totalMarks: totalMarks,
        passingMarks: data.passingMarks ? parseInt(data.passingMarks) : undefined,
        description: data.description || '',
        sections: sections,
        gradeAssignments: gradeAssignments,
        status: 'Scheduled',
      });

        const examName = (response as any)?.data?.exam?.name || (response as any)?.name || 'Exam';
        alert(`Exam "${examName}" created successfully!`);
      navigate('/dashboard/admin/exams');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/exams')}
          title="Back to Exams"
        />
      </div>
      <CreateForm
        title={isEditMode ? "Edit Exam" : "Create New Exam"}
        fields={fields}
        sections={sectionsField}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? "Update Exam" : "Create Exam"}
        submitButtonIcon={<Save size={18} />}
        initialData={initialData}
      />

      {/* Exam Sections */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'white', 
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Exam Sections</h3>
          <Button variant="primary" size="sm" onClick={handleAddSection}>
            <Plus size={16} />
            Add Section
          </Button>
        </div>
        {sections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sections.map((section) => (
              <div key={section.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f7f7f7',
                borderRadius: '0.375rem',
                border: '1px solid #e0e0e0'
              }}>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{section.name}</strong>
                  {section.description && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      {section.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    Marks: <strong>{section.marks}</strong>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSection(section.id)}
                  style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e6f3ff', borderRadius: '0.25rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>
                Total Section Marks: {sections.reduce((sum, s) => sum + s.marks, 0)}
              </strong>
            </div>
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>No sections added yet. Click "Add Section" to add one.</p>
        )}
      </div>

      {/* Grade Assignments */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'white', 
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Grade Assignments (Grading Teachers)</h3>
          <Button variant="primary" size="sm" onClick={handleAddGradeAssignment}>
            <Plus size={16} />
            Assign Teacher
          </Button>
        </div>
        {gradeAssignments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {gradeAssignments.map((assignment, index) => {
              const teacher = teachers.find(t => t.id === assignment.teacherId);
              return (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f7f7f7',
                  borderRadius: '0.375rem',
                  border: '1px solid #e0e0e0'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{assignment.grade}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      Teacher: {teacher?.name || 'Unknown'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveGradeAssignment(assignment.grade)}
                    style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>No grade assignments yet. Click "Assign Teacher" to add one.</p>
        )}
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Add Exam Section"
        size="md"
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Section Name *
            </label>
            <input
              type="text"
              value={currentSection.name || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, name: e.target.value })}
              placeholder="e.g., Section A: Multiple Choice"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #ddd',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Description
            </label>
            <textarea
              value={currentSection.description || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, description: e.target.value })}
              placeholder="Section description or instructions"
              rows={3}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #ddd',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Marks *
            </label>
            <input
              type="number"
              value={currentSection.marks || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, marks: parseInt(e.target.value) || 0 })}
              placeholder="20"
              min={0}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #ddd',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="md" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveSection}>
              <Save size={16} />
              Add Section
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Grade Assignment Modal */}
      <Modal
        isOpen={isGradeAssignmentModalOpen}
        onClose={() => setIsGradeAssignmentModalOpen(false)}
        title="Assign Teacher to Grade"
        size="md"
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Grade *
            </label>
            <select
              value={currentGradeAssignment.grade || ''}
              onChange={(e) => setCurrentGradeAssignment({ ...currentGradeAssignment, grade: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #ddd',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            >
              <option value="">Select Grade</option>
              {gradeOptions.map((option: { value: string; label: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Teacher *
            </label>
            <select
              value={currentGradeAssignment.teacherId || ''}
              onChange={(e) => setCurrentGradeAssignment({ ...currentGradeAssignment, teacherId: parseInt(e.target.value) || undefined })}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #ddd',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.experience})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="md" onClick={() => setIsGradeAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveGradeAssignment}>
              <Save size={16} />
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateExam;

