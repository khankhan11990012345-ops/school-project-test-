import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CSSProperties } from 'react';
import { Card } from '../../components/Card';
import '../../styles/universal.css';
import './Accountant.css';

const AccountantDashboard = () => {
  // Financial data (same as Admin)
  const financialData = {
    monthlyRevenue: 45000,
    totalFees: 380000,
    expenses: 35000,
    profit: 10000,
  };

  // Monthly financial trend data
  const monthlyTrendData = [
    { month: 'Jan', Revenue: 40000, Expenses: 30000, Profit: 10000 },
    { month: 'Feb', Revenue: 42000, Expenses: 32000, Profit: 10000 },
    { month: 'Mar', Revenue: 45000, Expenses: 35000, Profit: 10000 },
    { month: 'Apr', Revenue: 48000, Expenses: 33000, Profit: 15000 },
    { month: 'May', Revenue: 50000, Expenses: 34000, Profit: 16000 },
    { month: 'Jun', Revenue: 52000, Expenses: 36000, Profit: 16000 },
  ];

  // Revenue by category
  const revenueCategoryData = [
    { name: 'Fee Collection', value: 280000, color: '#667eea' },
    { name: 'Other Income', value: 100000, color: '#764ba2' },
  ];

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const sectionTitleStyle: CSSProperties = {
    margin: '2.5rem 0 1.5rem 0',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e0e0e0',
  };

  const chartsContainerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  };

  const chartCardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  };

  const chartTitleStyle: CSSProperties = {
    margin: '0 0 1.5rem 0',
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: 600,
  };

  return (
    <>
      <style>{`
        .chart-card:hover {
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
          background: rgba(255, 255, 255, 0.85);
        }
        @media (max-width: 768px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="page-container">
        <div className="page-header">
          <h1>Accountant Dashboard</h1>
        </div>

        {/* Financial Cards (same as Admin) */}
        <div style={sectionTitleStyle}>Financial Overview</div>
        <div className="dashboard-grid">
          <Card
            variant="stat"
            icon={<DollarSign size={28} />}
            value={formatCurrency(financialData.monthlyRevenue)}
            label="Monthly Revenue"
            color="#667eea"
            trend="+12% from last month"
            trendType="positive"
          />
          <Card
            variant="stat"
            icon={<Wallet size={28} />}
            value={formatCurrency(financialData.totalFees)}
            label="Total Fees"
            color="#48bb78"
            trend="+8% from last year"
            trendType="positive"
          />
          <Card
            variant="stat"
            icon={<TrendingUp size={28} />}
            value={formatCurrency(financialData.expenses)}
            label="Monthly Expenses"
            color="#e53e3e"
            trend="-5% from last month"
            trendType="negative"
          />
          <Card
            variant="stat"
            icon={<CreditCard size={28} />}
            value={formatCurrency(financialData.profit)}
            label="Net Profit"
            color="#667eea"
            trend="+15% from last month"
            trendType="positive"
          />
        </div>

        {/* Financial Charts */}
        <div style={sectionTitleStyle}>Financial Analytics</div>
        <div style={chartsContainerStyle} className="charts-container">
          <div style={chartCardStyle} className="chart-card">
            <h3 style={chartTitleStyle}>Monthly Financial Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Revenue" fill="#667eea" name="Revenue" />
                <Bar dataKey="Expenses" fill="#e53e3e" name="Expenses" />
                <Bar dataKey="Profit" fill="#48bb78" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={chartCardStyle} className="chart-card">
            <h3 style={chartTitleStyle}>Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountantDashboard;

