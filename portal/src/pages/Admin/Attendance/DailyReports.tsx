import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, Users } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ViewButton, EditButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import '../../../styles/universal.css';
import './Attendance.css';

const DailyReports = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [displayDate, setDisplayDate] = useState('2024-03-15');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState<{ class: string; present: number; absent: number; total: number; percentage: number } | null>(null);

  const dailyReports = [
    {
      date: '2024-03-15',
      classes: [
        { class: 'Grade 9A', present: 28, absent: 2, total: 30, percentage: 93.3 },
        { class: 'Grade 9B', present: 25, absent: 3, total: 28, percentage: 89.3 },
        { class: 'Grade 10A', present: 23, absent: 2, total: 25, percentage: 92.0 },
        { class: 'Grade 10B', present: 24, absent: 1, total: 25, percentage: 96.0 },
      ],
      totalPresent: 100,
      totalAbsent: 8,
      totalStudents: 108,
      overallPercentage: 92.6,
    },
    {
      date: '2024-03-14',
      classes: [
        { class: 'Grade 9A', present: 29, absent: 1, total: 30, percentage: 96.7 },
        { class: 'Grade 9B', present: 27, absent: 1, total: 28, percentage: 96.4 },
        { class: 'Grade 10A', present: 24, absent: 1, total: 25, percentage: 96.0 },
        { class: 'Grade 10B', present: 25, absent: 0, total: 25, percentage: 100.0 },
      ],
      totalPresent: 105,
      totalAbsent: 3,
      totalStudents: 108,
      overallPercentage: 97.2,
    },
    {
      date: '2024-03-13',
      classes: [
        { class: 'Grade 9A', present: 27, absent: 3, total: 30, percentage: 90.0 },
        { class: 'Grade 9B', present: 26, absent: 2, total: 28, percentage: 92.9 },
        { class: 'Grade 10A', present: 22, absent: 3, total: 25, percentage: 88.0 },
        { class: 'Grade 10B', present: 23, absent: 2, total: 25, percentage: 92.0 },
      ],
      totalPresent: 98,
      totalAbsent: 10,
      totalStudents: 108,
      overallPercentage: 90.7,
    },
  ];


  // Find the displayed date's report
  const selectedReport = dailyReports.find(report => report.date === displayDate);

  const handleApply = () => {
    setDisplayDate(selectedDate);
  };

  const handleViewAttendance = (classData: { class: string; present: number; absent: number; total: number; percentage: number }) => {
    setSelectedClassData(classData);
    setIsViewModalOpen(true);
  };

  const handleEditAttendance = (className: string) => {
    // Navigate to MarkAttendance with date and class pre-filled
    navigate(`/dashboard/admin/attendance/mark?date=${displayDate}&class=${encodeURIComponent(className)}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Daily Attendance Reports</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="date-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
            <Calendar size={18} />
            Select Date:
          </label>
          <input
            id="date-selector"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>

      {selectedReport ? (
        <>
          {/* Summary Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: '#667eea' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333' }}>{selectedReport.totalStudents}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Present</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{selectedReport.totalPresent}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={20} style={{ color: '#ef4444' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Absent</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{selectedReport.totalAbsent}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: '#667eea' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Overall</div>
                <Badge variant={selectedReport.overallPercentage >= 90 ? 'high' : selectedReport.overallPercentage >= 80 ? 'medium' : 'low'} size="md">
                  {selectedReport.overallPercentage}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Single Table for Selected Date */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedReport.classes.map((classData, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{classData.class}</strong>
                    </td>
                    <td>{classData.total}</td>
                    <td>
                      <Badge variant="success" size="sm">{classData.present}</Badge>
                    </td>
                    <td>
                      <Badge variant="absent" size="sm">{classData.absent}</Badge>
                    </td>
                    <td>
                      <Badge variant={classData.percentage >= 90 ? 'high' : classData.percentage >= 80 ? 'medium' : 'low'} size="sm">
                        {classData.percentage}%
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ViewButton size="sm" onClick={() => handleViewAttendance(classData)} />
                        <EditButton size="sm" onClick={() => handleEditAttendance(classData.class)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#999',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No attendance data found for the selected date.</p>
        </div>
      )}

      {/* View Attendance Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedClassData(null);
        }}
        title="Attendance Details"
        size="lg"
      >
        {selectedClassData && (
          <ViewForm
            sections={[
              {
                title: 'Class Information',
                fields: [
                  {
                    label: 'Class',
                    value: selectedClassData.class,
                    icon: Users,
                  },
                  {
                    label: 'Date',
                    value: displayDate,
                    icon: Calendar,
                  },
                ],
              },
              {
                title: 'Attendance Statistics',
                fields: [
                  {
                    label: 'Total Students',
                    value: selectedClassData.total.toString(),
                    icon: Users,
                  },
                  {
                    label: 'Present',
                    value: selectedClassData.present.toString(),
                    icon: CheckCircle,
                    badge: { variant: 'success', text: `${selectedClassData.present} students` },
                  },
                  {
                    label: 'Absent',
                    value: selectedClassData.absent.toString(),
                    icon: XCircle,
                    badge: { variant: 'absent', text: `${selectedClassData.absent} students` },
                  },
                  {
                    label: 'Attendance Percentage',
                    value: `${selectedClassData.percentage}%`,
                    badge: {
                      variant: selectedClassData.percentage >= 90 ? 'success' : selectedClassData.percentage >= 80 ? 'warning' : 'danger',
                      text: `${selectedClassData.percentage}%`,
                    },
                  },
                ],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default DailyReports;

