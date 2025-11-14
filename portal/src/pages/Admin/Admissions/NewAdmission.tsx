import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { BackButton } from '../../../components/Button/iconbuttons';
import { CreateForm, FormField, FormSection } from '../../../components/Form';
import api from '../../../services/api';

const NewAdmission = () => {
  const navigate = useNavigate();
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);

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

  useEffect(() => {
    const loadGradeLevels = async () => {
      try {
        setLoadingGrades(true);
        // Load classes from database
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes;
        
          // Extract unique grade levels from active classes
          // Classes have name like "Grade 1 Section A", extract "Grade 1"
          const uniqueGrades = new Set<string>();
          classes
            .filter((c: any) => c.status === 'Active')
            .forEach((c: any) => {
              // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
              const grade = extractGradeFromClassName(c.name || '');
              if (grade) {
                uniqueGrades.add(grade);
              }
            });
          
          // Convert to options array, sorted by grade number
          const options = Array.from(uniqueGrades)
            .map(grade => {
              // Extract number for sorting
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
        } else {
          setGradeOptions([]);
        }
      } catch (error) {
        console.error('Error loading grade levels:', error);
        setGradeOptions([]);
      } finally {
        setLoadingGrades(false);
      }
    };
    loadGradeLevels();
  }, []);

  const fields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
      halfWidth: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter last name',
      halfWidth: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      halfWidth: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter phone number',
      halfWidth: true,
    },
    {
      name: 'class',
      label: 'Grade Level',
      type: 'select',
      required: true,
      options: gradeOptions,
      placeholder: loadingGrades ? 'Loading grades...' : 'Select Grade (Section will be assigned during approval)',
      halfWidth: true,
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      halfWidth: true,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
      ],
      halfWidth: true,
    },
    {
      name: 'admissionDate',
      label: 'Admission Date',
      type: 'date',
      required: true,
      halfWidth: true,
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
    },
    {
      name: 'parentName',
      label: 'Parent/Guardian Name',
      type: 'text',
      required: true,
      placeholder: 'Enter parent/guardian name',
    },
    {
      name: 'parentPhone',
      label: 'Parent Phone',
      type: 'tel',
      required: true,
      placeholder: 'Enter parent phone number',
      halfWidth: true,
    },
    {
      name: 'parentEmail',
      label: 'Parent Email',
      type: 'email',
      placeholder: 'Enter parent email',
      halfWidth: true,
    },
  ];

  const sections: FormSection[] = [
    {
      title: 'Student Information',
      fieldNames: ['firstName', 'lastName', 'email', 'phone', 'class', 'dateOfBirth', 'gender', 'admissionDate', 'address', 'previousSchool'],
    },
    {
      title: 'Parent/Guardian Information',
      fieldNames: ['parentName', 'parentPhone', 'parentEmail'],
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Create admission application (not student yet - will be added when approved)
      const response = await api.admissions.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        class: data.class, // This will be just the grade level (e.g., "Grade 9")
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        admissionDate: data.admissionDate,
        address: data.address || undefined,
        previousSchool: data.previousSchool || undefined,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || undefined,
      });

      const studentName = `${data.firstName} ${data.lastName}`;
      alert(`Admission application submitted successfully! Application for ${studentName} is now pending approval.`);
      console.log('Admission data:', data);
      console.log('New admission created:', response);
      
      // Navigate back to admissions list
      navigate('/dashboard/admin/admissions');
    } catch (error) {
      console.error('Error submitting admission:', error);
      alert('Failed to submit admission application. Please try again.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <BackButton 
        size="md" 
        onClick={() => navigate('/dashboard/admin/admissions')}
        title="Back to Admissions"
      />
      <CreateForm
        title="New Admission"
        fields={fields}
        sections={sections}
        onSubmit={handleSubmit}
        submitButtonText="Submit Application"
        submitButtonIcon={<Save size={18} />}
      />
    </div>
  );
};

export default NewAdmission;

