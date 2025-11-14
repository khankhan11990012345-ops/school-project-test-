import { Award, TrendingUp, Users, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Exams.css';

const ExamResults = () => {
  const results = [
    {
      id: 1,
      examName: 'Mid-Term Exam - Mathematics',
      class: 'Grade 10A',
      totalStudents: 25,
      passed: 22,
      failed: 3,
      averageScore: 78.5,
      highestScore: 95,
      lowestScore: 42,
    },
    {
      id: 2,
      examName: 'Final Exam - English',
      class: 'Grade 9B',
      totalStudents: 28,
      passed: 26,
      failed: 2,
      averageScore: 82.3,
      highestScore: 98,
      lowestScore: 55,
    },
    {
      id: 3,
      examName: 'Quiz Test - Science',
      class: 'Grade 11A',
      totalStudents: 22,
      passed: 20,
      failed: 2,
      averageScore: 85.7,
      highestScore: 100,
      lowestScore: 60,
    },
  ];

  const studentResults = [
    {
      id: 1,
      name: 'Alice Johnson',
      exam: 'Mid-Term Exam - Mathematics',
      score: 88,
      totalMarks: 100,
      percentage: 88,
      grade: 'A',
      status: 'Passed',
    },
    {
      id: 2,
      name: 'Bob Williams',
      exam: 'Final Exam - English',
      score: 75,
      totalMarks: 100,
      percentage: 75,
      grade: 'B',
      status: 'Passed',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      exam: 'Quiz Test - Science',
      score: 92,
      totalMarks: 100,
      percentage: 92,
      grade: 'A+',
      status: 'Passed',
    },
    {
      id: 4,
      name: 'Diana Prince',
      exam: 'Mid-Term Exam - Mathematics',
      score: 65,
      totalMarks: 100,
      percentage: 65,
      grade: 'C',
      status: 'Passed',
    },
    {
      id: 5,
      name: 'Edward Lee',
      exam: 'Final Exam - English',
      score: 45,
      totalMarks: 100,
      percentage: 45,
      grade: 'F',
      status: 'Failed',
    },
  ];

  const performanceData = results.map(r => ({
    name: r.examName.split('-')[1].trim(),
    average: r.averageScore,
    passed: r.passed,
    failed: r.failed,
  }));

  const gradeDistribution = [
    { grade: 'A+', count: 12 },
    { grade: 'A', count: 25 },
    { grade: 'B', count: 18 },
    { grade: 'C', count: 15 },
    { grade: 'F', count: 5 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Exam Results</h1>
        <button className="btn-primary">
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Award size={24} />
          <div>
            <h3>Total Exams</h3>
            <p>15</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Average Score</h3>
            <p>81.8%</p>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} />
          <div>
            <h3>Total Students</h3>
            <p>150</p>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} />
          <div>
            <h3>Pass Rate</h3>
            <p>92.5%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-title">Results Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Exam Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#667eea" name="Avg Score %" />
              <Bar dataKey="passed" fill="#27ae60" name="Passed" />
              <Bar dataKey="failed" fill="#e74c3c" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#764ba2" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exam Results Summary */}
      <div className="section-title">Exam Results Summary</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Class</th>
              <th>Total Students</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Average Score</th>
              <th>Highest Score</th>
              <th>Lowest Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>
                  <strong>{result.examName}</strong>
                </td>
                <td>{result.class}</td>
                <td>{result.totalStudents}</td>
                <td>
                  <Badge variant="passed" size="sm">{result.passed}</Badge>
                </td>
                <td>
                  <Badge variant="failed" size="sm">{result.failed}</Badge>
                </td>
                <td>{result.averageScore}%</td>
                <td>{result.highestScore}</td>
                <td>{result.lowestScore}</td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View Details', result.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Results */}
      <div className="section-title">Individual Student Results</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Total Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentResults.map((result) => (
              <tr key={result.id}>
                <td>
                  <strong>{result.name}</strong>
                </td>
                <td>{result.exam}</td>
                <td>{result.score}</td>
                <td>{result.totalMarks}</td>
                <td>{result.percentage}%</td>
                <td>
                  <Badge 
                    variant={result.grade === 'A+' || result.grade === 'A' ? 'excellent' : result.grade === 'B' ? 'good' : result.grade === 'C' ? 'average' : 'poor'} 
                    size="sm"
                  >
                    {result.grade}
                  </Badge>
                </td>
                <td>
                  <Badge variant={result.status.toLowerCase() === 'passed' ? 'success' : 'danger'} size="sm">
                    {result.status}
                  </Badge>
                </td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View', result.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamResults;

