import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Accounts.css';

const FeeManagement = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    grade: '',
    tuitionFee: '',
    admissionFee: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFees();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      loadFees();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadFees = async () => {
    try {
      const response = await api.fees.gradeFees.getAll() as any;
      if (response.data?.fees) {
        const storedFees = response.data.fees;
      setFees(storedFees.sort((a: any, b: any) => {
        // Sort by grade number
        const gradeA = parseInt(a.grade.replace('Grade', '').trim()) || 0;
        const gradeB = parseInt(b.grade.replace('Grade', '').trim()) || 0;
        return gradeA - gradeB;
      }));
      } else {
        setFees([]);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
      setFees([]);
    }
  };

  const handleOpenModal = (fee?: any) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        grade: fee.grade,
        tuitionFee: fee.tuitionFee.toString(),
        admissionFee: fee.admissionFee.toString(),
      });
    } else {
      setEditingFee(null);
      setFormData({
        grade: '',
        tuitionFee: '',
        admissionFee: '',
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    setFormData({
      grade: '',
      tuitionFee: '',
      admissionFee: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.tuitionFee.trim()) {
      newErrors.tuitionFee = 'Tuition fee is required';
    } else {
      const tuition = parseFloat(formData.tuitionFee);
      if (isNaN(tuition) || tuition < 0) {
        newErrors.tuitionFee = 'Tuition fee must be a valid positive number';
      }
    }

    if (!formData.admissionFee.trim()) {
      newErrors.admissionFee = 'Admission fee is required';
    } else {
      const admission = parseFloat(formData.admissionFee);
      if (isNaN(admission) || admission < 0) {
        newErrors.admissionFee = 'Admission fee must be a valid positive number';
      }
    }

    // Check if grade already exists (only for new fees)
    if (!editingFee) {
      const existingFee = fees.find(f => f.grade === formData.grade);
      if (existingFee) {
        newErrors.grade = 'Fee for this grade already exists. Please edit the existing one.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const feeData: any = {
      grade: formData.grade.trim(),
      tuitionFee: parseFloat(formData.tuitionFee),
      admissionFee: parseFloat(formData.admissionFee),
    };

    try {
      if (editingFee) {
        // Use MongoDB _id for update
        const feeId = editingFee._id || editingFee.id;
        await api.fees.gradeFees.update(feeId, feeData);
        alert(`Fee for ${feeData.grade} updated successfully!`);
      } else {
        await api.fees.gradeFees.create(feeData);
        alert(`Fee for ${feeData.grade} created successfully!`);
      }
      handleCloseModal();
      await loadFees();
    } catch (error: any) {
      console.error('Error saving fee:', error);
      console.error('Error details:', {
        message: error?.message,
        error: error?.error,
        status: error?.status,
        stack: error?.stack,
      });
      
      // Extract error message from various possible formats
      let errorMessage = 'Unknown error occurred';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(`Failed to save fee:\n\n${errorMessage}\n\nPlease check the browser console for more details.`);
    }
  };

  const handleDelete = async (fee: any) => {
    if (confirm(`Are you sure you want to delete the fee structure for ${fee.grade}?`)) {
      try {
        // Use MongoDB _id for deletion
        const feeId = fee._id || fee.id;
        await api.fees.gradeFees.delete(feeId);
        alert(`Fee for ${fee.grade} deleted successfully!`);
        await loadFees();
      } catch (error: any) {
        console.error('Error deleting fee:', error);
        const errorMessage = error?.message || error?.error || 'Unknown error';
        alert(`Failed to delete fee: ${errorMessage}`);
      }
    }
  };

  // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
  const extractGradeFromClassName = (className: string): string => {
    if (!className) return '';
    const normalized = className.trim();
    const gradeMatch = normalized.match(/Grade\s+(\d+)/i);
    return gradeMatch ? `Grade ${gradeMatch[1]}` : '';
  };

  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);
  
  useEffect(() => {
    const loadGradeOptions = async () => {
      try {
        // Load classes from Classes module
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes;
          
          // Extract unique grades from class names
          const gradeSet = new Set<string>();
          classes.forEach((c: any) => {
            // Only include active classes
            if (c.status === 'Active' && c.name) {
              const grade = extractGradeFromClassName(c.name);
              if (grade) {
                gradeSet.add(grade);
              }
            }
          });
          
          // Convert to sorted array of options
          const grades = Array.from(gradeSet).sort((a, b) => {
            // Sort by grade number
            const numA = parseInt(a.replace('Grade', '').trim()) || 0;
            const numB = parseInt(b.replace('Grade', '').trim()) || 0;
            return numA - numB;
          });
          
          const options = grades.map(grade => ({
            value: grade,
            label: grade,
          }));
          
          setGradeOptions(options);
        } else {
          setGradeOptions([]);
        }
      } catch (error) {
        console.error('Error loading grades from classes:', error);
        setGradeOptions([]);
      }
    };
    loadGradeOptions();
  }, []);

  const columns: TableColumn<any>[] = [
    { key: 'grade', header: 'Grade' },
    {
      key: 'tuitionFee',
      header: 'Tuition Fee',
      render: (value: number) => `Rs ${value.toLocaleString()}`,
    },
    {
      key: 'admissionFee',
      header: 'Admission Fee',
      render: (value: number) => `Rs ${value.toLocaleString()}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, fee: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal(fee)}
          >
            <Edit size={14} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(fee)}
            style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Fee Management</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Manage tuition fees and admission fees for different grades
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Fee Structure
        </Button>
      </div>

      {fees.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <DollarSign size={48} style={{ color: '#999', marginBottom: '1rem' }} />
          <p style={{ color: '#666', fontSize: '1rem' }}>No fee structures configured yet.</p>
          <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Click "Add Fee Structure" to create fees for different grades.
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={fees}
          emptyMessage="No fee structures found"
        />
      )}

      {/* Add/Edit Fee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFee ? `Edit Fee Structure: ${editingFee.grade}` : 'Add Fee Structure'}
        size="md"
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Grade <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              disabled={!!editingFee}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${errors.grade ? '#e53e3e' : '#ddd'}`,
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                backgroundColor: editingFee ? '#f5f5f5' : 'white',
                cursor: editingFee ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">Select Grade</option>
              {gradeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.grade && (
              <div style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.grade}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Tuition Fee (Rs) <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.tuitionFee}
              onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
              placeholder="e.g., 200, 300, 500"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${errors.tuitionFee ? '#e53e3e' : '#ddd'}`,
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
            {errors.tuitionFee && (
              <div style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.tuitionFee}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Admission Fee (Rs) <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.admissionFee}
              onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
              placeholder="e.g., 500, 1000, 2000"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${errors.admissionFee ? '#e53e3e' : '#ddd'}`,
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
            {errors.admissionFee && (
              <div style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.admissionFee}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button variant="outline" size="md" onClick={handleCloseModal}>
              <X size={18} />
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit}>
              <Save size={18} />
              {editingFee ? 'Update' : 'Create'} Fee Structure
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeeManagement;

