import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { CreateForm, FormField } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { useState, useEffect } from 'react';

const AddUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadUser = async () => {
        try {
          setLoading(true);
          const response = await api.users.getById(id) as any;
          if (response.data?.user) {
            const user = response.data.user;
            setInitialData({
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              phone: user.phone || '',
              role: user.role || '',
            });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          alert('Failed to load user data.');
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [id, isEditMode]);
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
      placeholder: 'Enter phone number',
      halfWidth: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Teacher', label: 'Teacher' },
        { value: 'Accountant', label: 'Accountant' },
        { value: 'Student', label: 'Student' },
      ],
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter password',
      min: 6,
      halfWidth: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      placeholder: 'Confirm password',
      min: 6,
      halfWidth: true,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && id) {
        // Update existing user
        if (data.password && data.password !== data.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }

        const updateData: any = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
        };

        if (data.password) {
          updateData.password = data.password;
        }

        await api.users.update(id, updateData);
        alert('User updated successfully!');
        navigate('/dashboard/admin/users');
      } else {
        // Create new user
    if (data.password !== data.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

        const userData = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
          password: data.password,
        };

        await api.users.create(userData);
    alert('User added successfully!');
        navigate('/dashboard/admin/users');
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.message || 'Failed to save user. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/users')}
          title="Back to Users"
        />
      </div>
      <CreateForm
        key={id || 'new'}
        title={isEditMode ? 'Edit User' : 'Add New User'}
        fields={fields.map(field => {
          // In edit mode, make password optional
          if (isEditMode && field.name === 'password') {
            return { ...field, required: false };
          }
          return field;
        })}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? 'Update User' : 'Add User'}
        submitButtonIcon={<Save size={18} />}
        initialData={initialData}
      />
    </div>
  );
};

export default AddUser;

