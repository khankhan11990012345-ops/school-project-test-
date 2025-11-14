import { DollarSign, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ViewButton, EditButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Students.css';

const StudentFees = () => {
  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const students = [
    {
      id: 1,
      name: 'Alice Johnson',
      class: 'Grade 10A',
      totalFees: 5000,
      paid: 4500,
      pending: 500,
      status: 'Partial',
      dueDate: '2024-04-15',
    },
    {
      id: 2,
      name: 'Bob Williams',
      class: 'Grade 9B',
      totalFees: 5000,
      paid: 5000,
      pending: 0,
      status: 'Paid',
      dueDate: '2024-04-15',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      class: 'Grade 11A',
      totalFees: 5500,
      paid: 3000,
      pending: 2500,
      status: 'Pending',
      dueDate: '2024-04-10',
    },
    {
      id: 4,
      name: 'Diana Prince',
      class: 'Grade 10B',
      totalFees: 5000,
      paid: 5000,
      pending: 0,
      status: 'Paid',
      dueDate: '2024-04-15',
    },
    {
      id: 5,
      name: 'Edward Lee',
      class: 'Grade 12A',
      totalFees: 6000,
      paid: 4000,
      pending: 2000,
      status: 'Partial',
      dueDate: '2024-04-05',
    },
  ];

  const feeStats = {
    totalFees: 26500,
    collected: 21500,
    pending: 5000,
    overdue: 1200,
  };

  const feeStatusData = [
    { name: 'Paid', value: 45, color: '#27ae60' },
    { name: 'Partial', value: 30, color: '#f39c12' },
    { name: 'Pending', value: 20, color: '#e74c3c' },
    { name: 'Overdue', value: 5, color: '#c0392b' },
  ];

  const monthlyCollection = [
    { month: 'Jan', collected: 18000, pending: 5000 },
    { month: 'Feb', collected: 20000, pending: 4500 },
    { month: 'Mar', collected: 22000, pending: 4000 },
    { month: 'Apr', collected: 21500, pending: 5000 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Fees</h1>
        <button className="btn-primary">
          <CreditCard size={18} />
          Collect Fee
        </button>
      </div>

      {/* Fee Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <DollarSign size={24} />
          <div>
            <h3>Total Fees</h3>
            <p>{formatCurrency(feeStats.totalFees)}</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <h3>Collected</h3>
            <p>{formatCurrency(feeStats.collected)}</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <h3>Pending</h3>
            <p>{formatCurrency(feeStats.pending)}</p>
          </div>
        </div>
        <div className="stat-card">
          <CreditCard size={24} />
          <div>
            <h3>Overdue</h3>
            <p>{formatCurrency(feeStats.overdue)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Fee Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Fee Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={feeStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {feeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Fee Collection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyCollection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="collected" fill="#27ae60" name="Collected" />
              <Bar dataKey="pending" fill="#e74c3c" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Fees Table */}
      <div className="section-title">Student Fee Details</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Total Fees</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <strong>{student.name}</strong>
                </td>
                <td>{student.class}</td>
                <td>{formatCurrency(student.totalFees)}</td>
                <td>{formatCurrency(student.paid)}</td>
                <td>{formatCurrency(student.pending)}</td>
                <td>
                  <Badge 
                    variant={student.status.toLowerCase() === 'paid' ? 'paid' : student.status.toLowerCase() === 'partial' ? 'partial' : 'pending'} 
                    size="sm"
                  >
                    {student.status}
                  </Badge>
                </td>
                <td>{student.dueDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <EditButton size="sm" onClick={() => console.log('Pay', student.id)} />
                    <ViewButton size="sm" onClick={() => console.log('View', student.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFees;

