import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { CreateForm, FormField } from '../../../components/Form';
import { BackButton } from '../../../components/Button/iconbuttons';
import { useState, useEffect } from 'react';
import api from '../../../services/api';

const AddGrade = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadGrade = async () => {
        try {
          setLoading(true);
          const response = await api.grades.getById(String(id)) as any;
          if (response.data?.class) {
            const classItem = response.data.class;
            setInitialData({
              name: classItem.name || classItem.grade,
              code: classItem.code || '',
              section: classItem.section || '',
              capacity: (classItem.capacity || 0).toString(),
              status: classItem.status || 'Active',
              description: classItem.description || '',
            });
          }
        } catch (error) {
          console.error('Error loading grade:', error);
          alert('Failed to load grade data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      loadGrade();
    }
  }, [id, isEditMode]);

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Grade Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Grade 1, Grade 2, Grade 10',
    },
    {
      name: 'code',
      label: 'Class Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., G1A, G2B, G10C',
      // helpText: 'Unique code for this class (e.g., G1A for Grade 1 Section A)',
    },
    {
      name: 'section',
      label: 'Section',
      type: 'text',
      required: true,
      placeholder: 'Enter section (e.g., A, B, C)',
      thirdWidth: true,
    },
    {
      name: 'capacity',
      label: 'Student Capacity',
      type: 'number',
      required: true,
      placeholder: '30',
      min: 1,
      thirdWidth: true,
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
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter grade description',
      rows: 3,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && id) {
        // Update existing grade
        const gradeData = {
          name: data.name,
          code: data.code,
          section: data.section,
          capacity: parseInt(data.capacity) || 30,
          description: data.description || '',
          status: data.status || 'Active',
          // Keep currentStudents unchanged when editing
        };

        const updated = await api.grades.update(String(id), gradeData) as any;
        if (updated) {
          alert('Grade updated successfully!');
          navigate('/dashboard/admin/classes');
        } else {
          alert('Failed to update grade. Please try again.');
        }
      } else {
        // Create new grade
        const gradeData = {
          name: data.name,
          code: data.code,
          section: data.section,
          capacity: parseInt(data.capacity) || 30,
          description: data.description || '',
          status: data.status || 'Active',
        };

        const newGrade = await api.grades.create(gradeData);
        if (newGrade) {
          alert('Grade created successfully!');
          navigate('/dashboard/admin/classes');
        } else {
          alert('Failed to create grade. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade. Please try again.');
    }
  };

  if (loading && isEditMode) {
    return (
      <div style={{ padding: '1rem 2rem', paddingTop: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading grade data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 2rem', paddingTop: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/classes')}
          title="Back to Classes"
        />
      </div>
      <CreateForm
        key={id || 'new'} // Force re-render when switching between edit/create
        title={isEditMode ? 'Edit Grade' : 'Add New Grade'}
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? 'Update Grade' : 'Create Grade'}
        submitButtonIcon={<Save size={16} />}
        initialData={initialData}
      />
    </div>
  );
};

export default AddGrade;

