import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingDown, DollarSign, FileText, Calendar, Clock, Building2, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ViewButton, EditButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import { CreateFormModal } from '../../../components/Form';
import { FormField } from '../../../components/Form/CreateForm';
import Card from '../../../components/Card/Card';
import { addTransaction } from './Transactions';
import { UserRole } from '../../../types';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Accounts.css';

interface Expense {
  id: number | string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  vendor: string;
  paidAmount?: number; // Track how much has been paid
}

const Expenses = () => {
  const { role } = useParams<{ role: UserRole }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load expenses from API
    const loadExpenses = async () => {
      try {
        const expensesData = await api.expenses.getAll();
        if (Array.isArray(expensesData)) {
          setExpenses(expensesData);
        } else {
          console.error('api.expenses.getAll did not return an array:', expensesData);
          setExpenses([]);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
        setExpenses([]);
      }
    };
    
    loadExpenses();

    // Refresh interval
    const interval = setInterval(() => {
      loadExpenses();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  // Calculate status based on paid amount vs expense amount
  const getExpenseStatus = (expense: Expense): string => {
    const paidAmount = expense.paidAmount || 0;
    if (paidAmount === 0) return 'Pending';
    if (paidAmount >= expense.amount) return 'Paid';
    return 'Partial Paid';
  };

  // Update expenses with calculated status
  const expensesWithStatus = useMemo(() => {
    return expenses.map((expense) => ({
      ...expense,
      status: getExpenseStatus(expense),
    }));
  }, [expenses]);

  // Calculate category expenses from actual data
  const categoryExpenses = useMemo(() => {
    const categoryMap = new Map<string, number>();
    const colors: Record<string, string> = {
      'Salaries': '#e74c3c',
      'Utilities': '#3498db',
      'Supplies': '#f39c12',
      'Maintenance': '#27ae60',
      'Equipment': '#9b59b6',
      'Transportation': '#1abc9c',
      'Other': '#95a5a6',
    };
    
    expensesWithStatus.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      color: colors[category] || '#95a5a6',
    }));
  }, [expensesWithStatus]);

  // Calculate monthly expenses from actual data
  const monthlyExpenses = useMemo(() => {
    const monthMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    expensesWithStatus.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + expense.amount);
    });
    
    // Get last 6 months
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      last6Months.push({
        month: monthNames[date.getMonth()],
        expenses: monthMap.get(monthKey) || 0,
      });
    }
    
    return last6Months;
  }, [expensesWithStatus]);

  const totalExpenses = expensesWithStatus.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expensesWithStatus.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expensesWithStatus.filter(e => e.status === 'Pending' || e.status === 'Partial Paid').reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate this month's expenses
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expensesWithStatus
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expensesWithStatus]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'approved';
      case 'partial paid':
        return 'pending';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  // Add Expense form fields
  const addExpenseFormFields: FormField[] = [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Salaries', label: 'Salaries' },
        { value: 'Utilities', label: 'Utilities' },
        { value: 'Supplies', label: 'Supplies' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Equipment', label: 'Equipment' },
        { value: 'Transportation', label: 'Transportation' },
        { value: 'Other', label: 'Other' },
      ],
      placeholder: 'Select Category',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Enter expense description',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      placeholder: 'Enter amount',
      min: 0,
    },
    {
      name: 'vendor',
      label: 'Vendor',
      type: 'text',
      required: true,
      placeholder: 'Enter vendor name',
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Rejected', label: 'Rejected' },
      ],
      placeholder: 'Select Status',
      defaultValue: 'Pending',
    },
  ];

  // Edit form fields (same as add)
  const editExpenseFormFields: FormField[] = addExpenseFormFields;

  // Get initial data for edit form
  const getEditInitialData = () => {
    if (selectedExpense) {
      return {
        category: selectedExpense.category,
        description: selectedExpense.description,
        amount: selectedExpense.amount.toString(),
        vendor: selectedExpense.vendor,
        date: selectedExpense.date,
        status: selectedExpense.status,
      };
    }
    return {};
  };

  // Handle add expense form submission
  const handleAddExpense = async (data: Record<string, any>) => {
    try {
      const expenseData = {
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        vendor: data.vendor,
        date: data.date,
        status: data.status || 'pending',
        paidAmount: data.status === 'Paid' ? parseFloat(data.amount) : 0,
      };

      const newExpenseResponse = await api.expenses.create(expenseData) as any;
      const newExpense = newExpenseResponse?.data?.expense || newExpenseResponse?.data || newExpenseResponse;

      // If expense is added with "Paid" status, create a transaction
      if (data.status === 'Paid') {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        try {
          await addTransaction({
            type: 'Expense',
            category: data.category,
            description: data.description,
            amount: -parseFloat(data.amount), // Negative for expenses
            date: data.date,
            time: timeString,
            status: 'Completed',
            expenseId: newExpense?.id || newExpense?._id,
            referenceId: `expense-${newExpense?.id || newExpense?._id}`,
          }, role || 'admin');
        } catch (error) {
          console.error('Error creating transaction for expense:', error);
        }
      }

      // Reload expenses
      const expensesData = await api.expenses.getAll() as any;
      if (Array.isArray(expensesData)) {
        setExpenses(expensesData);
      } else if (expensesData?.data && Array.isArray(expensesData.data)) {
        setExpenses(expensesData.data);
      }
      
      alert(`Expense of ${formatCurrency(newExpense?.amount || parseFloat(data.amount))} added successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  // Handle edit expense form submission
  const handleEditExpense = async (data: Record<string, any>) => {
    if (selectedExpense) {
      try {
        const wasPaid = selectedExpense.status === 'Paid';
        const isNowPaid = data.status === 'Paid';
        const expenseAmount = parseFloat(data.amount);

        const updateData = {
          category: data.category,
          description: data.description,
          amount: expenseAmount,
          vendor: data.vendor,
          date: data.date,
          status: data.status || selectedExpense.status,
          paidAmount: isNowPaid ? expenseAmount : (selectedExpense.paidAmount || 0),
        };

        await api.expenses.update(selectedExpense.id, updateData);

        // If status changed from non-Paid to Paid, create a transaction
        if (!wasPaid && isNowPaid) {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          try {
            await addTransaction({
              type: 'Expense',
              category: data.category,
              description: data.description,
              amount: -expenseAmount, // Negative for expenses
              date: data.date,
              time: timeString,
              status: 'Completed',
              expenseId: selectedExpense.id,
              referenceId: `expense-${selectedExpense.id}`,
            }, role || 'admin');
          } catch (error) {
            console.error('Error creating transaction for expense:', error);
          }
        }

        // Reload expenses
        const expensesData = await api.expenses.getAll() as any;
        if (Array.isArray(expensesData)) {
          setExpenses(expensesData);
        } else if (expensesData?.data && Array.isArray(expensesData.data)) {
          setExpenses(expensesData.data);
        }

        alert(`Expense updated successfully`);
        setIsEditModalOpen(false);
        setSelectedExpense(null);
      } catch (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense. Please try again.');
      }
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async () => {
    if (selectedExpense) {
      try {
        await api.expenses.delete(selectedExpense.id);
        
        // Reload expenses
        const expensesData = await api.expenses.getAll() as any;
        if (Array.isArray(expensesData)) {
          setExpenses(expensesData);
        } else if (expensesData?.data && Array.isArray(expensesData.data)) {
          setExpenses(expensesData.data);
        }
        
        alert(`Expense deleted successfully`);
        setIsDeleteModalOpen(false);
        setSelectedExpense(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  // Handle View button click
  const handleViewClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  // Handle Edit button click
  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  // Handle Delete button click
  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  // Handle Pay button click
  const handlePayClick = (expense: Expense) => {
    setSelectedExpense(expense);
    const remainingAmount = expense.amount - (expense.paidAmount || 0);
    setPaymentFormData({
      amount: remainingAmount > 0 ? remainingAmount.toString() : '',
      paymentMethod: '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setPaymentErrors({});
    setIsPaymentModalOpen(true);
  };

  // Handle payment form submission
  const handlePaymentSubmit = async () => {
    if (!selectedExpense) return;

    // Validate form
    const errors: Record<string, string> = {};
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      errors.amount = 'Please enter a valid payment amount';
    } else {
      const paymentAmount = parseFloat(paymentFormData.amount);
      const currentPaidAmount = selectedExpense.paidAmount || 0;
      const totalAfterPayment = currentPaidAmount + paymentAmount;
      if (totalAfterPayment > selectedExpense.amount) {
        errors.amount = `Payment amount cannot exceed remaining amount of ${formatCurrency(selectedExpense.amount - currentPaidAmount)}`;
      }
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

    try {
      const paymentAmount = parseFloat(paymentFormData.amount);
      const currentPaidAmount = selectedExpense.paidAmount || 0;
      const newPaidAmount = currentPaidAmount + paymentAmount;
      const newStatus = newPaidAmount >= selectedExpense.amount ? 'Paid' : 'Partial Paid';

      // Create a separate transaction entry for this payment
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      try {
        await addTransaction({
          type: 'Expense',
          category: selectedExpense.category,
          description: `${selectedExpense.description} - Payment ${paymentAmount > 0 ? `(${formatCurrency(paymentAmount)})` : ''}`,
          amount: -paymentAmount, // Negative for expenses
          date: paymentFormData.paymentDate,
          time: timeString,
          status: 'Completed',
          paymentMethod: paymentFormData.paymentMethod,
          expenseId: selectedExpense.id, // Link transaction to expense ID
          referenceId: `expense-${selectedExpense.id}`, // Legacy field for backward compatibility
        }, role || 'admin');
      } catch (error) {
        console.error('Error creating transaction for payment:', error);
      }

      // Update expense with payment
      await api.expenses.update(selectedExpense.id, {
        paidAmount: newPaidAmount,
        status: newStatus,
        date: paymentFormData.paymentDate,
      });

      // Reload expenses
      const expensesData = await api.expenses.getAll() as any;
      if (Array.isArray(expensesData)) {
        setExpenses(expensesData);
      } else if (expensesData?.data && Array.isArray(expensesData.data)) {
        setExpenses(expensesData.data);
      }

      const statusMessage = newPaidAmount >= selectedExpense.amount
        ? `Full payment of ${formatCurrency(paymentAmount)} processed successfully for ${selectedExpense.description}. Status: Paid`
        : `Partial payment of ${formatCurrency(paymentAmount)} processed successfully for ${selectedExpense.description}. Total paid: ${formatCurrency(newPaidAmount)} / ${formatCurrency(selectedExpense.amount)}. Status: Partial Paid`;

      alert(statusMessage);

      // Reset form and close modal
      setPaymentFormData({
        amount: '',
        paymentMethod: '',
        paymentDate: new Date().toISOString().split('T')[0],
      });
      setPaymentErrors({});
      setIsPaymentModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Expenses</h1>
        <button 
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <FileText size={18} />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <Card
          variant="stat"
          icon={<TrendingDown size={24} />}
          value={formatCurrency(totalExpenses)}
          label="Total Expenses"
          color="#e74c3c"
        />
        <Card
          variant="stat"
          icon={<DollarSign size={24} />}
          value={formatCurrency(paidExpenses)}
          label="Paid"
          color="#27ae60"
        />
        <Card
          variant="stat"
          icon={<Clock size={24} />}
          value={formatCurrency(pendingExpenses)}
          label="Pending"
          color="#f39c12"
        />
        <Card
          variant="stat"
          icon={<Calendar size={24} />}
          value={formatCurrency(thisMonthExpenses)}
          label="This Month"
          color="#3498db"
        />
      </div>

      {/* Charts */}
      <div className="section-title">Expense Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="amount" fill="#667eea" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="expenses" stroke="#e74c3c" name="Expenses" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="section-title">Expense Records</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expensesWithStatus.slice(0, 10).map((expense) => {
              const paidAmount = expense.paidAmount || 0;
              const remainingAmount = expense.amount - paidAmount;
              const isFullyPaid = expense.status === 'Paid';

              return (
                <tr key={expense.id}>
                  <td>
                    <Badge variant="info" size="sm">{expense.category}</Badge>
                  </td>
                  <td>{expense.description}</td>
                  <td>
                    <strong>{formatCurrency(expense.amount)}</strong>
                    {paidAmount > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                        Paid: {formatCurrency(paidAmount)}
                        {remainingAmount > 0 && (
                          <span style={{ color: '#ef4444' }}> | Remaining: {formatCurrency(remainingAmount)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{expense.vendor}</td>
                  <td>{expense.date}</td>
                  <td>
                    <Badge variant={getStatusVariant(expense.status)} size="sm">
                      {expense.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ViewButton size="sm" onClick={() => handleViewClick(expense)} />
                      <EditButton size="sm" onClick={() => handleEditClick(expense)} />
                      {!isFullyPaid && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayClick(expense)}
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
                      <DeleteButton size="sm" onClick={() => handleDeleteClick(expense)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      <CreateFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
        fields={addExpenseFormFields}
        onSubmit={handleAddExpense}
        submitButtonText="Add Expense"
        submitButtonIcon={<FileText size={16} />}
        size="lg"
      />

      {/* View Expense Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Expense Details"
        size="lg"
      >
        {selectedExpense && (
          <ViewForm
            sections={[
              {
                title: 'Expense Information',
                icon: DollarSign,
                fields: [
                  {
                    label: 'Category',
                    value: selectedExpense.category,
                    badge: { variant: 'info', text: selectedExpense.category },
                  },
                  {
                    label: 'Description',
                    value: selectedExpense.description,
                    icon: FileText,
                    spanFull: true,
                  },
                  {
                    label: 'Amount',
                    value: formatCurrency(selectedExpense.amount),
                    icon: DollarSign,
                  },
                  {
                    label: 'Vendor',
                    value: selectedExpense.vendor,
                    icon: Building2,
                  },
                  {
                    label: 'Date',
                    value: selectedExpense.date,
                    icon: Calendar,
                  },
                  {
                    label: 'Amount Paid',
                    value: formatCurrency(selectedExpense.paidAmount || 0),
                    icon: DollarSign,
                  },
                  {
                    label: 'Remaining Amount',
                    value: formatCurrency(selectedExpense.amount - (selectedExpense.paidAmount || 0)),
                    badge: {
                      variant: (selectedExpense.amount - (selectedExpense.paidAmount || 0)) > 0 ? 'rejected' : 'success',
                      text: formatCurrency(selectedExpense.amount - (selectedExpense.paidAmount || 0)),
                    },
                  },
                  {
                    label: 'Status',
                    value: selectedExpense.status,
                    badge: { variant: getStatusVariant(selectedExpense.status) as any, text: selectedExpense.status },
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Expense Modal */}
      <CreateFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        title={selectedExpense ? `Edit Expense - ${selectedExpense.description}` : 'Edit Expense'}
        fields={editExpenseFormFields}
        onSubmit={handleEditExpense}
        submitButtonText="Update Expense"
        submitButtonIcon={<FileText size={16} />}
        initialData={getEditInitialData()}
        size="lg"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Delete Expense"
        size="md"
      >
        {selectedExpense && (
          <div>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#666' }}>
              Are you sure you want to delete this expense?
            </p>
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Expense Details:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div><strong>Category:</strong> {selectedExpense.category}</div>
                <div><strong>Description:</strong> {selectedExpense.description}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</div>
                <div><strong>Vendor:</strong> {selectedExpense.vendor}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedExpense(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Delete Expense
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedExpense(null);
          setPaymentFormData({
            amount: '',
            paymentMethod: '',
            paymentDate: new Date().toISOString().split('T')[0],
          });
          setPaymentErrors({});
        }}
        title={selectedExpense ? `Pay Expense - ${selectedExpense.description}` : 'Process Payment'}
        size="lg"
      >
        {selectedExpense && (
          <>
            {/* Expense Information Display */}
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Expense Information:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div><strong>Category:</strong> {selectedExpense.category}</div>
                <div><strong>Description:</strong> {selectedExpense.description}</div>
                <div><strong>Total Amount:</strong> {formatCurrency(selectedExpense.amount)}</div>
                <div><strong>Already Paid:</strong> {formatCurrency(selectedExpense.paidAmount || 0)}</div>
                <div style={{ color: selectedExpense.amount - (selectedExpense.paidAmount || 0) > 0 ? '#ef4444' : '#10b981', marginTop: '0.25rem' }}>
                  <strong>Remaining:</strong> {formatCurrency(selectedExpense.amount - (selectedExpense.paidAmount || 0))}
                </div>
                <div><strong>Vendor:</strong> {selectedExpense.vendor}</div>
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
                  <option value="Credit Card">Credit Card</option>
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
                    setSelectedExpense(null);
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
    </div>
  );
};

export default Expenses;

