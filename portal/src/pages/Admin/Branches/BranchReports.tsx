import { FileText, Building2, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';
import './Branches.css';

const BranchReports = () => {
  const branchStats = [
    { branch: 'Main Campus', students: 450, teachers: 35, revenue: 150000 },
    { branch: 'North Branch', students: 320, teachers: 25, revenue: 110000 },
    { branch: 'South Branch', students: 280, teachers: 22, revenue: 95000 },
    { branch: 'East Branch', students: 195, teachers: 18, revenue: 65000 },
  ];

  const studentDistribution = [
    { name: 'Main Campus', value: 450, color: '#667eea' },
    { name: 'North Branch', value: 320, color: '#764ba2' },
    { name: 'South Branch', value: 280, color: '#f093fb' },
    { name: 'East Branch', value: 195, color: '#4facfe' },
  ];

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Branch Reports</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <Card
          variant="stat"
          icon={<Building2 size={28} />}
          value="4"
          label="Total Branches"
          color="#667eea"
        />
        <Card
          variant="stat"
          icon={<Users size={28} />}
          value="1,245"
          label="Total Students"
          color="#48bb78"
        />
        <Card
          variant="stat"
          icon={<Users size={28} />}
          value="100"
          label="Total Teachers"
          color="#ed8936"
        />
        <Card
          variant="stat"
          icon={<TrendingUp size={28} />}
          value={formatCurrency(420000)}
          label="Total Revenue"
          color="#9f7aea"
        />
      </div>

      {/* Charts */}
      <div className="section-title">Branch Analytics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <Card variant="custom">
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>Student Distribution by Branch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {studentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card variant="custom">
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>Branch Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#667eea" name="Students" />
              <Bar dataKey="teachers" fill="#27ae60" name="Teachers" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Branch Stats Table */}
      <div className="section-title">Branch Statistics</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Students</th>
              <th>Teachers</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branchStats.map((branch, index) => (
              <tr key={index}>
                <td>
                  <strong>{branch.branch}</strong>
                </td>
                <td>{branch.students}</td>
                <td>{branch.teachers}</td>
                <td>{formatCurrency(branch.revenue)}</td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View Report', (branch as any).id || index)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchReports;

