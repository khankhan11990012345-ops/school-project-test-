import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, Users, Calendar, CreditCard, CheckCircle, Clock, Building2, FileText, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ViewButton, EditButton, PrintButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal } from '../../../components/Form';
import { FormField } from '../../../components/Form/CreateForm';
import { addTransaction } from './Transactions';
import { UserRole } from '../../../types';
import '../../../styles/universal.css';
import './Accounts.css';

interface PayrollRecord {
  id: number;
  teacherName: string;
  employeeId: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  paidAmount?: number; // Track how much has been paid
}

const TeacherPayroll = () => {
  useParams<{ role: UserRole }>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 1,
      teacherName: 'John Smith',
      employeeId: 'T001',
      department: 'Mathematics',
      baseSalary: 5000,
      allowances: 500,
      deductions: 200,
      netSalary: 5300,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paidAmount: 5300,
    },
    {
      id: 2,
      teacherName: 'Sarah Johnson',
      employeeId: 'T002',
      department: 'Science',
      baseSalary: 5200,
      allowances: 600,
      deductions: 150,
      netSalary: 5650,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paidAmount: 5650,
    },
    {
      id: 3,
      teacherName: 'Michael Brown',
      employeeId: 'T003',
      department: 'English',
      baseSalary: 4800,
      allowances: 400,
      deductions: 180,
      netSalary: 5020,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paidAmount: 5020,
    },
    {
      id: 4,
      teacherName: 'Emily Davis',
      employeeId: 'T004',
      department: 'History',
      baseSalary: 4900,
      allowances: 450,
      deductions: 0,
      netSalary: 5350,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paidAmount: 5350,
    },
    {
      id: 5,
      teacherName: 'David Wilson',
      employeeId: 'T005',
      department: 'Physics',
      baseSalary: 5100,
      allowances: 550,
      deductions: 0,
      netSalary: 5650,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paidAmount: 5650,
    },
    {
      id: 6,
      teacherName: 'Lisa Anderson',
      employeeId: 'T006',
      department: 'Chemistry',
      baseSalary: 4950,
      allowances: 500,
      deductions: 190,
      netSalary: 5260,
      paymentDate: '2024-03-01',
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      paidAmount: 0,
    },
  ]);

  const monthlyPayroll = [
    { month: 'Jan', total: 32000 },
    { month: 'Feb', total: 32500 },
    { month: 'Mar', total: 33000 },
    { month: 'Apr', total: 32800 },
    { month: 'May', total: 33200 },
    { month: 'Jun', total: 33000 },
  ];

  const departmentBreakdown = [
    { department: 'Mathematics', amount: 15000, percentage: 25 },
    { department: 'Science', amount: 18000, percentage: 30 },
    { department: 'English', amount: 12000, percentage: 20 },
    { department: 'History', amount: 8000, percentage: 13 },
    { department: 'Other', amount: 7000, percentage: 12 },
  ];

  // Calculate status based on paid amount vs net salary
  const getRecordStatus = (record: PayrollRecord): string => {
    const paidAmount = record.paidAmount || 0;
    if (paidAmount === 0) return 'Pending';
    if (paidAmount >= record.netSalary) return 'Paid';
    return 'Partial Paid';
  };

  // Update records with calculated status
  const recordsWithStatus = useMemo(() => {
    return payrollRecords.map((record) => ({
      ...record,
      status: getRecordStatus(record),
    }));
  }, [payrollRecords]);

  const totalPayroll = recordsWithStatus.reduce((sum, record) => sum + record.netSalary, 0);
  const paidCount = recordsWithStatus.filter(r => r.status === 'Paid').length;
  const pendingCount = recordsWithStatus.filter(r => r.status === 'Pending' || r.status === 'Partial Paid').length;

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'approved';
      case 'partial paid':
        return 'pending';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Handle payment form submission
  const handlePaymentSubmit = () => {
    if (!selectedRecord) return;

    // Validate form
    const errors: Record<string, string> = {};
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      errors.amount = 'Please enter a valid payment amount';
    }
    if (!paymentFormData.paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }
    if (!paymentFormData.paymentDate) {
      errors.paymentDate = 'Please select a payment date';
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    const paymentAmount = parseFloat(paymentFormData.amount);
    const currentPaidAmount = selectedRecord.paidAmount || 0;
    const newPaidAmount = currentPaidAmount + paymentAmount;
    const newStatus = newPaidAmount >= selectedRecord.netSalary ? 'Paid' : 'Partial Paid';

    // Create a separate transaction entry for this payment
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    addTransaction({
      type: 'Expense',
      category: 'Salaries',
      description: `Teacher Payroll - ${selectedRecord.teacherName} (${selectedRecord.department}) - Payment ${paymentAmount > 0 ? `(${formatCurrency(paymentAmount)})` : ''}`,
      amount: -paymentAmount, // Negative for expenses
      date: paymentFormData.paymentDate,
      time: timeString,
      status: 'Completed',
      paymentMethod: paymentFormData.paymentMethod,
      payrollId: selectedRecord.id, // Link transaction to payroll ID
      referenceId: `payroll-${selectedRecord.id}`, // Legacy field for backward compatibility
    });

    // Update the payroll record
    setPayrollRecords((prev) =>
      prev.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              paidAmount: newPaidAmount,
              paymentMethod: paymentFormData.paymentMethod,
              paymentDate: paymentFormData.paymentDate,
              status: newStatus,
            }
          : record
      )
    );

    const statusMessage = newPaidAmount >= selectedRecord.netSalary
      ? `Full payment of ${formatCurrency(paymentAmount)} processed for ${selectedRecord.teacherName}. Status: Paid`
      : `Partial payment of ${formatCurrency(paymentAmount)} processed for ${selectedRecord.teacherName}. Total paid: ${formatCurrency(newPaidAmount)} / ${formatCurrency(selectedRecord.netSalary)}. Status: Partial Paid`;

    alert(statusMessage);

    // Reset form and close modal
    setPaymentFormData({
      amount: '',
      paymentMethod: '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setPaymentErrors({});
    setIsPaymentModalOpen(false);
    setSelectedRecord(null);
  };

  // Handle Pay button click
  const handlePayClick = (record: PayrollRecord) => {
    setSelectedRecord(record);
    const remainingAmount = record.netSalary - (record.paidAmount || 0);
    setPaymentFormData({
      amount: remainingAmount > 0 ? remainingAmount.toString() : '',
      paymentMethod: record.paymentMethod,
      paymentDate: record.paymentDate,
    });
    setPaymentErrors({});
    setIsPaymentModalOpen(true);
  };

  // Handle View button click
  const handleViewClick = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  // Handle Edit button click
  const handleEditClick = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Handle Print button click
  const handlePrintClick = (record: PayrollRecord) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const paidAmount = record.paidAmount || 0;
      const remainingAmount = record.netSalary - paidAmount;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payroll Slip - ${record.teacherName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 2rem;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 1rem;
                margin-bottom: 2rem;
              }
              .header h1 {
                margin: 0;
                color: #333;
              }
              .header p {
                margin: 0.5rem 0;
                color: #666;
              }
              .section {
                margin-bottom: 2rem;
              }
              .section h2 {
                color: #667eea;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 0.5rem;
                margin-bottom: 1rem;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
              }
              .info-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #f0f0f0;
              }
              .info-label {
                font-weight: 600;
                color: #666;
              }
              .info-value {
                color: #333;
              }
              .salary-breakdown {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1rem;
              }
              .total {
                font-size: 1.2rem;
                font-weight: 700;
                color: #667eea;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 2px solid #667eea;
              }
              .footer {
                margin-top: 3rem;
                text-align: center;
                color: #666;
                font-size: 0.875rem;
              }
              @media print {
                body {
                  padding: 1rem;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SCHOLYMAN SCHOOL</h1>
              <p>Payroll Slip</p>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Employee Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Employee Name:</span>
                  <span class="info-value">${record.teacherName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Employee ID:</span>
                  <span class="info-value">${record.employeeId}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Department:</span>
                  <span class="info-value">${record.department}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${record.paymentDate}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Salary Breakdown</h2>
              <div class="salary-breakdown">
                <div class="info-item">
                  <span class="info-label">Base Salary:</span>
                  <span class="info-value">${formatCurrency(record.baseSalary)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Allowances:</span>
                  <span class="info-value" style="color: #10b981;">+${formatCurrency(record.allowances)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Deductions:</span>
                  <span class="info-value" style="color: #ef4444;">-${formatCurrency(record.deductions)}</span>
                </div>
                <div class="total">
                  <div class="info-item">
                    <span class="info-label">Net Salary:</span>
                    <span class="info-value">${formatCurrency(record.netSalary)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Payment Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${record.paymentMethod}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">${record.status}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Amount Paid:</span>
                  <span class="info-value">${formatCurrency(paidAmount)}</span>
                </div>
                ${remainingAmount > 0 ? `
                <div class="info-item">
                  <span class="info-label">Remaining:</span>
                  <span class="info-value" style="color: #ef4444;">${formatCurrency(remainingAmount)}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated document. No signature required.</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Edit form fields
  const editFormFields: FormField[] = [
    {
      name: 'baseSalary',
      label: 'Base Salary',
      type: 'number',
      required: true,
      placeholder: 'Enter base salary',
      min: 0,
    },
    {
      name: 'allowances',
      label: 'Allowances',
      type: 'number',
      required: true,
      placeholder: 'Enter allowances',
      min: 0,
    },
    {
      name: 'deductions',
      label: 'Deductions',
      type: 'number',
      required: true,
      placeholder: 'Enter deductions',
      min: 0,
    },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      required: true,
      options: [
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Cash', label: 'Cash' },
        { value: 'Cheque', label: 'Cheque' },
        { value: 'Online Payment', label: 'Online Payment' },
      ],
      placeholder: 'Select Payment Method',
    },
  ];

  // Get initial data for edit form
  const getEditInitialData = () => {
    if (selectedRecord) {
      return {
        baseSalary: selectedRecord.baseSalary.toString(),
        allowances: selectedRecord.allowances.toString(),
        deductions: selectedRecord.deductions.toString(),
        paymentMethod: selectedRecord.paymentMethod,
      };
    }
    return {};
  };

  // Handle edit form submission
  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedRecord) {
      const baseSalary = parseFloat(data.baseSalary);
      const allowances = parseFloat(data.allowances);
      const deductions = parseFloat(data.deductions);
      const newNetSalary = baseSalary + allowances - deductions;

      // Update the payroll record
      setPayrollRecords((prev) =>
        prev.map((record) =>
          record.id === selectedRecord.id
            ? {
                ...record,
                baseSalary,
                allowances,
                deductions,
                netSalary: newNetSalary,
                paymentMethod: data.paymentMethod,
              }
            : record
        )
      );

      alert(`Payroll record updated successfully for ${selectedRecord.teacherName}`);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Teacher Payroll</h1>
        <button className="btn-primary">
          <DollarSign size={18} />
          Process Payroll
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card
          variant="stat"
          icon={<DollarSign size={24} />}
          value={formatCurrency(totalPayroll)}
          label="Total Payroll"
          color="#667eea"
        />
        <Card
          variant="stat"
          icon={<Users size={24} />}
          value={payrollRecords.length.toString()}
          label="Total Teachers"
          color="#10b981"
        />
        <Card
          variant="stat"
          icon={<CheckCircle size={24} />}
          value={paidCount.toString()}
          label="Paid"
          color="#22c55e"
        />
        <Card
          variant="stat"
          icon={<Clock size={24} />}
          value={pendingCount.toString()}
          label="Pending"
          color="#f59e0b"
        />
      </div>

      {/* Charts */}
      <div className="section-title">Payroll Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Monthly Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPayroll}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="total" fill="#667eea" name="Total Payroll" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Payroll by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, percentage }) => `${department}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {departmentBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="section-title">Payroll Records</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Teacher Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Base Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordsWithStatus.slice(0, 10).map((record) => {
              const paidAmount = record.paidAmount || 0;
              const remainingAmount = record.netSalary - paidAmount;
              const isFullyPaid = record.status === 'Paid';

              return (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>
                    <strong>{record.teacherName}</strong>
                  </td>
                  <td>{record.employeeId}</td>
                  <td>{record.department}</td>
                  <td>{formatCurrency(record.baseSalary)}</td>
                  <td style={{ color: '#10b981' }}>+{formatCurrency(record.allowances)}</td>
                  <td style={{ color: '#ef4444' }}>-{formatCurrency(record.deductions)}</td>
                  <td>
                    <strong>{formatCurrency(record.netSalary)}</strong>
                    {paidAmount > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                        Paid: {formatCurrency(paidAmount)}
                        {remainingAmount > 0 && (
                          <span style={{ color: '#ef4444' }}> | Remaining: {formatCurrency(remainingAmount)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{record.paymentDate}</td>
                  <td>{record.paymentMethod}</td>
                  <td>
                    <Badge variant={getStatusVariant(record.status)} size="sm">
                      {record.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ViewButton size="sm" onClick={() => handleViewClick(record)} />
                      <EditButton size="sm" onClick={() => handleEditClick(record)} />
                      <PrintButton size="sm" onClick={() => handlePrintClick(record)} />
                      {!isFullyPaid && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayClick(record)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedRecord(null);
          setPaymentFormData({
            amount: '',
            paymentMethod: '',
            paymentDate: new Date().toISOString().split('T')[0],
          });
          setPaymentErrors({});
        }}
        title={selectedRecord ? `Pay Salary - ${selectedRecord.teacherName}` : 'Process Payment'}
        size="lg"
      >
        {selectedRecord && (
          <>
            {/* Salary Information Display */}
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Salary Information:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div>Net Salary: <strong>{formatCurrency(selectedRecord.netSalary)}</strong></div>
                <div>Already Paid: <strong>{formatCurrency(selectedRecord.paidAmount || 0)}</strong></div>
                <div style={{ color: selectedRecord.netSalary - (selectedRecord.paidAmount || 0) > 0 ? '#ef4444' : '#10b981', marginTop: '0.25rem' }}>
                  Remaining: <strong>{formatCurrency(selectedRecord.netSalary - (selectedRecord.paidAmount || 0))}</strong>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={paymentFormData.amount}
                  onChange={(e) => {
                    setPaymentFormData({ ...paymentFormData, amount: e.target.value });
                    if (paymentErrors.amount) {
                      setPaymentErrors({ ...paymentErrors, amount: '' });
                    }
                  }}
                  placeholder="Enter payment amount"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${paymentErrors.amount ? '#ef4444' : '#e0e0e0'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
                {paymentErrors.amount && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {paymentErrors.amount}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Payment Method *
                </label>
                <select
                  value={paymentFormData.paymentMethod}
                  onChange={(e) => {
                    setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value });
                    if (paymentErrors.paymentMethod) {
                      setPaymentErrors({ ...paymentErrors, paymentMethod: '' });
                    }
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${paymentErrors.paymentMethod ? '#ef4444' : '#e0e0e0'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Payment Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
                {paymentErrors.paymentMethod && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {paymentErrors.paymentMethod}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentFormData.paymentDate}
                  onChange={(e) => {
                    setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value });
                    if (paymentErrors.paymentDate) {
                      setPaymentErrors({ ...paymentErrors, paymentDate: '' });
                    }
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${paymentErrors.paymentDate ? '#ef4444' : '#e0e0e0'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                />
                {paymentErrors.paymentDate && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {paymentErrors.paymentDate}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedRecord(null);
                    setPaymentFormData({
                      amount: '',
                      paymentMethod: '',
                      paymentDate: new Date().toISOString().split('T')[0],
                    });
                    setPaymentErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  <CreditCard size={16} style={{ marginRight: '0.5rem' }} />
                  Process Payment
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* View Payroll Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Payroll Details"
        size="lg"
      >
        {selectedRecord && (
          <ViewForm
            sections={[
              {
                title: 'Employee Information',
                icon: User,
                fields: [
                  {
                    label: 'Teacher Name',
                    value: selectedRecord.teacherName,
                    icon: User,
                  },
                  {
                    label: 'Employee ID',
                    value: selectedRecord.employeeId,
                  },
                  {
                    label: 'Department',
                    value: selectedRecord.department,
                    icon: Building2,
                  },
                ],
              },
              {
                title: 'Salary Breakdown',
                icon: DollarSign,
                fields: [
                  {
                    label: 'Base Salary',
                    value: formatCurrency(selectedRecord.baseSalary),
                    icon: DollarSign,
                  },
                  {
                    label: 'Allowances',
                    value: formatCurrency(selectedRecord.allowances),
                    badge: { variant: 'success', text: `+${formatCurrency(selectedRecord.allowances)}` },
                  },
                  {
                    label: 'Deductions',
                    value: formatCurrency(selectedRecord.deductions),
                    badge: { variant: 'rejected', text: `-${formatCurrency(selectedRecord.deductions)}` },
                  },
                  {
                    label: 'Net Salary',
                    value: formatCurrency(selectedRecord.netSalary),
                    badge: { variant: 'info', text: formatCurrency(selectedRecord.netSalary) },
                  },
                ],
              },
              {
                title: 'Payment Information',
                icon: CreditCard,
                fields: [
                  {
                    label: 'Payment Date',
                    value: selectedRecord.paymentDate,
                    icon: Calendar,
                  },
                  {
                    label: 'Payment Method',
                    value: selectedRecord.paymentMethod,
                    icon: CreditCard,
                  },
                  {
                    label: 'Amount Paid',
                    value: formatCurrency(selectedRecord.paidAmount || 0),
                    icon: DollarSign,
                  },
                  {
                    label: 'Remaining Amount',
                    value: formatCurrency(selectedRecord.netSalary - (selectedRecord.paidAmount || 0)),
                    badge: {
                      variant: (selectedRecord.netSalary - (selectedRecord.paidAmount || 0)) > 0 ? 'rejected' : 'success',
                      text: formatCurrency(selectedRecord.netSalary - (selectedRecord.paidAmount || 0)),
                    },
                  },
                  {
                    label: 'Status',
                    value: selectedRecord.status,
                    badge: { variant: getStatusVariant(selectedRecord.status) as any, text: selectedRecord.status },
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Payroll Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecord(null);
        }}
        title={selectedRecord ? `Edit Payroll - ${selectedRecord.teacherName}` : 'Edit Payroll'}
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitButtonText="Update Payroll"
        submitButtonIcon={<FileText size={16} />}
        initialData={getEditInitialData()}
        size="lg"
      />
    </div>
  );
};

export default TeacherPayroll;

