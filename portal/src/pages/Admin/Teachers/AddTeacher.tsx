import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { CreateForm, FormField } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { useState, useEffect } from 'react';

const AddTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isEditMode && id) {
      const loadTeacher = async () => {
        try {
          const response = await api.teachers.getById(id) as any;
          if (response.data?.teacher) {
            const teacher = response.data.teacher;
            // Extract experience number from string like "5 years" or "5"
            let experienceNum = 0;
            if (teacher.experience) {
              const expMatch = teacher.experience.toString().match(/\d+/);
              if (expMatch) {
                experienceNum = parseInt(expMatch[0]) || 0;
              }
            }
            
        setInitialData({
              name: teacher.name || '',
              email: teacher.email || '',
              subject: teacher.subject || '',
              phone: teacher.phone || '',
              experience: experienceNum,
          qualification: teacher.qualification || '',
          address: teacher.address || '',
          city: teacher.city || '',
          country: teacher.country || '',
        });
          } else {
            console.error('Teacher not found');
            alert('Teacher not found. Redirecting to teachers list.');
            navigate('/dashboard/admin/teachers');
          }
        } catch (error) {
          console.error('Error loading teacher:', error);
          alert('Failed to load teacher data. Please try again.');
        }
      };
      loadTeacher();
    }
  }, [id, isEditMode, navigate]);

  const fields: FormField[] = [
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
      name: 'subject',
      label: 'Subject',
      type: 'select',
      required: true,
      thirdWidth: true,
      options: [
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'English', label: 'English' },
        { value: 'Science', label: 'Science' },
        { value: 'History', label: 'History' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology' },
      ],
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
      name: 'experience',
      label: 'Experience (Years)',
      type: 'number',
      required: true,
      placeholder: 'Enter years of experience',
      min: 0,
      thirdWidth: true,
    },
    {
      name: 'qualification',
      label: 'Qualification',
      type: 'text',
      placeholder: 'e.g., M.Sc, B.Ed',
      thirdWidth: true,
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter address',
      rows: 3,
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
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
    if (isEditMode && id) {
      // Update existing teacher
        const response = await api.teachers.update(id, {
        name: data.name,
        email: data.email,
        subject: data.subject,
        phone: data.phone,
        experience: `${data.experience} years`,
        qualification: data.qualification || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        status: data.status || 'Active',
      }) as any;
      
      if (response) {
        alert('Teacher updated successfully!');
          navigate('/dashboard/admin/teachers');
        } else {
          alert('Failed to update teacher. Please try again.');
      }
    } else {
      // Add new teacher - first create a User account
      // Generate username from email or name
      const emailParts = data.email.split('@');
      const baseUsername = emailParts[0] || data.name.toLowerCase().replace(/\s+/g, '_');
      const timestamp = Date.now();
      const username = `${baseUsername}_${timestamp}`.substring(0, 30); // Limit length
      
      // Default password for new teachers
      const defaultPassword = 'Teacher@123';
      
      let userResponse;
      let userId: string | undefined;
      
      try {
        console.log('Creating user account for teacher:', { username, email: data.email, name: data.name });
        userResponse = await api.users.create({
          username: username,
          email: data.email,
          password: defaultPassword,
          name: data.name,
          role: 'teacher',
        });
        console.log('User created successfully:', userResponse);
        userId = (userResponse as any)?.data?.user?._id || (userResponse as any)?.data?.user?.id || (userResponse as any)?.data?._id || (userResponse as any)?._id;
      } catch (error: any) {
        // Check if error is due to user already existing
        const errorMessage = error?.errorData?.message || error?.message || '';
        
        if (errorMessage.includes('already exists') || error?.status === 400) {
          // User already exists - check if teacher already exists
          try {
            const teachersResponse = await api.teachers.getAll() as any;
            const teachers = teachersResponse?.data?.teachers || [];
            const existingTeacher = teachers.find((t: any) => 
              t.email?.toLowerCase() === data.email.toLowerCase()
            );
            
            if (existingTeacher) {
              throw new Error(`A teacher with email ${data.email} already exists. Please use a different email or edit the existing teacher.`);
            } else {
              // User exists but no teacher - try to find the user and use their ID
              try {
                const usersResponse = await api.users.getAll() as any;
                const users = usersResponse?.data?.users || usersResponse?.data || [];
                const existingUser = users.find((u: any) => 
                  u.email?.toLowerCase() === data.email.toLowerCase()
                );
                
                if (existingUser) {
                  // Check if user is already a teacher
                  if (existingUser.role === 'teacher') {
                    userId = existingUser._id || existingUser.id;
                    console.log('Using existing user account:', userId);
                  } else {
                    throw new Error(`Email ${data.email} is already registered as a ${existingUser.role}. Please use a different email.`);
                  }
                } else {
                  throw new Error(`Email ${data.email} is already in use. Please use a different email.`);
                }
              } catch (userLookupError: any) {
                // If we can't find the user, show the original error
                throw new Error(`Email ${data.email} is already in use. Please use a different email.`);
              }
            }
          } catch (teacherCheckError: any) {
            // Re-throw the more specific error
            throw teacherCheckError;
          }
        } else {
          // Other error - extract and show
          let extractedMessage = 'User creation failed';
          
          if (error?.errorData?.message) {
            extractedMessage = error.errorData.message;
          } else if (error?.errorData?.error) {
            extractedMessage = typeof error.errorData.error === 'string' 
              ? error.errorData.error 
              : JSON.stringify(error.errorData.error);
          } else if (error?.errorData?.errors) {
            if (Array.isArray(error.errorData.errors)) {
              extractedMessage = error.errorData.errors.map((e: any) => e.msg || e.message || e).join(', ');
            } else if (typeof error.errorData.errors === 'object') {
              extractedMessage = Object.entries(error.errorData.errors)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            }
          } else if (error?.message) {
            extractedMessage = error.message;
          }
          
          throw new Error(`Failed to create user account: ${extractedMessage}`);
        }
      }

      if (!userId) {
        console.error('User response:', userResponse);
        throw new Error('Failed to get user ID. Please try again.');
      }

      console.log('Creating teacher with userId:', userId);
      // Create teacher with userId
        const response = await api.teachers.create({
        userId: userId,
        name: data.name,
        email: data.email,
        subject: data.subject,
        phone: data.phone,
        experience: `${data.experience} years`,
        qualification: data.qualification || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        status: data.status || 'Active',
        joinDate: new Date().toISOString().split('T')[0],
      }) as any;
      
      const teacherName = response?.data?.teacher?.name || response?.name || 'Teacher';
      alert(`Teacher ${teacherName} added successfully!`);
    navigate('/dashboard/admin/teachers');
      }
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Extract error message from various possible formats
      let errorMessage = 'Failed to save teacher. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errorData?.message) {
        errorMessage = error.errorData.message;
      } else if (error?.errorData?.error) {
        errorMessage = typeof error.errorData.error === 'string' 
          ? error.errorData.error 
          : JSON.stringify(error.errorData.error);
      } else if (error?.errorData?.errors) {
        if (Array.isArray(error.errorData.errors)) {
          errorMessage = error.errorData.errors
            .map((e: any) => e.msg || e.message || e)
            .join(', ');
        } else if (typeof error.errorData.errors === 'object') {
          // Format validation errors nicely
          const errorEntries = Object.entries(error.errorData.errors);
          if (errorEntries.length > 0) {
            errorMessage = errorEntries
              .map(([key, value]) => {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return `${fieldName}: ${value}`;
              })
              .join('; ');
          } else {
            errorMessage = error.errorData.error || error.errorData.message || 'Validation failed';
          }
        }
      } else if (error?.error) {
        errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
      } else if (error?.statusText) {
        errorMessage = error.statusText;
      }
      
      console.error('Extracted error message:', errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '1rem 2rem', paddingTop: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/teachers')}
          title="Back to Teachers"
        />
      </div>
      <CreateForm
        key={id || 'new'} // Force re-render when switching between edit/create
        title={isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? 'Update Teacher' : 'Add Teacher'}
        submitButtonIcon={<Save size={16} />}
        initialData={initialData}
      />
    </div>
  );
};

export default AddTeacher;
