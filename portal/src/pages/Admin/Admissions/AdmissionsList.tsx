import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, XCircle, Clock, Edit, Save } from 'lucide-react';
import { ViewButton, ApproveButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal, FormField } from '../../../components/Form';
import api from '../../../services/api';
import { addTransaction } from '../Accounts/Transactions';
import { Admission } from '../../../types';
import '../../../styles/universal.css';
import './Admissions.css';

const AdmissionsList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ section: '' });
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    // Load admissions from API
    const loadAdmissions = async () => {
      try {
        const response = await api.admissions.getAll() as any;
        if (response.data?.admissions) {
          // Ensure each admission has admissionId displayed properly
          const admissions = response.data.admissions.map((app: any) => ({
            ...app,
            // Ensure admissionId is available for display
            displayId: app.admissionId || app._id || app.id,
          }));
          setApplications(admissions);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Error loading admissions:', error);
        setApplications([]);
      }
    };

    // Load classes from API
    const loadClasses = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          setAllClasses(response.data.classes);
        } else {
          setAllClasses([]);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        setAllClasses([]);
      }
    };

    loadAdmissions();
    loadClasses();

    // Refresh interval (since we can't use storage events for API)
    const interval = setInterval(() => {
      loadAdmissions();
      loadClasses();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} />;
      case 'Rejected':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  // Extract grade level from class (e.g., "Grade 1 Sec A" -> "Grade 1" or "Grade 10A" -> "Grade 10")
  const extractGradeLevel = (className: string): string => {
    const match = className.match(/Grade\s+(\d+)/i);
    return match ? `Grade ${match[1]}` : className;
  };

  // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
  const extractGradeFromClassName = (className: string): string => {
    if (!className) return '';
    const normalized = className.trim();
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

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const handleEditApplication = (application: any) => {
    setSelectedApplication(application);
    // Store section value (remove "Sec " prefix if it exists, we'll add it back in display)
    const sectionValue = application.section?.replace('Sec ', '').trim() || '';
    setEditFormData({ section: sectionValue });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: Record<string, any>) => {
    if (!selectedApplication) return;

    try {
      // Store section value (just the letter, e.g., "A", "B")
      const section = data.section?.replace('Sec ', '').trim() || data.section;
      const admissionId = selectedApplication._id || selectedApplication.id;
      await api.admissions.update(admissionId, { section });
      alert(`Section ${section} assigned successfully! You can now approve this admission.`);
      setIsEditModalOpen(false);
      setSelectedApplication(null);
      setEditFormData({ section: '' });
      
      // Reload admissions to show updated section
      const response = await api.admissions.getAll() as any;
      if (response.data?.admissions) {
        setApplications(response.data.admissions);
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to assign section. Please try again.');
    }
  };

  const handleApproveApplication = (application: Admission) => {
    // Check if section is assigned
    if (!application.section) {
      alert('Please assign a section to this student before approving. Use the Edit button to assign a section.');
      return;
    }

    setSelectedApplication(application);
    setIsApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedApplication) return;

    // Check if section is assigned
    if (!selectedApplication.section) {
      alert('Please assign a section to this student before approving. Use the Edit button to assign a section.');
      return;
    }

    try {
      // Normalize grade level
      const gradeLevel = extractGradeLevel(selectedApplication.class);
      const normalizedGrade = gradeLevel.startsWith('Grade') ? gradeLevel : `Grade ${gradeLevel}`;
      const section = selectedApplication.section.replace('Sec ', '').trim(); // Remove "Sec " prefix if present
      
      // Find the class that matches this grade and section
      const matchingClass = allClasses.find((c: any) => {
        if (c.status !== 'Active') return false;
        // Extract grade from class name
        const classGrade = extractGradeFromClassName(c.name || '');
        return classGrade === normalizedGrade && c.section === section;
      });

      if (!matchingClass) {
        alert(`No active class found for ${normalizedGrade} Section ${section}. Please check the classes list.`);
        return;
      }

      // Check if class has capacity
      if (matchingClass.currentStudents >= matchingClass.capacity) {
        alert(`Class ${matchingClass.name} is at full capacity (${matchingClass.capacity}/${matchingClass.capacity}). Cannot admit more students.`);
        return;
      }

      // Build full class name (e.g., "Grade 9B" or "Grade 9 Sec B")
      const fullClassName = `${normalizedGrade}${section}`; // Format: "Grade 9B"

      // Update admission status to Approved
      const admissionId = selectedApplication._id || selectedApplication.id;
      try {
        await api.admissions.update(admissionId, { status: 'Approved' });
      } catch (error: any) {
        throw new Error(`Failed to update admission status: ${error?.message || error?.error || 'Unknown error'}`);
      }

      // First, create a User account for the student
      // Generate username from email, ensuring it's at least 3 characters and valid
      let baseUsername = selectedApplication.email.split('@')[0] || '';
      // Remove any special characters that might cause issues, keep only alphanumeric and underscore
      baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '_');
      
      // Generate unique username with timestamp to avoid conflicts
      const timestamp = Date.now();
      let username = baseUsername.length >= 3 ? baseUsername : `student_${timestamp}`;
      
      // Add timestamp suffix to ensure uniqueness
      if (baseUsername.length >= 3) {
        username = `${baseUsername}_${timestamp.toString().slice(-6)}`;
      }
      
      // Ensure minimum length of 3 characters
      if (username.length < 3) {
        username = `student_${timestamp}`;
      }
      // Ensure username doesn't exceed reasonable length (max 30 chars)
      if (username.length > 30) {
        username = username.substring(0, 24) + '_' + timestamp.toString().slice(-5);
      }
      
      const defaultPassword = 'Student@123'; // Default password - should be changed on first login
      
      // Handle name field - Admission model uses firstName/lastName, but API might return name virtual
      const userName = selectedApplication.name || 
                      (selectedApplication.firstName && selectedApplication.lastName 
                       ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
                       : selectedApplication.firstName || selectedApplication.lastName || 'Student');
      
      let userResponse;
      try {
        userResponse = await api.users.create({
          username: username,
          email: selectedApplication.email,
          password: defaultPassword,
          name: userName,
          role: 'student',
        });
      } catch (error: any) {
        // Extract detailed error message from ApiError
        let errorMessage = 'User may already exist or validation failed';
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.errorData?.message) {
          errorMessage = error.errorData.message;
        } else if (error?.errorData?.error) {
          errorMessage = error.errorData.error;
        } else if (error?.errorData?.errors && Array.isArray(error.errorData.errors)) {
          // Handle validation errors array
          errorMessage = error.errorData.errors.map((e: any) => e.msg || e.message || e).join(', ');
        } else if (error?.error) {
          errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        }
        
        console.error('User creation error details:', {
          username,
          email: selectedApplication.email,
          error: errorMessage,
          status: error?.status,
          errorData: error?.errorData,
          fullError: error,
        });
        
        throw new Error(`Failed to create user account: ${errorMessage}`);
      }

      const userResponseData = userResponse as any;
      const userId = userResponseData?.data?.user?._id || userResponseData?.data?.user?.id || userResponseData?.data?._id || userResponseData?._id;

      if (!userId) {
        console.error('User response:', userResponse);
        throw new Error('Failed to get user ID from created user account');
      }

      // Create student from approved admission with full class name and userId
      // Include all required and optional fields from the admission
      // Handle name field - Admission model uses firstName/lastName, but API might return name virtual
      const studentName = selectedApplication.name || 
                         (selectedApplication.firstName && selectedApplication.lastName 
                          ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
                          : selectedApplication.firstName || selectedApplication.lastName || 'Unknown');
      
      // Ensure dates are Date objects or ISO strings
      const dateOfBirth = selectedApplication.dateOfBirth 
        ? (selectedApplication.dateOfBirth instanceof Date 
            ? selectedApplication.dateOfBirth.toISOString() 
            : typeof selectedApplication.dateOfBirth === 'string' 
              ? selectedApplication.dateOfBirth 
              : new Date(selectedApplication.dateOfBirth).toISOString())
        : undefined;
      
      const admissionDate = selectedApplication.admissionDate 
        ? (selectedApplication.admissionDate instanceof Date 
            ? selectedApplication.admissionDate.toISOString() 
            : typeof selectedApplication.admissionDate === 'string' 
              ? selectedApplication.admissionDate 
              : new Date(selectedApplication.admissionDate).toISOString())
        : new Date().toISOString(); // Default to today if not provided
      
      const studentData = {
        userId: userId,
        name: studentName,
        email: selectedApplication.email,
        class: fullClassName,
        section: section, // Include section field
        phone: selectedApplication.phone,
        parent: selectedApplication.parentName,
        status: 'Active',
        dateOfBirth: dateOfBirth,
        admissionDate: admissionDate,
        address: selectedApplication.address || undefined,
        parentPhone: selectedApplication.parentPhone,
        parentEmail: selectedApplication.parentEmail || undefined,
        gender: selectedApplication.gender,
        previousSchool: selectedApplication.previousSchool || undefined,
      };
      
      let studentResponse;
      try {
        console.log('Creating student with data:', studentData);
        studentResponse = await api.students.create(studentData);
        console.log('Student created successfully:', studentResponse);
      } catch (error: any) {
        // Extract detailed error message from ApiError
        let errorMessage = 'Student may already exist or missing required fields';
        
        // Try multiple ways to extract the error message
        if (error?.errorData?.error) {
          errorMessage = error.errorData.error;
        } else if (error?.errorData?.message) {
          errorMessage = error.errorData.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.errorData?.errors && Array.isArray(error.errorData.errors)) {
          // Handle validation errors array
          errorMessage = error.errorData.errors.map((e: any) => e.msg || e.message || e).join(', ');
        } else if (error?.error) {
          errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        }
        
        // Log full error structure for debugging
        console.error('Student creation error details:', {
          errorMessage,
          status: error?.status,
          errorData: error?.errorData,
          errorDataString: JSON.stringify(error?.errorData, null, 2),
          errorResponse: error?.response,
          fullError: error,
          studentData: studentData,
        });
        
        // Try to extract more specific error from errorData
        let displayError = errorMessage;
        if (error?.errorData) {
          // Check if errorData has nested error or message
          const nestedError = error.errorData.error || error.errorData.message;
          if (nestedError && nestedError !== 'Error creating student') {
            displayError = nestedError;
          }
          // Check for validation errors array
          if (error.errorData.errors && Array.isArray(error.errorData.errors)) {
            const validationErrors = error.errorData.errors.map((e: any) => e.msg || e.message || e).join(', ');
            if (validationErrors) {
              displayError = validationErrors;
            }
          }
        }
        
        // Show the actual error message to the user
        alert(`Failed to create student: ${displayError}\n\nPlease check the console for more details.`);
        throw new Error(`Failed to create student: ${displayError}`);
      }

      // Update class capacity - increment currentStudents
      try {
      await api.classes.update(matchingClass.id, {
        currentStudents: matchingClass.currentStudents + 1,
      });
      } catch (error: any) {
        console.warn('Failed to update class capacity:', error);
        // Don't throw - class capacity update is not critical
      }

      // Extract student data from response - CRITICAL: Must get studentId and _id
      const studentResponseData = studentResponse as any;
      const newStudent = studentResponseData?.data?.student || studentResponseData?.data || studentResponseData;
      const studentCustomId = newStudent?.studentId; // Custom ID like S001, S002
      const studentMongoId = newStudent?._id; // MongoDB ObjectId

      if (!studentMongoId) {
        console.error('Student response:', studentResponse);
        throw new Error('Failed to get student MongoDB ID from created student. Student may not have been created properly.');
      }

      if (!studentCustomId) {
        console.warn('Student custom ID (studentId) not found, but MongoDB ID exists:', studentMongoId);
      }

      // Update admission record to link it to the created student
      try {
        await api.admissions.update(admissionId, { studentId: studentMongoId });
      } catch (error: any) {
        console.warn('Failed to link student to admission:', error);
        // Don't throw - admission is already approved
      }

      // Get fee amounts for the grade
      let admissionFeeAmount = 0;
      let tuitionFeeAmount = 0;
      try {
        const feeResponse = await api.fees.gradeFees.getByGrade(gradeLevel) as any;
        const fee = feeResponse?.data?.fee || null;
        admissionFeeAmount = fee?.admissionFee || 5000; // Default to 5000 if not configured
        tuitionFeeAmount = fee?.tuitionFee || 3000; // Default to 3000 if not configured
        console.log(`Fee amounts for ${gradeLevel}: Admission=${admissionFeeAmount}, Tuition=${tuitionFeeAmount}`);
      } catch (error: any) {
        console.warn('Failed to get fee amounts for grade:', gradeLevel, error);
        // Use default amounts if fee structure not found
        admissionFeeAmount = 5000; // Default admission fee
        tuitionFeeAmount = 3000; // Default tuition fee
        console.log(`Using default fee amounts: Admission=${admissionFeeAmount}, Tuition=${tuitionFeeAmount}`);
      }

      const today = new Date();
      const paymentDate = today.toISOString(); // Send as ISO string, backend will parse
      const timeString = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Create fee collection entries for Admission Fee (always create, even if amount is 0)
      try {
        const admissionFeeData = {
          studentId: studentMongoId, // Use MongoDB ObjectId
          feeType: 'Admission' as const,
          amount: admissionFeeAmount,
          paymentDate: paymentDate,
          paymentMethod: 'Cash' as const,
          status: 'Unpaid' as const, // Create as Unpaid
          paidAmount: 0, // No payment yet
          remarks: `Admission fee for ${selectedApplication.name} - ${fullClassName}`,
        };
        
        console.log('Creating admission fee collection with data:', admissionFeeData);
        const admissionFeeResponse = await api.fees.collections.create(admissionFeeData);
        console.log('Admission fee collection created successfully:', admissionFeeResponse);
      } catch (feeError: any) {
        // Extract detailed error message
        let errorMsg = 'Unknown error';
        if (feeError?.message) {
          errorMsg = feeError.message;
        } else if (feeError?.errorData?.error) {
          errorMsg = feeError.errorData.error;
        } else if (feeError?.errorData?.message) {
          errorMsg = feeError.errorData.message;
        }
        console.error('Failed to create admission fee collection:', {
          error: errorMsg,
          errorData: feeError?.errorData,
          fullError: feeError,
        });
        // Don't throw - fee collection can be created manually later
        alert(`Warning: Admission fee entry could not be created automatically. Error: ${errorMsg}. Please create it manually.`);
      }

      // Create fee collection entries for Tuition Fee (always create, even if amount is 0)
      try {
        const tuitionFeeData = {
          studentId: studentMongoId, // Use MongoDB ObjectId
          feeType: 'Tuition' as const,
          amount: tuitionFeeAmount,
          paymentDate: paymentDate,
          paymentMethod: 'Cash' as const,
          status: 'Unpaid' as const, // Create as Unpaid
          paidAmount: 0, // No payment yet
          remarks: `Monthly tuition fee for ${selectedApplication.name} - ${fullClassName}`,
        };
        
        console.log('Creating tuition fee collection with data:', tuitionFeeData);
        const tuitionFeeResponse = await api.fees.collections.create(tuitionFeeData);
        console.log('Tuition fee collection created successfully:', tuitionFeeResponse);
      } catch (feeError: any) {
        // Extract detailed error message
        let errorMsg = 'Unknown error';
        if (feeError?.message) {
          errorMsg = feeError.message;
        } else if (feeError?.errorData?.error) {
          errorMsg = feeError.errorData.error;
        } else if (feeError?.errorData?.message) {
          errorMsg = feeError.errorData.message;
        }
        console.error('Failed to create tuition fee collection:', {
          error: errorMsg,
          errorData: feeError?.errorData,
          fullError: feeError,
        });
        // Don't throw - fee collection can be created manually later
        alert(`Warning: Tuition fee entry could not be created automatically. Error: ${errorMsg}. Please create it manually.`);
      }

      // Create transactions (non-blocking, optional)
      if (admissionFeeAmount > 0) {
        try {
          await addTransaction({
        type: 'Income',
        category: 'Fee Collection',
        description: `Admission Fee - ${selectedApplication.name} (${fullClassName})`,
        amount: admissionFeeAmount,
            date: today.toISOString().split('T')[0],
        time: timeString,
        status: 'Pending',
        paymentMethod: 'Pending',
            referenceId: `admission-${selectedApplication._id || selectedApplication.id}`,
      }, 'admin');
        } catch (txError) {
          console.warn('Failed to create transaction for admission fee:', txError);
        }
    }

      if (tuitionFeeAmount > 0) {
        try {
          await addTransaction({
        type: 'Income',
        category: 'Fee Collection',
        description: `Tuition Fee - ${selectedApplication.name} (${fullClassName})`,
        amount: tuitionFeeAmount,
            date: today.toISOString().split('T')[0],
        time: timeString,
        status: 'Pending',
        paymentMethod: 'Pending',
            referenceId: `tuition-${selectedApplication._id || selectedApplication.id}`,
      }, 'admin');
        } catch (txError) {
          console.warn('Failed to create transaction for tuition fee:', txError);
        }
      }

      // Build success message with all details
      let successMessage = `Admission approved successfully!\n\nStudent Details:\n- Name: ${selectedApplication.name}\n- Student ID: ${studentCustomId || 'N/A'}\n- Class: ${fullClassName}\n- Email: ${selectedApplication.email}\n- Default Password: Student@123\n\n`;
      
      if (admissionFeeAmount > 0 || tuitionFeeAmount > 0) {
        successMessage += `Fee Entries Created:\n`;
        if (admissionFeeAmount > 0) {
          successMessage += `- Admission Fee: Rs ${admissionFeeAmount.toLocaleString()}\n`;
        }
        if (tuitionFeeAmount > 0) {
          successMessage += `- Tuition Fee: Rs ${tuitionFeeAmount.toLocaleString()}\n`;
        }
        successMessage += `\nFee entries are available in the Fee Collection list.\n`;
      } else {
        successMessage += `\nNote: No fee structure found for ${gradeLevel}. Please configure fees in Fee Management.\n`;
      }
      
      successMessage += `\nThe student has been added to the Students List.`;
      
      alert(successMessage);
      
      // Refresh applications list and classes list
      const admissionsResponse = await api.admissions.getAll() as any;
      if (admissionsResponse.data?.admissions) {
        setApplications(admissionsResponse.data.admissions);
      }
      
      // Reload classes to reflect updated capacity
      const classesResponse = await api.classes.getAll() as any;
      if (classesResponse.data?.classes) {
        setAllClasses(classesResponse.data.classes);
      }
      
      // Note: The student list will automatically refresh within 30 seconds
      // or the admin can manually refresh the Students List page to see the new student
      
      setIsApproveModalOpen(false);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Error approving admission:', error);
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
      
      alert(`Failed to approve admission:\n\n${errorMessage}\n\nPlease check the browser console for more details.`);
    }
  };

  const handleRejectApplication = (application: Admission) => {
    setSelectedApplication(application);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (selectedApplication) {
      try {
        const admissionId = selectedApplication._id || selectedApplication.id;
        await api.admissions.update(admissionId, { status: 'Rejected' });
        alert(`Admission application for ${selectedApplication.name} has been rejected.`);
        setIsRejectModalOpen(false);
        setSelectedApplication(null);
        const response = await api.admissions.getAll() as any;
        if (response.data?.admissions) {
          setApplications(response.data.admissions);
        }
      } catch (error) {
        console.error('Error rejecting admission:', error);
        alert('Failed to reject admission. Please try again.');
      }
    }
  };

  // Filter applications based on active tab
  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') {
      return applications;
    }
    return applications.filter((app) => {
      const status = app.status?.toLowerCase() || '';
      return status === activeTab;
    });
  }, [applications, activeTab]);

  // Count applications by status
  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((app) => app.status?.toLowerCase() === 'pending').length,
      approved: applications.filter((app) => app.status?.toLowerCase() === 'approved').length,
      rejected: applications.filter((app) => app.status?.toLowerCase() === 'rejected').length,
    };
  }, [applications]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admission Applications</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/dashboard/admin/admissions/new')}
        >
          <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
          New Admission
        </Button>
      </div>

      {/* Tab Navigator */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: 0,
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'all' ? '#667eea' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'all' ? 600 : 500,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'pending' ? '#667eea' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'pending' ? 600 : 500,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pending') {
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pending') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Clock size={16} />
          Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'approved' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'approved' ? '#667eea' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'approved' ? 600 : 500,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'approved') {
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'approved') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <CheckCircle size={16} />
          Approved ({statusCounts.approved})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'rejected' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'rejected' ? '#667eea' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'rejected' ? 600 : 500,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'rejected') {
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'rejected') {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <XCircle size={16} />
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Grade Level</th>
              <th>Section</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.slice(0, 10).map((application) => (
              <tr key={application._id || application.id}>
                <td>{application.admissionId || application.displayId || application._id || application.id || 'N/A'}</td>
                <td>
                  <strong>{application.name}</strong>
                </td>
                <td>{application.email}</td>
                <td>{extractGradeLevel(application.class)}</td>
                <td>
                  {application.section ? (
                    <Badge variant="info" size="sm">{application.section.replace('Sec ', '')}</Badge>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
                  )}
                </td>
                <td>{application.appliedDate}</td>
                <td>
                  <Badge 
                    variant={application.status.toLowerCase() === 'approved' ? 'approved' : application.status.toLowerCase() === 'pending' ? 'pending' : 'rejected'} 
                    size="sm"
                  >
                    {getStatusIcon(application.status)}
                    {application.status}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ViewButton size="sm" onClick={() => handleViewApplication(application)} />
                    {application.status === 'Pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditApplication(application)}
                          style={{ padding: '0.375rem', minWidth: 'auto' }}
                        >
                          <Edit size={14} />
                        </Button>
                        <ApproveButton size="sm" onClick={() => handleApproveApplication(application)} />
                        <DeleteButton size="sm" onClick={() => handleRejectApplication(application)} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Application Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedApplication(null);
        }}
        title="Admission Application Details"
        size="lg"
      >
        {selectedApplication && (
          <ViewForm
            sections={[
              {
                title: 'Student Information',
                fields: [
                  { label: 'Name', value: selectedApplication.name },
                  { label: 'Email', value: selectedApplication.email },
                  { label: 'Phone', value: selectedApplication.phone },
                  { label: 'Grade Level', value: extractGradeLevel(selectedApplication.class) },
                  { label: 'Section', value: selectedApplication.section ? selectedApplication.section.replace('Sec ', '') : 'Not assigned' },
                  { label: 'Date of Birth', value: selectedApplication.dateOfBirth },
                  { label: 'Gender', value: selectedApplication.gender },
                  { label: 'Admission Date', value: selectedApplication.admissionDate },
                  ...(selectedApplication.address ? [{ label: 'Address', value: selectedApplication.address, spanFull: true }] : []),
                  ...(selectedApplication.previousSchool ? [{ label: 'Previous School', value: selectedApplication.previousSchool }] : []),
                ],
              },
              {
                title: 'Parent/Guardian Information',
                fields: [
                  { label: 'Parent/Guardian Name', value: selectedApplication.parentName },
                  { label: 'Parent Phone', value: selectedApplication.parentPhone },
                  ...(selectedApplication.parentEmail ? [{ label: 'Parent Email', value: selectedApplication.parentEmail }] : []),
                ],
              },
              {
                title: 'Application Information',
                fields: [
                  { label: 'Applied Date', value: selectedApplication.appliedDate },
                  { 
                    label: 'Status', 
                    value: selectedApplication.status,
                    badge: { 
                      variant: selectedApplication.status.toLowerCase() === 'approved' ? 'approved' : selectedApplication.status.toLowerCase() === 'pending' ? 'pending' : 'rejected', 
                      text: selectedApplication.status 
                    }
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedApplication(null);
        }}
        title="Reject Admission Application"
        size="md"
      >
        {selectedApplication && (
          <div>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#666' }}>
              Are you sure you want to reject this admission application?
            </p>
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Application Details:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div><strong>Name:</strong> {selectedApplication.name}</div>
                <div><strong>Email:</strong> {selectedApplication.email}</div>
                <div><strong>Class:</strong> {selectedApplication.class}</div>
                <div><strong>Applied Date:</strong> {selectedApplication.appliedDate}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={confirmReject}
              >
                Reject Application
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Section Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedApplication(null);
          setEditFormData({ section: '' });
        }}
        title={selectedApplication ? `Assign Section: ${selectedApplication.name}` : 'Assign Section'}
        fields={useMemo(() => {
          if (!selectedApplication) return [];
          const gradeLevel = extractGradeLevel(selectedApplication.class);
          const sections = getSectionsForGrade(gradeLevel);
          return [
            {
              name: 'section',
              label: 'Section',
              type: 'select',
              required: true,
              options: sections,
              placeholder: 'Select Section',
            },
          ] as FormField[];
        }, [selectedApplication, allClasses])}
        onSubmit={handleSaveEdit}
        submitButtonText="Assign Section"
        submitButtonIcon={<Save size={16} />}
        initialData={editFormData}
        size="md"
      />

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedApplication(null);
        }}
        title="Approve Admission Application"
        size="md"
      >
        {selectedApplication && (
          <div>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#666' }}>
              Are you sure you want to approve this admission application?
            </p>
            <div style={{
              padding: '1rem',
              background: 'rgba(39, 174, 96, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Application Details:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div><strong>Name:</strong> {selectedApplication.name}</div>
                <div><strong>Email:</strong> {selectedApplication.email}</div>
                <div><strong>Grade:</strong> {extractGradeLevel(selectedApplication.class)}</div>
                <div><strong>Section:</strong> {selectedApplication.section || 'Not assigned'}</div>
                <div><strong>Applied Date:</strong> {selectedApplication.appliedDate}</div>
              </div>
            </div>
            {selectedApplication.section && (
              <div style={{
                padding: '1rem',
                background: 'rgba(52, 152, 219, 0.1)',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>What will happen:</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#666' }}>
                  <li>Student will be added to Students List</li>
                  <li>Admission Fee entry will be created in Fee Collection</li>
                  <li>Tuition Fee entry will be created in Fee Collection</li>
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={confirmApprove}
                disabled={!selectedApplication.section}
              >
                <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                Approve Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionsList;
