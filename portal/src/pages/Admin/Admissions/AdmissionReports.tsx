import { FileText, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ViewButton, PrintButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Admissions.css';

const AdmissionReports = () => {
  const reports = [
    {
      id: 1,
      reportName: 'Monthly Admission Report',
      period: 'March 2024',
      totalApplications: 18,
      approved: 15,
      rejected: 3,
      generatedDate: '2024-03-31',
    },
    {
      id: 2,
      reportName: 'Quarterly Admission Summary',
      period: 'Q1 2024',
      totalApplications: 55,
      approved: 47,
      rejected: 8,
      generatedDate: '2024-03-31',
    },
    {
      id: 3,
      reportName: 'Class-wise Admission Report',
      period: 'March 2024',
      totalApplications: 18,
      approved: 15,
      rejected: 3,
      generatedDate: '2024-03-30',
    },
  ];

  const classWiseData = [
    { class: 'Grade 9', applications: 12, approved: 10 },
    { class: 'Grade 10', applications: 15, approved: 13 },
    { class: 'Grade 11', applications: 10, approved: 9 },
    { class: 'Grade 12', applications: 8, approved: 7 },
  ];

  const monthlyTrend = [
    { month: 'Jan', applications: 12, approved: 10 },
    { month: 'Feb', applications: 15, approved: 12 },
    { month: 'Mar', applications: 18, approved: 15 },
    { month: 'Apr', applications: 20, approved: 17 },
    { month: 'May', applications: 22, approved: 19 },
    { month: 'Jun', applications: 25, approved: 22 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admission Reports</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate New Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>Total Reports</h3>
            <p>45</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Total Applications</h3>
            <p>112</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <h3>Approval Rate</h3>
            <p>83.9%</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 size={24} />
          <div>
            <h3>This Month</h3>
            <p>18</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Admission Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Class-wise Applications</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#667eea" name="Applications" />
              <Bar dataKey="approved" fill="#27ae60" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Admission Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#667eea" name="Applications" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#27ae60" name="Approved" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table */}
      <div className="section-title">Generated Reports</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Period</th>
              <th>Total Applications</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Generated Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <strong>{report.reportName}</strong>
                </td>
                <td>{report.period}</td>
                <td>{report.totalApplications}</td>
                <td>
                  <Badge variant="passed" size="sm">{report.approved}</Badge>
                </td>
                <td>
                  <Badge variant="failed" size="sm">{report.rejected}</Badge>
                </td>
                <td>{report.generatedDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ViewButton size="sm" onClick={() => console.log('View', report.id)} />
                    <PrintButton size="sm" onClick={() => console.log('Download', report.id)} />
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

export default AdmissionReports;

