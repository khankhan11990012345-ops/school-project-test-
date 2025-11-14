import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import Card from '../../../components/Card/Card';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Attendance.css';

interface AttendanceRecord {
  _id: string;
  class: string;
  date: string;
  students: Array<{
    studentId: any;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    remarks?: string;
  }>;
  markedBy?: any;
}

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.attendance.getAll() as any;
        const attendance = response.data?.attendance || response.attendance || [];
        setAttendanceData(attendance);
      } catch (err: any) {
        console.error('Error loading attendance:', err);
        setError(err.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    attendanceData.forEach((record) => {
      record.students?.forEach((student) => {
        if (student.status === 'Present') totalPresent++;
        else if (student.status === 'Absent') totalAbsent++;
        else if (student.status === 'Late') totalLate++;
        else if (student.status === 'Excused') totalExcused++;
      });
    });

    const totalStudents = totalPresent + totalAbsent + totalLate + totalExcused;
    const averageAttendance = totalStudents > 0 
      ? ((totalPresent / totalStudents) * 100).toFixed(1)
      : '0.0';
    const totalDays = attendanceData.length;

    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      averageAttendance,
      totalDays,
    };
  }, [attendanceData]);

  // Process attendance records for table
  const attendanceRecords = useMemo(() => {
    return attendanceData
      .map((record) => {
        const total = record.students?.length || 0;
        const present = record.students?.filter((s) => s.status === 'Present').length || 0;
        const absent = record.students?.filter((s) => s.status === 'Absent').length || 0;
        const late = record.students?.filter((s) => s.status === 'Late').length || 0;
        const excused = record.students?.filter((s) => s.status === 'Excused').length || 0;
        const percentage = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
        const dateObj = new Date(record.date);

        return {
          id: record._id,
          date: dateObj.toLocaleDateString('en-GB'),
          dateObj, // Keep original date for sorting
          class: record.class,
          total,
          present,
          absent,
          late,
          excused,
          percentage,
        };
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .slice(0, 10) // Show only recent 10 records
      .map(({ dateObj, ...rest }) => rest); // Remove dateObj from final output
  }, [attendanceData]);

  // Process class attendance data - show all grades and sections
  const classAttendance = useMemo(() => {
    const classMap = new Map<string, { present: number; total: number }>();

    attendanceData.forEach((record) => {
      if (!classMap.has(record.class)) {
        classMap.set(record.class, { present: 0, total: 0 });
      }

      const classData = classMap.get(record.class)!;
      record.students?.forEach((student) => {
        classData.total++;
        if (student.status === 'Present' || student.status === 'Late' || student.status === 'Excused') {
          classData.present++;
        }
      });
    });

    // Helper function to extract grade number for sorting
    const extractGradeNumber = (className: string): number => {
      const match = className.match(/Grade\s+(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    };

    // Helper function to extract section for sorting
    const extractSection = (className: string): string => {
      const match = className.match(/Section\s+([A-Z])/i);
      return match ? match[1].toUpperCase() : 'Z';
    };

    return Array.from(classMap.entries())
      .map(([className, data]) => ({
        class: className,
        attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        gradeNumber: extractGradeNumber(className),
        section: extractSection(className),
      }))
      .sort((a, b) => {
        // Sort by grade number first, then by section
        if (a.gradeNumber !== b.gradeNumber) {
          return a.gradeNumber - b.gradeNumber;
        }
        return a.section.localeCompare(b.section);
      })
      .map(({ gradeNumber, section, ...rest }) => rest); // Remove sorting helpers from final output
  }, [attendanceData]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>View Attendance</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>View Attendance</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>View Attendance</h1>
        <button className="btn-primary">
          <Calendar size={18} />
          Filter Records
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card
          variant="stat"
          icon={<CheckCircle size={24} />}
          label="Total Present"
          value={stats.totalPresent.toLocaleString()}
          color="#27ae60"
        />
        <Card
          variant="stat"
          icon={<XCircle size={24} />}
          label="Total Absent"
          value={stats.totalAbsent.toLocaleString()}
          color="#e74c3c"
        />
        <Card
          variant="stat"
          icon={<Clock size={24} />}
          label="Average Attendance"
          value={`${stats.averageAttendance}%`}
          color="#3498db"
        />
        <Card
          variant="stat"
          icon={<Calendar size={24} />}
          label="Total Days"
          value={stats.totalDays}
          color="#9b59b6"
        />
      </div>

      {/* Charts */}
      <div className="section-title">Attendance Analytics</div>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Attendance by Class</h3>
          {classAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#667eea" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>No class data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="section-title">Recent Attendance Records</div>
      <div className="table-container">
        {attendanceRecords.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Total Students</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.class}</td>
                  <td>{record.total}</td>
                  <td>
                    <Badge variant="success" size="sm">{record.present}</Badge>
                  </td>
                  <td>
                    <Badge variant="absent" size="sm">{record.absent}</Badge>
                  </td>
                  <td>
                    <Badge variant={record.percentage >= 90 ? 'high' : record.percentage >= 80 ? 'medium' : 'low'} size="sm">
                      {record.percentage}%
                    </Badge>
                  </td>
                  <td>
                    <ViewButton size="sm" onClick={() => console.log('View Details', record.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAttendance;

