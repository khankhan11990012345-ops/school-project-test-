import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { CreateForm, FormField, FormSection } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { useState, useEffect, useMemo } from 'react';

const AddStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [sectionOptions, setSectionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('');
  const [loadingGrades, setLoadingGrades] = useState(true);

  // Format date from ISO string to YYYY-MM-DD for HTML date input
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // If it's an ISO string, extract the date part
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Extract grade level from class name (e.g., "Grade 1 Section A" -> "Grade 1")
  const extractGradeFromClassName = (className: string): string => {
    if (!className) return '';
    
    // Normalize the class name
    const normalized = className.trim();
    
    // Extract grade number - handles formats like:
    // "Grade 1 Section A", "Grade 1", "Grade 1A", etc.
    const gradeMatch = normalized.match(/Grade\s+(\d+)/i);
    return gradeMatch ? `Grade ${gradeMatch[1]}` : '';
  };

  // Get available sections for a grade
  const getSectionsForGrade = (grade: string): Array<{ value: string; label: string }> => {
    if (!Array.isArray(allClasses) || !grade) {
      return [];
    }
    // Normalize grade format for comparison
    const normalizedGrade = grade.startsWith('Grade') ? grade : `Grade ${grade}`;
    
    // Filter classes by grade - extract grade from class name
    const filteredClasses = allClasses.filter((c: any) => {
      if (c.status !== 'Active') return false;
      
      // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
      const classGrade = extractGradeFromClassName(c.name || '');
      return classGrade === normalizedGrade;
    });
    
    return filteredClasses.map((c: any) => ({
      value: c.section || '', // Just the section letter (e.g., "A", "B")
      label: `Section ${c.section || ''} (${c.name || ''}) - ${c.currentStudents || 0}/${c.capacity || 0} available`,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      // Load all classes
      try {
        setLoadingGrades(true);
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          setAllClasses(response.data.classes);
        } else {
          setAllClasses([]);
        }
        
        // Extract unique grade levels from active classes
        // Classes have name like "Grade 1 Section A", extract "Grade 1"
        const uniqueGrades = new Set<string>();
        const classes = response.data?.classes || [];
        classes
          .filter((c: any) => c.status === 'Active')
          .forEach((c: any) => {
            const grade = extractGradeFromClassName(c.name || '');
            if (grade) {
              uniqueGrades.add(grade);
            }
          });
        
        // Convert to options array, sorted by grade number
        const options = Array.from(uniqueGrades)
          .map(grade => {
            const match = grade.match(/\d+/);
            const num = match ? parseInt(match[0]) : 0;
            return { grade, num };
          })
          .sort((a, b) => a.num - b.num)
          .map(({ grade }) => ({
            value: grade,
            label: grade,
          }));
        
        setGradeOptions(options);
      } catch (error) {
        console.error('Error loading classes:', error);
        setGradeOptions([]);
        setAllClasses([]);
      } finally {
        setLoadingGrades(false);
      }

      // Load student data if in edit mode
      if (isEditMode && id) {
        try {
          const studentResponse = await api.students.getById(id) as any;
          const student = studentResponse?.data?.student || studentResponse?.student || studentResponse || null;
          if (student) {
            console.log('[EDIT STUDENT] Loaded student data:', student); // Debug log
            
            // Extract grade level from class name (e.g., "Grade 1 Section A" -> "Grade 1")
            const gradeLevel = extractGradeFromClassName(student.class || '');
            // Use the student's section field directly (it's stored separately in the database)
            const section = (student.section || '').trim();
            
            console.log('[EDIT STUDENT] Extracted:', { 
              className: student.class, 
              gradeLevel, 
              section,
              studentSection: student.section 
            }); // Debug log
            
            // Format dates for HTML date inputs
            const formattedDateOfBirth = formatDateForInput(student.dateOfBirth);
            const formattedAdmissionDate = formatDateForInput(student.admissionDate);
            
            const initialDataObj = {
              studentId: student.studentId || student.id || '',
              name: student.name || '',
              email: student.email || '',
              gradeLevel: gradeLevel || '',
              section: section || '',
              phone: student.phone || '',
              dateOfBirth: formattedDateOfBirth,
              admissionDate: formattedAdmissionDate,
              gender: student.gender || '',
              status: student.status || 'Active',
              address: student.address || '',
              previousSchool: student.previousSchool || '',
              city: student.city || '',
              country: student.country || '',
              parentName: student.parent || '',
              parentPhone: student.parentPhone || '',
              parentEmail: student.parentEmail || '',
            };
            
            console.log('[EDIT STUDENT] Setting initial data:', initialDataObj); // Debug log
            setInitialData(initialDataObj);
            
            // Set selected grade level and load sections
            if (gradeLevel) {
              setSelectedGradeLevel(gradeLevel);
            }
          } else {
            console.error('[EDIT STUDENT] Student data not found in response:', studentResponse);
          }
        } catch (error) {
          console.error('Error loading student:', error);
        }
      }
    };

    loadData();
  }, [id, isEditMode]);

  // Update section options when grade level changes
  useEffect(() => {
    if (selectedGradeLevel) {
      const sections = getSectionsForGrade(selectedGradeLevel);
      setSectionOptions(sections);
      
      // If we have initial data with a section, make sure it's preserved
      if (initialData.section && sections.length > 0) {
        // Verify the section exists in the options
        const sectionExists = sections.some(s => s.value === initialData.section);
        if (!sectionExists) {
          // Section might not match, try to find it
          console.log('[EDIT STUDENT] Section from initial data not found in options:', initialData.section, 'Available:', sections.map(s => s.value));
        } else {
          console.log('[EDIT STUDENT] Section found in options:', initialData.section);
        }
      } else if (initialData.section && sections.length === 0) {
        console.log('[EDIT STUDENT] No sections available for grade:', selectedGradeLevel);
      }
    } else {
      setSectionOptions([]);
    }
  }, [selectedGradeLevel, allClasses, initialData.section]);

  // Create fields with dynamic section options
  const fields: FormField[] = useMemo(() => {
    const allFields: FormField[] = [];
    
    // Add studentId field in edit mode (read-only)
    if (isEditMode) {
      allFields.push({
        name: 'studentId',
        label: 'Student ID',
        type: 'text',
        required: false,
        placeholder: 'Auto-generated',
        disabled: true,
        thirdWidth: true,
      });
    }
    
    // Add all other fields
    allFields.push(
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter full name',
        thirdWidth: true,
      },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      thirdWidth: true,
    },
    {
      name: 'gradeLevel',
      label: 'Grade Level',
      type: 'select',
      required: true,
      thirdWidth: true,
      options: gradeOptions,
      placeholder: loadingGrades ? 'Loading grades...' : 'Select Grade Level',
    },
    {
      name: 'section',
      label: 'Section',
      type: 'select',
      required: true,
      thirdWidth: true,
      options: sectionOptions,
      placeholder: selectedGradeLevel ? (sectionOptions.length > 0 ? 'Select Section' : 'No sections available') : 'Select Grade Level first',
      disabled: !selectedGradeLevel || sectionOptions.length === 0,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter phone number',
      thirdWidth: true,
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      thirdWidth: true,
    },
    {
      name: 'admissionDate',
      label: 'Admission Date',
      type: 'date',
      required: true,
      thirdWidth: true,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      thirdWidth: true,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
      ],
      placeholder: 'Select Gender',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter address',
      rows: 3,
    },
    {
      name: 'previousSchool',
      label: 'Previous School',
      type: 'text',
      placeholder: 'Enter previous school name',
      thirdWidth: true,
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city',
      thirdWidth: true,
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country',
      thirdWidth: true,
    },
    {
      name: 'parentName',
      label: 'Parent/Guardian Name',
      type: 'text',
      required: true,
      placeholder: 'Enter parent/guardian name',
      thirdWidth: true,
    },
    {
      name: 'parentPhone',
      label: 'Parent Phone',
      type: 'tel',
      required: true,
      placeholder: 'Enter parent phone number',
      thirdWidth: true,
    },
    {
      name: 'parentEmail',
      label: 'Parent Email',
      type: 'email',
      placeholder: 'Enter parent email',
      thirdWidth: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      thirdWidth: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Graduated', label: 'Graduated' },
        { value: 'Transferred', label: 'Transferred' },
      ],
      placeholder: 'Select Status',
    },
    );
    
    return allFields;
  }, [gradeOptions, sectionOptions, loadingGrades, selectedGradeLevel, isEditMode]);

  const sections: FormSection[] = useMemo(() => [
    {
      title: 'Student Information',
      fieldNames: isEditMode 
        ? ['studentId', 'name', 'email', 'gradeLevel', 'section', 'phone', 'dateOfBirth', 'admissionDate', 'gender', 'status', 'address', 'previousSchool', 'city', 'country']
        : ['name', 'email', 'gradeLevel', 'section', 'phone', 'dateOfBirth', 'admissionDate', 'gender', 'status', 'address', 'previousSchool', 'city', 'country'],
    },
    {
      title: 'Parent/Guardian Information',
      fieldNames: ['parentName', 'parentPhone', 'parentEmail'],
    },
  ], [isEditMode]);

  const handleFieldChange = (fieldName: string, value: any) => {
    // When grade level changes, update selected grade and reset section
    if (fieldName === 'gradeLevel') {
      setSelectedGradeLevel(value);
      setInitialData((prev) => ({ ...prev, gradeLevel: value, section: '' }));
    } else {
      setInitialData((prev) => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Combine grade level and section into class format (e.g., "Grade 1 Section A")
      const gradeLevel = data.gradeLevel || '';
      const section = data.section || '';
      const className = gradeLevel && section ? `${gradeLevel} Section ${section}` : gradeLevel;

      if (isEditMode && id) {
        // Update existing student
        const updated = await api.students.update(id, {
          name: data.name,
          email: data.email,
          class: className,
          section: section, // Store section separately
          phone: data.phone, // Required
          parent: data.parentName, // Required
          status: data.status || 'Active', // Required
          dateOfBirth: data.dateOfBirth, // Required
          admissionDate: data.admissionDate, // Required
          gender: data.gender, // Required
          address: data.address || undefined,
          parentPhone: data.parentPhone, // Required
          parentEmail: data.parentEmail || undefined,
          previousSchool: data.previousSchool || undefined,
        });
        
        if (updated) {
          alert('Student updated successfully!');
          console.log('Updated student:', updated);
          navigate('/dashboard/admin/students');
        } else {
          alert('Failed to update student. Please try again.');
        }
      } else {
        // Add new student
        const response = await api.students.create({
          name: data.name,
          email: data.email,
          class: className,
          section: section, // Store section separately
          phone: data.phone, // Required
          parent: data.parentName, // Required
          status: data.status || 'Active', // Required
          dateOfBirth: data.dateOfBirth, // Required
          admissionDate: data.admissionDate, // Required
          gender: data.gender, // Required
          address: data.address || undefined,
          parentPhone: data.parentPhone, // Required
          parentEmail: data.parentEmail || undefined,
          previousSchool: data.previousSchool || undefined,
        });
        
        const studentName = (response as any)?.data?.student?.name || (response as any)?.name || 'Student';
        alert(`Student ${studentName} added successfully!`);
        console.log('New student created:', response);
        navigate('/dashboard/admin/students');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Please try again.');
    }
  };

  return (
    <div style={{ padding: '1rem 2rem', paddingTop: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/students')}
          title="Back to Students"
        />
      </div>
      <CreateForm
        key={id || 'new'} // Force re-render when switching between edit/create
        title={isEditMode ? 'Edit Student' : 'Add New Student'}
        fields={fields}
        sections={sections}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? 'Update Student' : 'Add Student'}
        submitButtonIcon={<Save size={16} />}
        initialData={initialData}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

export default AddStudent;

