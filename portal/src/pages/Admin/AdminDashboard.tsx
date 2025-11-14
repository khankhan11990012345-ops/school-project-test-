import { Users, UserCheck, BookOpen, Clock, DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CSSProperties } from 'react';
import { Card } from '../../components/Card';

interface AdminDashboardProps {
  data: {
    stats: {
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      totalSubjects: number;
      pendingAdmissions: number;
      activeExams: number;
      totalUsers: number;
    };
    financial?: {
      monthlyRevenue: number;
      totalFees: number;
      expenses: number;
      profit: number;
    };
    recentFeeCollections?: Array<{
      id: string;
      studentName: string;
      studentId: string;
      amount: number;
      paymentDate: Date;
      paymentMethod: string;
      collectedBy: string;
    }>;
  };
}

const AdminDashboard = ({ data }: AdminDashboardProps) => {
  // Department data for charts
  const departmentData = [
    { name: 'Science', students: 45, teachers: 8 },
    { name: 'Mathematics', students: 38, teachers: 6 },
    { name: 'English', students: 32, teachers: 5 },
    { name: 'History', students: 28, teachers: 4 },
    { name: 'Arts', students: 22, teachers: 3 },
  ];

  const departmentPieData = [
    { name: 'Science', value: 45, color: '#667eea' },
    { name: 'Mathematics', value: 38, color: '#764ba2' },
    { name: 'English', value: 32, color: '#f093fb' },
    { name: 'History', value: 28, color: '#4facfe' },
    { name: 'Arts', value: 22, color: '#27ae60' },
  ];

  // Use financial data from backend, or calculate from collections if not available
  const financialData = data.financial || {
    monthlyRevenue: 0,
    totalFees: 0,
    expenses: 0,
    profit: 0,
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  // Styles
  const dashboardStyle: CSSProperties = {
    width: '100%',
  };

  const titleStyle: CSSProperties = {
    margin: '0 0 2rem 0',
    color: '#333',
    fontSize: '2rem',
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', // Reduced by 25% (280 * 0.75 = 210)
    gap: '1.125rem', // Reduced by 25% (1.5 * 0.75 = 1.125)
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
        .dashboard-card:hover {
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
          background: rgba(255, 255, 255, 0.85);
        }
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
      <div style={dashboardStyle}>
        <h2 style={titleStyle}>Admin Dashboard</h2>
        
        {/* Main Stats Cards */}
        <div style={gridStyle}>
          <Card
            variant="stat"
            icon={<Users size={21} />}
            value={data.stats?.totalStudents || 0}
            label="Total Students"
            color="#667eea"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<UserCheck size={21} />}
            value={data.stats?.totalTeachers || 0}
            label="Total Teachers"
            color="#48bb78"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<BookOpen size={21} />}
            value={data.stats?.totalClasses || 0}
            label="Total Classes"
            color="#ed8936"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<Clock size={21} />}
            value={data.stats?.pendingAdmissions || 0}
            label="Pending Approvals"
            color="#9f7aea"
            fontSize={0.75}
          />
        </div>

        {/* Financial Cards */}
        <div style={sectionTitleStyle}>Financial Overview</div>
        <div style={gridStyle}>
          <Card
            variant="stat"
            icon={<DollarSign size={21} />}
            value={formatCurrency(financialData.monthlyRevenue)}
            label="Monthly Revenue"
            color="#667eea"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<Wallet size={21} />}
            value={formatCurrency(financialData.totalFees)}
            label="Total Fees"
            color="#48bb78"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<TrendingUp size={21} />}
            value={formatCurrency(financialData.expenses)}
            label="Monthly Expenses"
            color="#e53e3e"
            fontSize={0.75}
          />
          <Card
            variant="stat"
            icon={<CreditCard size={21} />}
            value={formatCurrency(financialData.profit)}
            label="Net Profit"
            color="#667eea"
            fontSize={0.75}
          />
        </div>

        {/* Department Charts */}
        <div style={sectionTitleStyle}>Department Statistics</div>
        <div style={chartsContainerStyle} className="charts-container">
          <div style={chartCardStyle} className="chart-card">
            <h3 style={chartTitleStyle}>Students & Teachers by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#667eea" name="Students" />
                <Bar dataKey="teachers" fill="#764ba2" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={chartCardStyle} className="chart-card">
            <h3 style={chartTitleStyle}>Student Distribution by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
