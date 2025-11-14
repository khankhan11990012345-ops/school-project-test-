import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, TrendingDown } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Accounts.css';

const TRANSACTIONS_STORAGE_KEY = 'scholyman_transactions';

interface Transaction {
  id: number;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  paymentMethod?: string;
  expenseId?: number;
  feeId?: number;
  payrollId?: number;
}

const getTransactionsFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading transactions from storage:', error);
  }
  return [];
};

const AccountsOverview = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load transactions from storage
    const stored = getTransactionsFromStorage();
    setTransactions(stored);

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = () => {
      setTransactions(getTransactionsFromStorage());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  // Calculate stats from actual transactions
  const totalRevenue = transactions
    .filter(t => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyIncome = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return t.type === 'Income' && 
             t.status === 'Completed' &&
             transactionDate.getMonth() === now.getMonth() &&
             transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense' && t.status === 'Completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Accounts Overview</h1>
      </div>
      <div className="stats-grid">
        <Card
          variant="stat"
          icon={<DollarSign size={24} />}
          value={formatCurrency(totalRevenue)}
          label="Total Revenue"
          color="#27ae60"
        />
        <Card
          variant="stat"
          icon={<TrendingUp size={24} />}
          value={formatCurrency(monthlyIncome)}
          label="Monthly Income"
          color="#3498db"
        />
        <Card
          variant="stat"
          icon={<Clock size={24} />}
          value={formatCurrency(pendingPayments)}
          label="Pending Payments"
          color="#f39c12"
        />
        <Card
          variant="stat"
          icon={<TrendingDown size={24} />}
          value={formatCurrency(totalExpenses)}
          label="Total Expenses"
          color="#e74c3c"
        />
      </div>
      <div className="section-title">Recent Transactions</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Student/Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>#{transaction.id}</td>
                  <td>
                    <Badge variant={transaction.type === 'Income' ? 'success' : 'danger'} size="sm">
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className={transaction.type === 'Expense' ? 'amount-expense' : 'amount-income'}>
                    {transaction.type === 'Income' ? '+' : ''}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td>
                    <div>{transaction.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      {transaction.category}
                    </div>
                  </td>
                  <td>
                    <div>{transaction.date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{transaction.time}</div>
                  </td>
                  <td>
                    <Badge variant={transaction.status.toLowerCase() === 'completed' ? 'success' : transaction.status.toLowerCase() === 'pending' ? 'pending' : 'danger'} size="sm">
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No transactions found. Transactions will appear here as you add expenses, collect fees, or process payroll.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsOverview;
