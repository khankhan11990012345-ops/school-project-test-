import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, CreditCard, CheckCircle, Clock, Search, Filter, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal } from '../../../components/Form';
import { FormField } from '../../../components/Form/CreateForm';
import api from '../../../services/api';
import { addTransaction } from './Transactions';
import { UserRole } from '../../../types';
import '../../../styles/universal.css';
import './Accounts.css';

// Use any type directly instead of separate interface
type Collection = any;

const FeesCollection = () => {
  const { role } = useParams<{ role: UserRole }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const collectionsPerPage = 10;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Collection | null>(null);

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const [feeOptions, setFeeOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    // Load fee options from fee management
    const options = [
      { value: 'Tuition Fee', label: 'Tuition Fee' },
      { value: 'Admission Fee', label: 'Admission Fee' },
      { value: 'Registration Fee', label: 'Registration Fee' },
      { value: 'Exam Fee', label: 'Exam Fee' },
      { value: 'Library Fee', label: 'Library Fee' },
      { value: 'Sports Fee', label: 'Sports Fee' },
      { value: 'Other', label: 'Other' },
    ];
    setFeeOptions(options);
  }, []);

  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      loadCollections();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await api.fees.collections.getAll() as any;
      if (response.data?.collections) {
        const stored = response.data.collections;
        console.log('Loaded fee collections:', stored); // Debug log
        
        // Ensure we have an array and map the data to include populated fields
        if (Array.isArray(stored)) {
          // Map collections to include student info and format dates
          const mappedCollections = stored.map((collection: any) => {
            const student = collection.studentId || {};
            // Handle both populated student object and direct studentId reference
            const studentName = student?.name || collection.studentName || 'Unknown';
            const studentId = student?.studentId || student?._id?.toString() || collection.studentId?.toString() || 'Unknown';
            const parentName = student?.parent || collection.parentName || '-';
            const studentClass = student?.class || collection.class || '-';
            
            return {
              ...collection,
              id: collection._id || collection.id,
              studentId: studentId,
              studentName: studentName,
              parentName: parentName,
              cnic: student?.cnic || collection.cnic || '-',
              class: studentClass,
              collectedDate: collection.paymentDate 
                ? new Date(collection.paymentDate).toISOString().split('T')[0]
                : collection.collectedDate || '-',
              status: collection.status || 'Unpaid',
              paidAmount: collection.paidAmount || 0,
              amount: collection.amount || 0,
              feeType: collection.feeType || 'Tuition',
              paymentMethod: collection.paymentMethod || 'Cash',
            };
          });
          setCollections(mappedCollections);
        } else {
          console.error('Fee collections data is not an array:', stored);
          setCollections([]);
        }
      } else {
        setCollections([]);
      }
    } catch (error: any) {
      console.error('Error loading fee collections:', error);
      console.error('Error details:', {
        message: error?.message,
        error: error?.error,
        status: error?.status,
        url: error?.url,
      });
      // Don't show alert for 404 - just set empty array
      if (error?.status !== 404) {
        console.warn('Fee collections endpoint returned error:', error);
      }
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique class names from collections for the filter dropdown
  const availableClasses = useMemo(() => {
    if (!Array.isArray(collections)) return [];
    const uniqueClasses = Array.from(new Set(collections.map(c => c.class).filter(Boolean)));
    return uniqueClasses.sort();
  }, [collections]);

  const [studentOptions, setStudentOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await api.students.getAll() as any;
        if (response.data?.students) {
          const students = response.data.students;
          const options = students.map((student: any) => {
          // Use studentId, _id, or id - whichever is available
          const displayId = (student.studentId || student._id || student.id || '').toString();
          return {
            value: student._id || student.id || student.studentId, // Use MongoDB _id for API operations
            label: `${student.name || 'Unknown'} (${displayId}) - ${student.class || 'N/A'}`,
          };
          });
          setStudentOptions(options);
        }
      } catch (error) {
        console.error('Error loading students:', error);
        setStudentOptions([]);
      }
    };
    loadStudents();
  }, []);

  // Filter collections based on search query, status, and class
  const filteredCollections = useMemo(() => {
    if (!Array.isArray(collections)) {
      console.warn('Collections is not an array:', collections);
      return [];
    }
    
    return collections.filter((collection) => {
      // Search filter (name, ID, parent, CNIC)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (collection.studentName && collection.studentName.toLowerCase().includes(searchLower)) ||
        (collection.studentId && collection.studentId.toLowerCase().includes(searchLower)) ||
        (collection.parentName && collection.parentName.toLowerCase().includes(searchLower)) ||
        (collection.cnic && collection.cnic.toLowerCase().includes(searchLower));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (collection.status && collection.status.toLowerCase() === statusFilter.toLowerCase());

      // Class filter
      const matchesClass =
        classFilter === 'all' || 
        (collection.class && collection.class === classFilter);

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [collections, searchQuery, statusFilter, classFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCollections.length / collectionsPerPage);
  const startIndex = (currentPage - 1) * collectionsPerPage;
  const endIndex = startIndex + collectionsPerPage;
  
  // Get collections for current page
  const displayedCollections = useMemo(() => {
    return filteredCollections.slice(startIndex, endIndex);
  }, [filteredCollections, startIndex, endIndex]);

  // Reset to page 1 when filtered collections change (but only if current page is out of bounds)
  useEffect(() => {
    const maxPage = Math.ceil(filteredCollections.length / collectionsPerPage) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [filteredCollections.length, currentPage, collectionsPerPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate statistics from all collections (not just filtered)
  const totalCollected = useMemo(() => {
    if (!Array.isArray(collections)) return 0;
    // Sum only paid amounts from collections with status 'Paid'
    return collections
      .filter((c) => (c.status || '').toLowerCase() === 'paid')
      .reduce((sum, c) => sum + (c.paidAmount || c.amount || 0), 0);
  }, [collections]);
  
  const todayCollection = useMemo(() => {
    if (!Array.isArray(collections)) return 0;
    const today = new Date().toISOString().split('T')[0];
    return collections
      .filter((c) => {
        const collectionDate = c.collectedDate || (c.paymentDate ? new Date(c.paymentDate).toISOString().split('T')[0] : '');
        return collectionDate === today && (c.status || '').toLowerCase() === 'paid';
      })
      .reduce((sum, c) => sum + (c.paidAmount || c.amount || 0), 0);
  }, [collections]);

  const totalTransactions = useMemo(() => {
    if (!Array.isArray(collections)) return 0;
    return collections.length;
  }, [collections]);

  const pendingCollection = useMemo(() => {
    if (!Array.isArray(collections)) return 0;
    // Sum unpaid and partial amounts
    return collections
      .filter((c) => {
        const status = (c.status || '').toLowerCase();
        return status === 'unpaid' || status === 'partial';
      })
      .reduce((sum, c) => {
        const totalAmount = c.amount || 0;
        const paidAmount = c.paidAmount || 0;
        return sum + (totalAmount - paidAmount);
      }, 0);
  }, [collections]);

  const getStatusVariant = (status: string | undefined) => {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
      case 'paid':
        return 'approved';
      case 'unpaid':
        return 'rejected';
      case 'partial':
        return 'pending';
      case 'partial paid':
        return 'pending';
      case 'dues':
        return 'late';
      default:
        return 'pending';
    }
  };

  // Get student's grade from class (e.g., "Grade 10A" -> "Grade 10")
  const extractGradeFromClass = (className: string): string => {
    const match = className.match(/Grade\s+(\d+)/i);
    return match ? `Grade ${match[1]}` : '';
  };

  // Get fee amount based on student's grade and fee type
  const getFeeAmount = async (grade: string, feeType: string): Promise<number> => {
    if (!grade) return 0;
    try {
      const response = await api.fees.gradeFees.getByGrade(grade) as any;
      const fee = response?.data?.fee || null;
      if (!fee) return 0;
      
      if (feeType === 'Tuition Fee') {
        return fee.tuitionFee;
      } else if (feeType === 'Admission Fee') {
        return fee.admissionFee;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching fee:', error);
      return 0;
    }
  };

  // Payment form fields - dynamically generated
  const paymentFormFields: FormField[] = useMemo(() => {
    const fields: FormField[] = [];
    
    // Only show student select if no collection is selected (new payment)
    if (!selectedCollection) {
      fields.push({
        name: 'studentId',
        label: 'Student',
        type: 'select',
        required: true,
        options: studentOptions,
        placeholder: 'Select Student',
        halfWidth: true, // Display in 2-column layout
      });
    } else {
      // Show student info as read-only text when paying existing collection
      const totalAmount = selectedCollection.amount || 0;
      const paidAmount = selectedCollection.paidAmount || 0;
      const remainingAmount = totalAmount - paidAmount;
      
      fields.push({
        name: 'studentId',
        label: 'Student',
        type: 'text',
        required: false,
        disabled: true,
        placeholder: `${selectedCollection.studentName} (${selectedCollection.studentId}) - ${selectedCollection.class}`,
        halfWidth: true, // Display in 2-column layout
      });
      
      // Show fee summary for existing collection
      fields.push({
        name: 'totalAmount',
        label: 'Total Fee Amount',
        type: 'number',
        required: false,
        disabled: true,
        placeholder: formatCurrency(totalAmount),
        halfWidth: true, // Display in 2-column layout
      });
      
      fields.push({
        name: 'paidAmount',
        label: 'Already Paid',
        type: 'number',
        required: false,
        disabled: true,
        placeholder: formatCurrency(paidAmount),
        halfWidth: true, // Display in 2-column layout
      });
      
      fields.push({
        name: 'remainingAmount',
        label: 'Remaining Amount',
        type: 'number',
        required: false,
        disabled: true,
        placeholder: formatCurrency(remainingAmount),
        halfWidth: true, // Display in 2-column layout
      });
      
      // Payment type selector (Full/Partial)
      fields.push({
        name: 'paymentType',
        label: 'Payment Type',
        type: 'select',
        required: true,
        options: [
          { value: 'full', label: 'Full Payment (Pay Remaining Amount)' },
          { value: 'partial', label: 'Partial Payment (Enter Custom Amount)' },
        ],
        placeholder: 'Select Payment Type',
        defaultValue: 'full',
        halfWidth: true, // Display in 2-column layout
      });
    }
    
    return [
      ...fields,
    {
      name: 'feeType',
      label: 'Fee Type',
      type: selectedCollection ? 'text' : 'select', // Show as read-only text when paying existing collection
      required: true,
      disabled: !!selectedCollection, // Disable when paying existing collection
      options: selectedCollection ? undefined : feeOptions,
      placeholder: selectedCollection 
        ? selectedCollection.feeType || 'Fee Type' 
        : 'Select Fee Type',
      halfWidth: true, // Display in 2-column layout
    },
    {
      name: 'amount',
      label: selectedCollection ? 'Payment Amount' : 'Amount',
      type: 'number',
      required: true,
      placeholder: selectedCollection 
        ? 'Enter payment amount (for partial payment)' 
        : 'Enter amount (will auto-fill for Tuition/Admission fees)',
      min: 0,
      halfWidth: true, // Display in 2-column layout
    },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      required: true,
      options: [
        { value: 'Cash', label: 'Cash' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Credit Card', label: 'Credit Card' },
        { value: 'Cheque', label: 'Cheque' },
        { value: 'Online Payment', label: 'Online Payment' },
      ],
      placeholder: 'Select Payment Method',
      defaultValue: 'Cash', // Default to Cash
      halfWidth: true, // Display in 2-column layout
    },
    {
      name: 'collectedDate',
      label: 'Collection Date',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0], // Default to today
      halfWidth: true, // Display in 2-column layout
    },
    ];
  }, [studentOptions, feeOptions, selectedCollection]);

  // Handle form field changes to auto-populate amount
  const handleFormFieldChange = async (fieldName: string, value: any, currentFormData: Record<string, any>) => {
    // Auto-populate amount when student and fee type are selected
    if (fieldName === 'studentId' || fieldName === 'feeType') {
      const studentId = fieldName === 'studentId' ? value : currentFormData.studentId;
      const feeType = fieldName === 'feeType' ? value : currentFormData.feeType;

      if (studentId && feeType && (feeType === 'Tuition Fee' || feeType === 'Admission Fee')) {
        // Get students from API
        const studentsResponse = await api.students.getAll() as any;
        const students = studentsResponse?.data?.students || [];
        const student = students.find((s: any) => 
          (s.studentId || s._id || s.id).toString() === studentId
        );

        if (student) {
          const grade = extractGradeFromClass(student.class);
          const feeAmount = await getFeeAmount(grade, feeType);
          
          if (feeAmount > 0) {
            // Update the amount field in the form by directly updating the input value
            // and triggering React's onChange handler
            setTimeout(() => {
              const amountInput = document.querySelector(`#modal-field-amount`) as HTMLInputElement;
              if (amountInput && amountInput.value !== feeAmount.toString()) {
                // Create and dispatch a synthetic change event
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  'value'
                )?.set;
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(amountInput, feeAmount.toString());
                }
                const event = new Event('input', { bubbles: true });
                amountInput.dispatchEvent(event);
              }
            }, 10);
          }
        }
      }
    }
  };

  // Get initial data for the payment form based on selected collection
  const getPaymentInitialData = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedCollection) {
      // Calculate remaining amount for unpaid/partial payments
      const totalAmount = selectedCollection.amount || 0;
      const paidAmount = selectedCollection.paidAmount || 0;
      const remainingAmount = totalAmount - paidAmount;
      
      // Map fee type to match the options format
      let feeTypeValue = selectedCollection.feeType;
      // Convert backend enum values to frontend format if needed
      if (feeTypeValue === 'Tuition') {
        feeTypeValue = 'Tuition Fee';
      } else if (feeTypeValue === 'Admission') {
        feeTypeValue = 'Admission Fee';
      }
      
      return {
        studentId: `${selectedCollection.studentName} (${selectedCollection.studentId}) - ${selectedCollection.class}`, // Display as read-only text
        totalAmount: totalAmount.toString(), // Total fee amount (read-only)
        paidAmount: paidAmount.toString(), // Already paid amount (read-only)
        remainingAmount: remainingAmount.toString(), // Remaining amount (read-only)
        amount: remainingAmount > 0 ? remainingAmount.toString() : '0', // Payment amount (editable)
        feeType: feeTypeValue || selectedCollection.feeType, // Get from collection entry
        paymentMethod: selectedCollection.paymentMethod || 'Cash', // Default to Cash if not set
        collectedDate: selectedCollection.collectedDate || today, // Default to today if not set
        paymentType: 'full', // Default to full payment
      };
    }
    return {
      paymentMethod: 'Cash', // Default payment method
      collectedDate: today, // Default to today's date
      paymentType: 'full', // Default to full payment
    };
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (data: Record<string, any>) => {
    try {
      let student;
      
      // If paying existing collection, use the collection's student data
      if (selectedCollection) {
        // Use collection data directly - it already has all student info
        student = {
          id: selectedCollection.studentId,
          _id: selectedCollection._id,
          studentId: selectedCollection.studentId,
          name: selectedCollection.studentName,
          class: selectedCollection.class,
          parent: selectedCollection.parentName,
        } as any;
      } else {
        // For new payment, find student by selected ID (which is the custom studentId)
        const studentsResponse = await api.students.getAll() as any;
        const students = studentsResponse?.data?.students || [];
        student = students.find((s: any) => 
          (s.studentId || s._id || s.id).toString() === data.studentId
        );
        
        if (!student) {
          alert('Student not found. Please select a valid student.');
          return;
        }
      }

      // Calculate payment amount based on payment type
      let paymentAmount = parseFloat(data.amount) || 0;
      const totalAmount = selectedCollection ? (selectedCollection.amount || 0) : parseFloat(data.totalAmount || '0');
      const currentPaidAmount = selectedCollection ? (selectedCollection.paidAmount || 0) : 0;
      const remainingAmount = totalAmount - currentPaidAmount;
      
      // Handle payment type (full/partial)
      if (data.paymentType === 'full') {
        paymentAmount = remainingAmount; // Pay the full remaining amount
      } else if (data.paymentType === 'partial') {
        // Use the entered amount for partial payment
        if (paymentAmount <= 0) {
          alert('Please enter a valid payment amount.');
          return;
        }
        if (paymentAmount > remainingAmount) {
          alert(`Payment amount (${formatCurrency(paymentAmount)}) cannot exceed remaining amount (${formatCurrency(remainingAmount)}).`);
          return;
        }
      }
      
      // For new payments (not updating existing)
      if (!selectedCollection) {
        if ((data.feeType === 'Tuition Fee' || data.feeType === 'Admission Fee') && paymentAmount === 0) {
          const grade = extractGradeFromClass(student.class);
          paymentAmount = await getFeeAmount(grade, data.feeType);
          if (paymentAmount === 0) {
            alert(`Fee structure not found for ${grade}. Please configure it in Fee Management first.`);
            return;
          }
        }
      }
      
      if (paymentAmount <= 0) {
        alert('Please enter a valid payment amount.');
        return;
      }

      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Get student data - use collection data if paying existing, otherwise use student data
      // student.id is the custom studentId (like S001) after DataStore transformation
      const studentName = selectedCollection?.studentName || student.name;
      const studentClass = selectedCollection?.class || student.class;
      // Use student.id which is the custom studentId (S001, S002, etc.) - same as displayed in student list
      const studentId = selectedCollection?.studentId || student.id.toString();
      
      // Calculate new paid amount and status
      const newPaidAmount = currentPaidAmount + paymentAmount;
      const newStatus = newPaidAmount >= totalAmount ? 'Paid' : (newPaidAmount > 0 ? 'Partial' : 'Unpaid');

      // Create transaction entry for this payment (optional - don't block payment if it fails)
      const feeCollectionId = selectedCollection ? (selectedCollection._id || selectedCollection.id) : undefined;

      try {
        // Try to create transaction entry, but don't block payment if it fails
        await addTransaction({
          type: 'Income',
          category: 'Fee Collection',
          description: `${data.feeType} - ${studentName} (${studentClass})${newStatus === 'Partial' ? ` - Partial Payment` : ''}`,
          amount: paymentAmount,
          date: data.collectedDate,
          time: timeString,
          status: 'Completed',
          paymentMethod: data.paymentMethod,
          feeId: feeCollectionId, // Link transaction to fee collection ID
          referenceId: `fee-${studentId}`, // Legacy field for backward compatibility
        }, role || 'admin');
        console.log('Transaction entry created successfully');
      } catch (txError: any) {
        // Log warning but don't block payment - transaction feature may not be implemented yet
        console.warn('Failed to create transaction entry (this is optional):', txError?.message || txError);
        // Continue with payment processing even if transaction creation fails
      }

      if (selectedCollection) {
        // Update existing collection with new payment
        const collectionId = selectedCollection._id || selectedCollection.id;
        await api.fees.collections.update(collectionId, {
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentMethod: data.paymentMethod,
          paymentDate: data.collectedDate ? new Date(data.collectedDate).toISOString() : new Date().toISOString(),
          remarks: selectedCollection.remarks || `${data.feeType} payment - ${newStatus}`,
        });
        
        const statusMessage = newStatus === 'Paid' 
          ? `Full payment of ${formatCurrency(paymentAmount)} processed successfully for ${studentName}. Total: ${formatCurrency(newPaidAmount)}/${formatCurrency(totalAmount)}`
          : `Partial payment of ${formatCurrency(paymentAmount)} processed successfully for ${studentName}. Total paid: ${formatCurrency(newPaidAmount)}/${formatCurrency(totalAmount)}. Remaining: ${formatCurrency(totalAmount - newPaidAmount)}`;
        
        alert(statusMessage);
      } else {
        // Create new collection entry (for new fee collection, not payment)
        // Need to get student MongoDB _id, not custom studentId
        const studentsResponse = await api.students.getAll() as any;
        const students = studentsResponse?.data?.students || [];
        const studentRecord = students.find((s: any) => 
          (s.studentId || s._id || s.id).toString() === studentId
        );
        
        if (!studentRecord) {
          alert('Student not found. Please try again.');
          return;
        }
        
        const studentMongoId = studentRecord._id || studentRecord.id;
        
        const response = await api.fees.collections.create({
          studentId: studentMongoId, // Use MongoDB _id
          feeType: data.feeType,
          amount: paymentAmount,
          paymentDate: data.collectedDate ? new Date(data.collectedDate).toISOString() : new Date().toISOString(),
          paymentMethod: data.paymentMethod,
          status: 'Paid', // New collections are created as paid
          paidAmount: paymentAmount,
        });
        
        const collectionAmount = (response as any)?.data?.collection?.amount || (response as any)?.amount || paymentAmount;
        alert(`Payment of ${formatCurrency(collectionAmount)} collected successfully for ${studentName}`);
      }
      
      // Reload collections
      await loadCollections();
      
      // Close modal and reset selected collection
      setIsPaymentModalOpen(false);
      setSelectedCollection(null);
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      // Extract detailed error message
      let errorMessage = 'Failed to process payment. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errorData?.error) {
        errorMessage = error.errorData.error;
      } else if (error?.errorData?.message) {
        errorMessage = error.errorData.message;
      }
      alert(`Error: ${errorMessage}`);
    }
  };

  // Handle Pay button click
  const handlePayClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsPaymentModalOpen(true);
  };

  // Handle Collect Fee button click (new payment)
  const handleCollectFeeClick = () => {
    setSelectedCollection(null);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fees Collection</h1>
        <button 
          className="btn-primary"
          onClick={handleCollectFeeClick}
        >
          <CreditCard size={18} />
          Collect Fee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <DollarSign size={24} />
          <div>
            <h3>Total Collected</h3>
            <p>{formatCurrency(totalCollected)}</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <h3>Today's Collection</h3>
            <p>{formatCurrency(todayCollection)}</p>
          </div>
        </div>
        <div className="stat-card">
          <CreditCard size={24} />
          <div>
            <h3>Total Transactions</h3>
            <p>{totalTransactions}</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <h3>Pending Collection</h3>
            <p>{formatCurrency(pendingCollection)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card
        variant="custom"
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#333',
              }}
            >
              <Search size={16} />
              Search (Name, ID, Parent, CNIC)
            </label>
            <input
              type="text"
              placeholder="Search by student name, ID, parent name, or CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '180px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#333',
              }}
            >
              <Filter size={16} />
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial paid">Partial Paid</option>
              <option value="dues">Dues</option>
            </select>
          </div>

          {/* Class Filter */}
          <div style={{ minWidth: '180px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#333',
              }}
            >
              <Filter size={16} />
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            >
              <option value="all">All Classes</option>
              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Collection Records Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="section-title" style={{ margin: 0 }}>Fee Collection Entries</div>
        {filteredCollections.length > 0 && (
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredCollections.length)} of {filteredCollections.length} entries
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          Loading fee collections...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Parent Name</th>
                <th>CNIC</th>
                <th>Class</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Collection Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(filteredCollections) || filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    {!Array.isArray(collections) || collections.length === 0 
                      ? 'No fee collection records found. Click "Collect Fee" to add a new payment.'
                      : 'No fee collection records found matching your filters.'}
                  </td>
                </tr>
              ) : (
              displayedCollections.map((collection) => (
                <tr key={collection.id}>
                  <td>{collection.studentId}</td>
                  <td>
                    <strong>{collection.studentName}</strong>
                  </td>
                  <td>{collection.parentName}</td>
                  <td>{collection.cnic || '-'}</td>
                  <td>{collection.class}</td>
                  <td>{collection.feeType}</td>
                  <td>{formatCurrency(collection.amount)}</td>
                  <td>{collection.paymentMethod}</td>
                  <td>{collection.collectedDate}</td>
                  <td>
                    <Badge variant={getStatusVariant(collection.status || 'paid')} size="sm">
                      {collection.status || 'Paid'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ViewButton
                        size="sm"
                        onClick={() => {
                          setSelectedReceipt(collection);
                          setIsViewReceiptModalOpen(true);
                        }}
                      />
                      {((collection.status || 'Unpaid').toLowerCase() !== 'paid') && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayClick(collection)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.875rem',
                            minWidth: 'auto',
                          }}
                        >
                          <DollarSign size={14} style={{ marginRight: '0.25rem' }} />
                          Pay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredCollections.length > collectionsPerPage && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginTop: '2rem',
          padding: '1rem'
        }}>
          <Button
            variant="secondary"
            size="md"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(() => {
              const pages: (number | string)[] = [];
              
              // If total pages is 7 or less, show all pages
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                // Calculate which pages to show
                let startPage = Math.max(2, currentPage - 1);
                let endPage = Math.min(totalPages - 1, currentPage + 1);
                
                // Adjust if we're near the start
                if (currentPage <= 3) {
                  endPage = Math.min(5, totalPages - 1);
                }
                
                // Adjust if we're near the end
                if (currentPage >= totalPages - 2) {
                  startPage = Math.max(2, totalPages - 4);
                }
                
                // Add ellipsis after first page if needed
                if (startPage > 2) {
                  pages.push('...');
                }
                
                // Add middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                
                // Add ellipsis before last page if needed
                if (endPage < totalPages - 1) {
                  pages.push('...');
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages.map((page, index) => {
                if (typeof page === 'string') {
                  return (
                    <span key={`ellipsis-${index}`} style={{ padding: '0 0.25rem', color: '#666' }}>
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.375rem',
                      backgroundColor: currentPage === page ? '#3b82f6' : '#fff',
                      color: currentPage === page ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: currentPage === page ? 600 : 400,
                      minWidth: '2.5rem',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {/* Payment Collection Modal */}
      <CreateFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedCollection(null);
        }}
        title={selectedCollection ? 'Pay Fee' : 'Collect Fee Payment'}
        fields={paymentFormFields}
        onSubmit={handlePaymentSubmit}
        submitButtonText={selectedCollection ? 'Pay Amount' : 'Collect Payment'}
        submitButtonIcon={<CreditCard size={16} />}
        initialData={getPaymentInitialData()}
        onFieldChange={handleFormFieldChange}
        size="lg"
      />

      {/* View Receipt Modal */}
      <Modal
        isOpen={isViewReceiptModalOpen}
        onClose={() => {
          setIsViewReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
        title="Fee Receipt"
        size="lg"
      >
        {selectedReceipt && (
          <div>
            <ViewForm
              sections={[
                {
                  title: 'Receipt Information',
                  icon: DollarSign,
                  fields: [
                    { label: 'Student Name', value: selectedReceipt.studentName, icon: User },
                    { label: 'Parent Name', value: selectedReceipt.parentName },
                    { label: 'Student ID', value: selectedReceipt.studentId },
                    { label: 'Class', value: selectedReceipt.class },
                    { label: 'Fee Type', value: selectedReceipt.feeType },
                    { 
                      label: 'Amount', 
                      value: formatCurrency(selectedReceipt.amount),
                      icon: DollarSign
                    },
                    { label: 'Collection Date', value: selectedReceipt.collectedDate, icon: Calendar },
                    { label: 'Payment Method', value: selectedReceipt.paymentMethod || 'N/A' },
                    {
                      label: 'Status',
                      value: selectedReceipt.status,
                      renderAsBadge: { 
                        variant: getStatusVariant(selectedReceipt.status) as any, 
                        size: 'sm' 
                      },
                    },
                    ...(selectedReceipt.cnic ? [{ label: 'CNIC', value: selectedReceipt.cnic }] : []),
                  ],
                },
              ]}
            />
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem' }}>
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow && selectedReceipt) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Fee Receipt - ${selectedReceipt.studentName}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #333; text-align: center; }
                            .receipt-info { margin: 15px 0; }
                            .label { font-weight: bold; }
                            .amount { font-size: 1.5em; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
                            hr { border: 1px solid #ddd; margin: 20px 0; }
                          </style>
                        </head>
                        <body>
                          <h1>Fee Receipt</h1>
                          <hr>
                          <div class="receipt-info"><span class="label">Student Name:</span> ${selectedReceipt.studentName}</div>
                          <div class="receipt-info"><span class="label">Parent Name:</span> ${selectedReceipt.parentName}</div>
                          <div class="receipt-info"><span class="label">Student ID:</span> ${selectedReceipt.studentId}</div>
                          <div class="receipt-info"><span class="label">Class:</span> ${selectedReceipt.class}</div>
                          <div class="receipt-info"><span class="label">Fee Type:</span> ${selectedReceipt.feeType}</div>
                          <div class="amount">Amount: ${formatCurrency(selectedReceipt.amount)}</div>
                          <hr>
                          <div class="receipt-info"><span class="label">Collection Date:</span> ${selectedReceipt.collectedDate}</div>
                          <div class="receipt-info"><span class="label">Payment Method:</span> ${selectedReceipt.paymentMethod || 'N/A'}</div>
                          <div class="receipt-info"><span class="label">Status:</span> ${selectedReceipt.status}</div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeesCollection;

