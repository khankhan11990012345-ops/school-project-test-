import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Calendar, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import api from '../../services/api';
import '../../styles/universal.css';
import './Teacher.css';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

interface StudentAttendance {
  id: string | number;
  name: string;
  email: string;
  class: string;
  phone: string;
  parent: string;
  dateOfBirth: string;
  admissionDate: string;
  address?: string;
  parentPhone: string;
  parentEmail?: string;
  gender: string;
  previousSchool?: string;
  status: AttendanceStatus;
  _id?: string;
}

const TeacherAttendance = () => {
  const [searchParams] = useSearchParams();
  const urlDate = searchParams.get('date');
  const urlClass = searchParams.get('class');
  
  const [selectedClass, setSelectedClass] = useState(urlClass || '');
  const [selectedDate, setSelectedDate] = useState(urlDate || new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [classOptions, setClassOptions] = useState<Array<{ value: string; label: string }>>([]);
  
  useEffect(() => {
    const loadClassOptions = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes;
          const options = classes
            .filter((c: any) => c.status === 'Active')
            .map((c: any) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }));
          setClassOptions(options);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadClassOptions();
  }, []);

  useEffect(() => {
    if (urlDate) {
      setSelectedDate(urlDate);
    }
    if (urlClass) {
      setSelectedClass(decodeURIComponent(urlClass));
    }
  }, [urlDate, urlClass]);

  useEffect(() => {
    if (selectedClass) {
      // Load students for the selected class
      const loadStudents = async () => {
        try {
          const response = await api.students.getAll() as any;
          if (response.data?.students) {
            const allStudents = response.data.students;
            const classResponse = await api.classes.getById(selectedClass) as any;
            const className = classResponse.data?.class?.name || selectedClass;
            const classStudents = allStudents.filter((s: any) => s.class === className || s.class === selectedClass);
      
      // Initialize attendance (default to absent)
      const initialAttendance: StudentAttendance[] = classStudents.map((student: any) => ({
        ...student,
        status: 'absent' as AttendanceStatus,
      }));
      
      setAttendance(initialAttendance);
          }
        } catch (error) {
          console.error('Error loading students:', error);
        }
      };
      loadStudents();
    }
  }, [selectedClass]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSave = () => {
    if (!selectedClass || !selectedDate) {
      alert('Please select both class and date');
      return;
    }

    setIsSaving(true);
    // In a real app, save to backend
    setTimeout(() => {
      alert('Attendance saved successfully!');
      setIsSaving(false);
    }, 1000);
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(s => s.status === 'present').length,
    absent: attendance.filter(s => s.status === 'absent').length,
    late: attendance.filter(s => s.status === 'late').length,
    leave: attendance.filter(s => s.status === 'leave').length,
  };

  const attendancePercentage = stats.total > 0 
    ? ((stats.present + stats.late + stats.leave) / stats.total * 100).toFixed(1)
    : '0';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mark Attendance</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '1rem',
            }}
          >
            <option value="">Select a class</option>
            {classOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '1rem',
            }}
          />
        </div>
      </div>

      {selectedClass && attendance.length > 0 && (
        <>
          {/* Statistics Cards */}
          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <Card
              variant="stat"
              icon={<UserCheck size={28} />}
              value={stats.total.toString()}
              label="Total Students"
              color="#667eea"
            />
            <Card
              variant="stat"
              icon={<CheckCircle size={28} />}
              value={stats.present.toString()}
              label="Present"
              color="#48bb78"
            />
            <Card
              variant="stat"
              icon={<XCircle size={28} />}
              value={stats.absent.toString()}
              label="Absent"
              color="#e53e3e"
            />
            <Card
              variant="stat"
              icon={<Clock size={28} />}
              value={stats.late.toString()}
              label="Late"
              color="#ed8936"
            />
            <Card
              variant="stat"
              icon={<Calendar size={28} />}
              value={`${attendancePercentage}%`}
              label="Attendance %"
              color="#9f7aea"
            />
          </div>

          {/* Attendance Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Leave</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'present'}
                        onChange={() => handleStatusChange(Number(student.id) || 0, 'present')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'absent'}
                        onChange={() => handleStatusChange(Number(student.id) || 0, 'absent')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'late'}
                        onChange={() => handleStatusChange(Number(student.id) || 0, 'late')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'leave'}
                        onChange={() => handleStatusChange(Number(student.id) || 0, 'leave')}
                      />
                    </td>
                    <td>
                      <Badge
                        variant={
                          student.status === 'present' ? 'approved' :
                          student.status === 'absent' ? 'absent' :
                          student.status === 'late' ? 'late' :
                          'onLeave'
                        }
                        size="sm"
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={18} style={{ marginRight: '0.5rem' }} />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </>
      )}

      {selectedClass && attendance.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No students found in this class
        </div>
      )}

      {!selectedClass && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Please select a class to mark attendance
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;

