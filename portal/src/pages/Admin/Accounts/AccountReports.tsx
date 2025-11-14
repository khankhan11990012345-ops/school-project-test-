import { useState, useMemo, useEffect } from 'react';
import { FileText, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import Card from '../../../components/Card/Card';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Accounts.css';

const AccountReports = () => {
  const [feeCollections, setFeeCollections] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Load fee collections
    const loadFeeCollections = async () => {
      try {
        const response = await api.fees.collections.getAll() as any;
        if (Array.isArray(response)) {
          setFeeCollections(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setFeeCollections(response.data);
        } else if (response?.feeCollections && Array.isArray(response.feeCollections)) {
          setFeeCollections(response.feeCollections);
        } else {
          setFeeCollections([]);
        }
      } catch (error) {
        console.error('Error loading fee collections:', error);
        setFeeCollections([]);
      }
    };

    // Load expenses
    const loadExpenses = async () => {
      try {
        const response = await api.expenses.getAll() as any;
        if (Array.isArray(response)) {
          setExpenses(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setExpenses(response.data);
        } else {
          setExpenses([]);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
        setExpenses([]);
      }
    };

    // Load transactions
    const loadTransactions = async () => {
      try {
        const response = await api.transactions.getAll() as any;
        if (Array.isArray(response)) {
          setTransactions(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setTransactions(response.data);
        } else if (response?.transactions && Array.isArray(response.transactions)) {
          setTransactions(response.transactions);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      }
    };

    loadFeeCollections();
    loadExpenses();
    loadTransactions();

    // Refresh interval
    const interval = setInterval(() => {
      loadFeeCollections();
      loadExpenses();
      loadTransactions();
    }, 30000);

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

  // Calculate financial stats from actual data
  const financialStats = useMemo(() => {
    // Calculate total revenue from fee collections (paid fees)
    const totalRevenue = feeCollections
      .filter(fee => fee.status?.toLowerCase() === 'paid' || fee.paymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);

    // Add positive transactions (income)
    const incomeTransactions = transactions
      .filter(t => t.type === 'Income' && (t.amount > 0))
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const totalRevenueWithIncome = totalRevenue + incomeTransactions;

    // Calculate total expenses
    const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Calculate net profit
    const netProfit = totalRevenueWithIncome - totalExpensesAmount;

    // Calculate profit margin
    const profitMargin = totalRevenueWithIncome > 0 
      ? ((netProfit / totalRevenueWithIncome) * 100).toFixed(1)
      : '0.0';

    return {
      totalRevenue: totalRevenueWithIncome,
      totalExpenses: totalExpensesAmount,
      netProfit,
      profitMargin: `${profitMargin}%`,
    };
  }, [feeCollections, expenses, transactions]);

  const financialSummary = [
    {
      month: 'January',
      revenue: 45000,
      expenses: 35000,
      profit: 10000,
    },
    {
      month: 'February',
      revenue: 48000,
      expenses: 38000,
      profit: 10000,
    },
    {
      month: 'March',
      revenue: 50000,
      expenses: 42000,
      profit: 8000,
    },
    {
      month: 'April',
      revenue: 52000,
      expenses: 40000,
      profit: 12000,
    },
    {
      month: 'May',
      revenue: 51000,
      expenses: 41000,
      profit: 10000,
    },
    {
      month: 'June',
      revenue: 53000,
      expenses: 43000,
      profit: 10000,
    },
  ];

  const categoryBreakdown = [
    { category: 'Fees Collection', amount: 250000, percentage: 85 },
    { category: 'Other Income', amount: 45000, percentage: 15 },
  ];

  const expenseBreakdown = [
    { category: 'Salaries', amount: 150000, percentage: 60 },
    { category: 'Utilities', amount: 30000, percentage: 12 },
    { category: 'Supplies', amount: 25000, percentage: 10 },
    { category: 'Maintenance', amount: 20000, percentage: 8 },
    { category: 'Other', amount: 25000, percentage: 10 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Account Reports</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate Report
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
          icon={<DollarSign size={24} />}
          value={formatCurrency(financialStats.totalRevenue)}
          label="Total Revenue"
          color="#27ae60"
        />
        <Card
          variant="stat"
          icon={<TrendingDown size={24} />}
          value={formatCurrency(financialStats.totalExpenses)}
          label="Total Expenses"
          color="#e74c3c"
        />
        <Card
          variant="stat"
          icon={<TrendingUp size={24} />}
          value={formatCurrency(financialStats.netProfit)}
          label="Net Profit"
          color={financialStats.netProfit >= 0 ? "#667eea" : "#e74c3c"}
        />
        <Card
          variant="stat"
          icon={<BarChart3 size={24} />}
          value={financialStats.profitMargin}
          label="Profit Margin"
          color={parseFloat(financialStats.profitMargin) >= 0 ? "#9b59b6" : "#e74c3c"}
        />
      </div>

      {/* Charts */}
      <div className="section-title">Financial Reports</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Revenue vs Expenses (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={financialSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#27ae60" fill="#27ae60" fillOpacity={0.6} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.6} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#667eea" name="Profit" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="amount" fill="#27ae60" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="amount" fill="#e74c3c" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="reports-tables">
        <div className="table-container">
          <h3>Revenue Summary</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h3>Expense Summary</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {expenseBreakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReports;

