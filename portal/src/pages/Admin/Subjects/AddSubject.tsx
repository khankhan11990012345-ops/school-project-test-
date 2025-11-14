import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { CreateForm, FormField, FormSection } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import TeacherGradeAssignment, { TeacherAssignment } from '../../../components/Form/TeacherGradeAssignment';
import api from '../../../services/api';
import { useState, useEffect, useMemo } from 'react';

const AddSubject = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [teacherOptions, setTeacherOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([{ teacherId: '', gradeSections: [] }]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Load grades and teachers
    const loadData = async () => {
      try {
        // Load grades from classes
        const gradesResponse = await api.grades.getAll() as any;
        if (gradesResponse.data?.classes) {
          const gradeMap = new Map<string, any>();
          
          // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
          const extractGradeFromName = (name: string): string | null => {
            if (!name) return null;
            const match = name.match(/^(Grade\s+\d+)/i);
            return match ? match[1] : null;
          };
          
          gradesResponse.data.classes.forEach((c: any) => {
            const gradeKey = extractGradeFromName(c.name || '') || 'Unknown';
            if (!gradeMap.has(gradeKey)) {
              const gradeClasses = gradesResponse.data.classes.filter((cls: any) => {
                const clsGrade = extractGradeFromName(cls.name || '') || 'Unknown';
                return clsGrade === gradeKey;
              });
              gradeMap.set(gradeKey, {
                id: gradeKey,
                name: gradeKey,
                status: gradeClasses[0]?.status || 'Active',
              });
            }
          });
          const grades = Array.from(gradeMap.values());
          const gradeOptions = grades
            .filter((g: any) => g.status === 'Active')
            .sort((a: any, b: any) => {
              // Sort by grade number
              const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
              const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
              return numA - numB;
            })
            .map((g: any) => ({ value: g.id, label: g.name }));
          setGradeOptions(gradeOptions);
        }

        // Load teachers
        const teachersResponse = await api.teachers.getAll() as any;
        const teachers = teachersResponse?.data?.teachers || teachersResponse?.data || teachersResponse || [];
        const teachersArray = Array.isArray(teachers) ? teachers : [];
        const teacherOptions = teachersArray
          .filter((t: any) => t.status === 'Active' || !t.status)
          .map((t: any) => ({
            value: t._id || t.id,
            label: `${t.name} (${t.subject || 'N/A'})`,
          }));
        setTeacherOptions(teacherOptions);

        // Load all classes to get sections
        const classesResponse = await api.classes.getAll() as any;
        const classes = classesResponse?.data?.classes || classesResponse?.data || classesResponse || [];
        const classesArray = Array.isArray(classes) ? classes : [];
        setAllClasses(classesArray);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    // Load subject data if in edit mode
    const loadSubject = async () => {
      // Strict check - only load if we have a valid, non-empty id string
      if (typeof id !== 'string' || id.trim() === '') {
        console.log('Skipping subject load - no valid ID', { isEditMode, id, idType: typeof id });
        return;
      }
      
      // Also check isEditMode for extra safety
      if (!isEditMode) {
        console.log('Skipping subject load - not in edit mode', { isEditMode, id });
        return;
      }
      
      try {
        console.log('Loading subject with ID:', id);
        const response = await api.subjects.getById(id) as any;
        console.log('Subject response:', response);
        
        const subject = response?.data?.subject || response?.data || response;
        
        if (subject) {
          // Handle teacherId - it might be an object (populated) or a string/ObjectId
          let teacherIdValue = '';
          if (subject.teacherId) {
            if (typeof subject.teacherId === 'object' && subject.teacherId._id) {
              teacherIdValue = subject.teacherId._id.toString();
            } else if (typeof subject.teacherId === 'string') {
              teacherIdValue = subject.teacherId;
            } else {
              teacherIdValue = subject.teacherId.toString();
            }
          }
          
          // Ensure grades is an array
          const gradesArray = Array.isArray(subject.grades) ? subject.grades : [];
          
          // Ensure credits is a number (convert to string for form)
          const creditsValue = subject.credits != null ? String(subject.credits) : '0';
          
          // Build teacher assignments from existing data
          const assignments: TeacherAssignment[] = [];
          
          // Check if subject has teacherAssignments array (new format)
          if (subject.teacherAssignments && Array.isArray(subject.teacherAssignments) && subject.teacherAssignments.length > 0) {
            // Use the new teacherAssignments format
            subject.teacherAssignments.forEach((assignment: any) => {
              if (assignment.teacherId) {
                const teacherId = typeof assignment.teacherId === 'object' 
                  ? assignment.teacherId._id || assignment.teacherId.id
                  : assignment.teacherId;
                
                // Ensure gradeSections is an array and filter out any invalid entries
                const gradeSections = Array.isArray(assignment.gradeSections) 
                  ? assignment.gradeSections
                      .filter((gs: any) => gs && gs.grade && gs.grade.trim() !== '')
                      .map((gs: any) => ({
                        grade: gs.grade,
                        sections: Array.isArray(gs.sections) 
                          ? gs.sections.filter((s: string) => s && s.trim() !== '')
                          : [],
                      }))
                  : [];
                
                assignments.push({
                  teacherId: String(teacherId),
                  gradeSections: gradeSections,
                });
              }
            });
            setTeacherAssignments(assignments.length > 0 ? assignments : [{ teacherId: '', gradeSections: [] }]);
          } else if (teacherIdValue && gradesArray.length > 0) {
            // Fallback to old format (single teacherId) - convert to new format
            // Group grades by grade name and extract sections from class names
            const gradeSectionsMap = new Map<string, string[]>();
            gradesArray.forEach((grade: string) => {
              // Extract grade name (e.g., "Grade 1" from "Grade 1A")
              const gradeMatch = grade.match(/^(Grade \d+)/i);
              if (gradeMatch) {
                const gradeName = gradeMatch[1];
                const section = grade.replace(gradeName, '').trim();
                if (!gradeSectionsMap.has(gradeName)) {
                  gradeSectionsMap.set(gradeName, []);
                }
                if (section) {
                  gradeSectionsMap.get(gradeName)!.push(section);
                }
              } else {
                // If no section, just add the grade
                if (!gradeSectionsMap.has(grade)) {
                  gradeSectionsMap.set(grade, []);
                }
              }
            });
            
            assignments.push({
              teacherId: teacherIdValue,
              gradeSections: Array.from(gradeSectionsMap.entries()).map(([grade, sections]) => ({
                grade,
                sections: sections.length > 0 ? sections : [],
              })),
            });
            setTeacherAssignments(assignments);
          } else {
            // Initialize with one empty slot if no teacher assigned
            setTeacherAssignments([{ teacherId: '', gradeSections: [] }]);
          }
          
          const initialDataObj = {
            name: subject.name || '',
            code: subject.code || '',
            category: subject.category || '',
            level: subject.level || '',
            credits: creditsValue,
            description: subject.description || '',
            grades: gradesArray,
            teacherId: teacherIdValue,
            status: subject.status || 'Active',
          };
          
          console.log('Setting initial data:', initialDataObj);
          setInitialData(initialDataObj);
        } else {
          console.error('Subject not found in response');
        }
      } catch (error: any) {
        // Only show error if we're actually in edit mode and have an ID
        if (isEditMode && id) {
          console.error('Error loading subject:', error);
          const errorMessage = error?.errorData?.message || error?.message || 'Failed to load subject data';
          alert(`Failed to load subject: ${errorMessage}`);
        } else {
          // Silently fail if not in edit mode
          console.log('Not loading subject (not in edit mode)');
        }
      }
    };

    // Load all data
    const loadAllData = async () => {
      try {
        await loadData();
        await loadSubject();
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [id, isEditMode]);

  // Memoize fields to ensure they update when options change
  const fields: FormField[] = useMemo(() => [
    {
      name: 'name',
      label: 'Subject Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Mathematics, English, Science',
      halfWidth: true,
    },
    {
      name: 'code',
      label: 'Subject Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., MATH, ENG, SCI',
      halfWidth: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Core', label: 'Core Subject' },
        { value: 'Elective', label: 'Elective Subject' },
        { value: 'Language', label: 'Language' },
        { value: 'Science', label: 'Science' },
        { value: 'Arts', label: 'Arts' },
        { value: 'Physical Education', label: 'Physical Education' },
      ],
      halfWidth: true,
    },
    {
      name: 'level',
      label: 'Level',
      type: 'select',
      required: true,
      options: [
        { value: 'Elementary', label: 'Elementary' },
        { value: 'Middle School', label: 'Middle School' },
        { value: 'High School', label: 'High School' },
        { value: 'Advanced', label: 'Advanced' },
      ],
      halfWidth: true,
    },
    {
      name: 'credits',
      label: 'Credits',
      type: 'number',
      required: true,
      placeholder: '3',
      min: 1,
      max: 5,
      halfWidth: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
      defaultValue: 'Active',
      halfWidth: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter subject description',
      rows: 4,
    },
  ], [teacherOptions, gradeOptions]);

  const sections: FormSection[] = [
    {
      title: 'Subject Information',
      fieldNames: ['name', 'code', 'category', 'level'],
    },
    {
      title: 'Additional Details',
      fieldNames: ['credits', 'status', 'description'],
    },
    {
      title: 'Assignments',
      fieldNames: [],
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Build grades array from all teacher assignments
      let grades: string[] = [];
      const teacherIds: string[] = [];
      
      // Filter out empty assignments (no teacher selected)
      const validAssignments = teacherAssignments.filter(assignment => 
        assignment.teacherId && assignment.teacherId.trim() !== ''
      );
      
      validAssignments.forEach((assignment) => {
        if (assignment.teacherId) {
          teacherIds.push(String(assignment.teacherId));
          
          // Process grade sections
          assignment.gradeSections.forEach((gs) => {
            if (gs.grade && gs.grade.trim() !== '') {
              if (gs.sections && gs.sections.length > 0) {
                // Add grade with sections (e.g., "Grade 1A", "Grade 1B")
                gs.sections.forEach((section) => {
                  if (section && section.trim() !== '') {
                    const gradeSection = `${gs.grade}${section}`;
                    if (!grades.includes(gradeSection)) {
                      grades.push(gradeSection);
                    }
                  }
                });
              } else {
                // Just add the grade if no sections selected
                if (!grades.includes(gs.grade)) {
                  grades.push(gs.grade);
                }
              }
            }
          });
        }
      });

      // Build teacher assignments array for backend
      // Only include assignments with a teacher and at least one grade section with a grade
      const teacherAssignmentsData = validAssignments
        .map(assignment => {
          // Filter out empty grade sections
          const validGradeSections = assignment.gradeSections.filter(gs => 
            gs.grade && gs.grade.trim() !== ''
          );
          
          // Only include assignment if it has valid grade sections
          if (validGradeSections.length > 0) {
            return {
              teacherId: String(assignment.teacherId),
              gradeSections: validGradeSections.map(gs => ({
                grade: gs.grade,
                sections: (gs.sections || []).filter((s: string) => s && s.trim() !== ''),
              })),
            };
          }
          return null;
        })
        .filter((assignment): assignment is { teacherId: string; gradeSections: any[] } => assignment !== null);

      // Prepare submit data
      const submitData: any = {
        name: data.name,
        code: data.code,
        category: data.category,
        level: data.level,
        credits: parseInt(data.credits) || 0,
        description: data.description || '',
        grades: grades,
        status: data.status || 'Active',
      };

      // Add teacher assignments (always include, even if empty array to clear existing ones)
      submitData.teacherAssignments = teacherAssignmentsData;
      
      // Keep teacherId for backward compatibility (use first teacher if available)
      if (teacherIds.length > 0) {
        submitData.teacherId = teacherIds[0];
      } else {
        // If no teachers assigned, set to null to clear it
        submitData.teacherId = null;
      }

      console.log('Submitting subject data:', submitData);

      if (isEditMode && id) {
        // Update existing subject
        const updated = await api.subjects.update(id, submitData);
        
        if (updated) {
          const subjectName = (updated as any)?.data?.subject?.name || data.name || 'Subject';
          alert(`Subject "${subjectName}" updated successfully!`);
          console.log('Subject updated:', updated);
        }
      } else {
        // Add new subject
        const response = await api.subjects.create(submitData);
        
        const subjectName = (response as any)?.data?.subject?.name || (response as any)?.name || 'Subject';
        alert(`Subject "${subjectName}" created successfully!`);
        console.log('New subject created:', response);
      }
      navigate('/dashboard/admin/subjects');
    } catch (error: any) {
      console.error('Error saving subject:', error);
      const errorMessage = error?.errorData?.message || error?.message || 'Failed to save subject. Please try again.';
      alert(`Failed to save subject: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <BackButton 
            size="md" 
            onClick={() => navigate('/dashboard/admin/subjects')}
            title="Back to Subjects"
          />
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading subject data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/subjects')}
          title="Back to Subjects"
        />
      </div>
      <CreateForm
        key={`${id || 'new'}-${JSON.stringify(initialData)}`} // Force re-render when data changes
        title={isEditMode ? 'Edit Subject' : 'Add New Subject'}
        fields={fields}
        sections={sections}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? 'Update Subject' : 'Create Subject'}
        submitButtonIcon={<Save size={18} />}
        initialData={initialData}
        customSectionContent={{
          'Assignments': (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              {teacherAssignments.map((assignment, index) => (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: '2rem', 
                    padding: '1.5rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: 0 }}>
                      {index === 0 ? 'First Teacher' : index === 1 ? 'Second Teacher' : index === 2 ? 'Third Teacher' : `Teacher ${index + 1}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newAssignments = teacherAssignments.filter((_, i) => i !== index);
                        // Ensure at least one slot remains
                        if (newAssignments.length === 0) {
                          setTeacherAssignments([{ teacherId: '', gradeSections: [] }]);
                        } else {
                          setTeacherAssignments(newAssignments);
                        }
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Remove Teacher
                    </button>
                  </div>
                  <TeacherGradeAssignment
                    teachers={teacherOptions.filter(t => {
                      // Filter out teachers already assigned to other slots
                      const assignedTeacherIds = teacherAssignments
                        .map(a => a.teacherId)
                        .filter((id, idx) => idx !== index && id);
                      return !assignedTeacherIds.includes(t.value);
                    })}
                    allClasses={allClasses}
                    value={assignment}
                    onChange={(updatedAssignment) => {
                      const newAssignments = [...teacherAssignments];
                      newAssignments[index] = updatedAssignment || { teacherId: '', gradeSections: [] };
                      setTeacherAssignments(newAssignments);
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTeacherAssignments([...teacherAssignments, { teacherId: '', gradeSections: [] }]);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>+</span>
                Add Another Teacher
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default AddSubject;

