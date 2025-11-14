import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Filter, Calendar, Clock, DollarSign } from 'lucide-react';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import { Table } from '../../../components/Table';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import Card from '../../../components/Card/Card';
import { UserRole } from '../../../types';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Accounts.css';

interface Transaction {
  id?: number | string; // MongoDB _id (for backward compatibility)
  _id?: string; // MongoDB _id
  transactionId?: string; // Custom transaction ID (TXN000001, etc.)
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  paymentMethod?: string;
  expenseId?: number | string | any; // ID of the expense this transaction is for (if type is Expense)
  feeId?: number | string | any; // ID of the fee collection this transaction is for (if type is Income from fees)
  payrollId?: number | string | any; // ID of the payroll this transaction is for (if type is Expense from payroll)
  referenceId?: string; // Legacy field for backward compatibility
  createdBy?: string; // Role of the user who created this transaction (admin, accountant, etc.)
}

// Helper function to add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>, createdByRole?: string): Promise<Transaction | null> => {
  try {
    const transactionData = {
      ...transaction,
      createdBy: createdByRole || 'admin', // Default to 'admin' if not provided
    };
    const response = await api.transactions.create(transactionData) as any;
    return response?.data?.transaction || response?.data || response;
  } catch (error: any) {
    // Transaction creation is optional - don't throw error, just log it
    console.warn('Transaction creation failed (optional feature):', error?.message || error);
    // Return null to indicate transaction was not created, but don't block the calling code
    return null;
  }
};

const Transactions = () => {
  useParams<{ role: UserRole }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    // Load transactions from API
    const loadTransactions = async () => {
      try {
        const response = await api.transactions.getAll() as any;
        // Extract transactions from response structure
        if (response?.data?.transactions && Array.isArray(response.data.transactions)) {
          setTransactions(response.data.transactions);
        } else if (Array.isArray(response)) {
          setTransactions(response);
        } else {
          console.error('api.transactions.getAll did not return an array:', response);
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      }
    };
    
    loadTransactions();

    // Refresh interval (since we can't use storage events for API)
    const interval = setInterval(() => {
      loadTransactions();
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

  // Calculate stats from transactions
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'Income' && t.status === 'Completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense' && t.status === 'Completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const now = new Date();
    const thisMonthIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'Income' && 
               t.status === 'Completed' &&
               transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalIncome, totalExpenses, thisMonthIncome, pendingAmount };
  }, [transactions]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn-primary">
          <Filter size={18} />
          Filter Transactions
        </button>
      </div>

      {/* Transaction Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <Card
          variant="stat"
          icon={<ArrowUpRight size={24} />}
          value={formatCurrency(stats.totalIncome)}
          label="Total Income"
          color="#22c55e"
        />
        <Card
          variant="stat"
          icon={<ArrowDownRight size={24} />}
          value={formatCurrency(stats.totalExpenses)}
          label="Total Expenses"
          color="#ef4444"
        />
        <Card
          variant="stat"
          icon={<ArrowUpRight size={24} />}
          value={formatCurrency(stats.thisMonthIncome)}
          label="This Month"
          color="#667eea"
        />
        <Card
          variant="stat"
          icon={<ArrowDownRight size={24} />}
          value={formatCurrency(stats.pendingAmount)}
          label="Pending"
          color="#f59e0b"
        />
      </div>

      {/* Transactions Table */}
      <div className="section-title">All Transactions</div>
      <Table
        columns={[
          {
            key: 'transactionId',
            header: 'Transaction ID',
            render: (_value, row) => (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>
                  {row.transactionId || row.id || row._id || 'N/A'}
                </div>
                {row.expenseId && (
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                    Expense: {typeof row.expenseId === 'object' && row.expenseId?.expenseId 
                      ? `#${row.expenseId.expenseId}` 
                      : `#${row.expenseId}`}
                  </div>
                )}
                {row.feeId && (
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                    {typeof row.feeId === 'object' && row.feeId?.studentId?.studentId 
                      ? `Student: ${row.feeId.studentId.studentId}` 
                      : typeof row.feeId === 'object' && row.feeId?.receiptNumber
                      ? `Receipt: ${row.feeId.receiptNumber}`
                      : typeof row.feeId === 'object' && row.feeId?._id
                      ? `Fee: ${row.feeId._id}`
                      : `Fee: ${row.feeId}`}
                  </div>
                )}
                {row.payrollId && (
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                    Payroll: {typeof row.payrollId === 'object' && row.payrollId?.payrollId 
                      ? `#${row.payrollId.payrollId}` 
                      : typeof row.payrollId === 'object' && row.payrollId?.employeeId?.teacherId
                      ? `Teacher: ${row.payrollId.employeeId.teacherId}`
                      : `#${row.payrollId}`}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'date',
            header: 'Date & Time',
            render: (_value, row) => (
              <div>
                <div>{row.date}</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>{row.time}</div>
              </div>
            ),
          },
          {
            key: 'type',
            header: 'Type',
            render: (_value, row) => (
              <Badge variant={row.type === 'Income' ? 'success' : 'danger'} size="sm">
                {row.type === 'Income' ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {row.type}
              </Badge>
            ),
          },
          { key: 'category', header: 'Category' },
          {
            key: 'description',
            header: 'Description',
            render: (_value, row) => (
              <div>
                <div>{row.description}</div>
                {row.paymentMethod && (
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                    Payment Method: {row.paymentMethod}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Amount',
            render: (_value, row) => (
              <span style={{ color: row.type === 'Income' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {row.type === 'Income' ? '+' : ''}
                {formatCurrency(Math.abs(row.amount))}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (_value, row) => (
              <Badge variant={row.status.toLowerCase() === 'completed' ? 'success' : row.status.toLowerCase() === 'pending' ? 'pending' : 'danger'} size="sm">
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'createdBy',
            header: 'Created By',
            render: (_value, row) => (
              <Badge 
                variant={row.createdBy === 'admin' ? 'info' : row.createdBy === 'accountant' ? 'success' : 'warning'} 
                size="sm"
              >
                {row.createdBy ? row.createdBy.charAt(0).toUpperCase() + row.createdBy.slice(1) : 'Admin'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (_value, row) => (
              <ViewButton size="sm" onClick={() => {
                setSelectedTransaction(row);
                setIsViewModalOpen(true);
              }} />
            ),
          },
        ]}
        data={transactions}
        emptyMessage="No transactions found"
      />

      {/* View Transaction Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTransaction(null);
        }}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <ViewForm
            sections={[
              {
                title: 'Transaction Information',
                icon: DollarSign,
                fields: [
                  { 
                    label: 'Transaction ID', 
                    value: selectedTransaction.transactionId || selectedTransaction.id || selectedTransaction._id || 'N/A'
                  },
                  { 
                    label: 'Type', 
                    value: selectedTransaction.type,
                    renderAsBadge: { 
                      variant: selectedTransaction.type === 'Income' ? 'success' : 'rejected', 
                      size: 'sm' 
                    }
                  },
                  { label: 'Category', value: selectedTransaction.category },
                  { label: 'Description', value: selectedTransaction.description, spanFull: true },
                  { 
                    label: 'Amount', 
                    value: formatCurrency(Math.abs(selectedTransaction.amount)),
                    icon: DollarSign
                  },
                  { label: 'Date', value: selectedTransaction.date, icon: Calendar },
                  { label: 'Time', value: selectedTransaction.time, icon: Clock },
                  {
                    label: 'Status',
                    value: selectedTransaction.status,
                    renderAsBadge: { 
                      variant: selectedTransaction.status === 'Completed' ? 'success' : 'pending', 
                      size: 'sm' 
                    },
                  },
                  ...(selectedTransaction.paymentMethod ? [{ label: 'Payment Method', value: selectedTransaction.paymentMethod }] : []),
                  ...(selectedTransaction.referenceId ? [{ label: 'Reference ID', value: selectedTransaction.referenceId }] : []),
                  ...(selectedTransaction.createdBy ? [{ 
                    label: 'Created By', 
                    value: selectedTransaction.createdBy.charAt(0).toUpperCase() + selectedTransaction.createdBy.slice(1)
                  }] : []),
                ],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Transactions;

