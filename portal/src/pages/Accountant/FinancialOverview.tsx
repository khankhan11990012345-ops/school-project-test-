import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/Card';
import '../../styles/universal.css';
import './Accountant.css';

const FinancialOverview = () => {
  const revenueData = [
    { month: 'Jan', revenue: 12000, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9000 },
    { month: 'Mar', revenue: 18000, expenses: 10000 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Financial Overview</h1>
      </div>
      <div className="dashboard-grid">
        <Card
          variant="stat"
          icon={<DollarSign size={28} />}
          value="Rs 45,000"
          label="Total Revenue"
          color="#48bb78"
        />
        <Card
          variant="stat"
          icon={<TrendingDown size={28} />}
          value="Rs 27,000"
          label="Total Expenses"
          color="#e53e3e"
        />
        <Card
          variant="stat"
          icon={<TrendingUp size={28} />}
          value="Rs 18,000"
          label="Net Profit"
          color="#667eea"
        />
      </div>
      <h3 className="section-title">Revenue vs Expenses</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <Card variant="custom">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#48bb78" name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#e53e3e" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;

