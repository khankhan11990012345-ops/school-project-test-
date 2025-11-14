import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Calendar } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Attendance.css';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

interface Student {
  id: number | string; // Custom studentId (S001) for display
  mongoId: string; // MongoDB _id for API operations
  name: string;
  status: AttendanceStatus;
  existingAttendanceId?: string; // MongoDB _id of existing attendance record
}

const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const urlDate = searchParams.get('date');
  const urlClass = searchParams.get('class');
  
  const [selectedClass, setSelectedClass] = useState(urlClass || '');
  const [selectedDate, setSelectedDate] = useState(urlDate || new Date().toISOString().split('T')[0]);

  // Update state when URL parameters change
  useEffect(() => {
    if (urlDate) {
      setSelectedDate(urlDate);
    }
    if (urlClass) {
      setSelectedClass(decodeURIComponent(urlClass));
    }
  }, [urlDate, urlClass]);
  
  const [attendance, setAttendance] = useState<Student[]>([]);
  const [classOptions, setClassOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClassOptions = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          const classes = response.data.classes;
          const options = classes
            .filter((c: any) => c.status === 'Active')
            .map((c: any) => ({
              value: c._id || c.id,
              label: `${c.name} (${c.code})`,
            }));
        setClassOptions(options);
        }
      } catch (error) {
        console.error('Error loading class options:', error);
        setClassOptions([]);
      }
    };
    loadClassOptions();
  }, []);

  const loadStudents = async () => {
    if (!selectedClass || !selectedDate) {
      setAttendance([]);
      return;
    }

    try {
      setLoading(true);
      // Get class details to find class name and section
      const classResponse = await api.classes.getById(selectedClass) as any;
      const classData = classResponse.data?.class || classResponse.class || classResponse;
      const className = classData.name || '';
      const classCode = classData.code || '';
      const classSection = classData.section || '';
      
      console.log('[ATTENDANCE] Loading students for class:', { className, classCode, classSection, selectedClass });
      
      // Get all students from backend
      const studentsResponse = await api.students.getAll() as any;
      const allStudents = studentsResponse.data?.students || studentsResponse.students || [];
      
      console.log('[ATTENDANCE] All students loaded:', allStudents.length);
      // Debug: Check first student structure
      if (allStudents.length > 0) {
        console.log('[ATTENDANCE] Sample student structure:', {
          firstStudent: allStudents[0],
          keys: Object.keys(allStudents[0] || {}),
          has_id: !!allStudents[0]?._id,
          hasId: !!allStudents[0]?.id,
          hasStudentId: !!allStudents[0]?.studentId
        });
      }
      
      // Construct full class name with section for matching students and querying attendance
      const fullClassName = classSection ? `${className} Section ${classSection}` : className;
      
      // Filter students by class name and section
      // Class name format: "Grade 1 Section A"
      // Students have: class: "Grade 1 Section A" (or "Grade 1"), section: "A"
      const classStudents = allStudents.filter((s: any) => {
        const studentClass = (s.class || '').trim();
        const studentSection = (s.section || '').trim();
        
        // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
        const gradeFromClassName = className.split(' ').slice(0, 2).join(' '); // "Grade 1"
        
        console.log('[ATTENDANCE] Checking student:', {
          studentName: s.name,
          studentClass,
          studentSection,
          className,
          fullClassName,
          classSection,
          gradeFromClassName
        });
        
        // Match by:
        // 1. Exact full class name match (e.g., "Grade 1 Section A" === "Grade 1 Section A")
        // 2. Student class matches full class name
        // 3. Class name contains grade AND section matches (e.g., studentClass="Grade 1", studentSection="A", fullClassName="Grade 1 Section A", classSection="A")
        // 4. Both class and section match exactly
        const exactFullMatch = studentClass === fullClassName;
        const exactMatch = studentClass === className;
        const gradeAndSectionMatch = studentClass.includes(gradeFromClassName) && 
                                     classSection && 
                                     studentSection === classSection;
        const bothMatch = studentClass === gradeFromClassName && studentSection === classSection;
        
        const matches = exactFullMatch || exactMatch || gradeAndSectionMatch || bothMatch;
        
        if (matches) {
          console.log('[ATTENDANCE] ✓ Student matched:', s.name);
        }
        
        return matches;
      });
      
      console.log('[ATTENDANCE] Filtered students for class:', classStudents.length, classStudents.map((s: any) => ({ id: s.studentId || s._id || s.id, name: s.name, class: s.class })));
      
      // Check existing attendance for the selected date (new structure: one document per class per date)
      const attendanceResponse = await api.attendance.getAll({
        date: selectedDate,
        class: fullClassName,
      }) as any;
      const existingAttendanceDocs = attendanceResponse.data?.attendance || attendanceResponse.attendance || [];
      
      // New structure: one document per class per date
      const existingAttendanceDoc = existingAttendanceDocs[0]; // Should be only one document
      const existingAttendanceMap = new Map<string, { status: AttendanceStatus; remarks?: string }>();
      
      if (existingAttendanceDoc && existingAttendanceDoc.students && Array.isArray(existingAttendanceDoc.students)) {
        existingAttendanceDoc.students.forEach((studentAtt: any) => {
          const studentMongoId = studentAtt.studentId?._id || studentAtt.studentId || studentAtt.studentId?.toString();
          if (studentMongoId) {
            // Map backend status to frontend status
            let frontendStatus: AttendanceStatus = 'absent';
            const backendStatus = (studentAtt.status || '').toLowerCase();
            if (backendStatus === 'present') frontendStatus = 'present';
            else if (backendStatus === 'absent') frontendStatus = 'absent';
            else if (backendStatus === 'late') frontendStatus = 'late';
            else if (backendStatus === 'excused') frontendStatus = 'leave';
            
            existingAttendanceMap.set(String(studentMongoId), {
              status: frontendStatus,
              remarks: studentAtt.remarks,
            });
          }
        });
      }
      
      console.log('[ATTENDANCE] Existing attendance document:', {
        found: !!existingAttendanceDoc,
        studentsCount: existingAttendanceDoc?.students?.length || 0,
        mappedCount: existingAttendanceMap.size
      });
      
      // Map students with their attendance status
      const studentsWithAttendance: Student[] = classStudents.map((student: any) => {
        // Extract IDs - handle both direct properties and nested structures
        const studentId = student.studentId || student.id || 'N/A'; // Custom ID for display (S001)
        // MongoDB _id can be in different places depending on API response structure
        let mongoId = student._id;
        if (!mongoId && student.id && typeof student.id === 'object' && student.id._id) {
          mongoId = student.id._id;
        } else if (!mongoId && student.id && !student.studentId) {
          // If there's no studentId but there's an id, it might be the MongoDB _id
          mongoId = student.id;
        }
        
        console.log('[ATTENDANCE] Student mapping:', {
          name: student.name,
          studentId,
          _id: student._id,
          id: student.id,
          extractedMongoId: mongoId,
          allKeys: Object.keys(student)
        });
        
        if (!mongoId) {
          console.error('[ATTENDANCE] No MongoDB _id found for student:', student);
        }
        
        // Get existing attendance status from the map
        const existingAtt = existingAttendanceMap.get(String(mongoId));
        
        return {
          id: studentId, // Display ID (S001)
          mongoId: mongoId || '', // MongoDB _id for API - ensure it's a string
          name: student.name,
          status: existingAtt?.status || 'present', // Default to present if no existing attendance
          existingAttendanceId: existingAttendanceDoc?._id || existingAttendanceDoc?.id, // Store attendance document ID
        };
      });
      
      console.log('[ATTENDANCE] Students with attendance:', studentsWithAttendance.length);
      setAttendance(studentsWithAttendance);
    } catch (error) {
      console.error('[ATTENDANCE] Error loading students:', error);
      setAttendance([]);
      alert('Failed to load students. Please check the class selection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (id: number | string, status: AttendanceStatus) => {
    setAttendance(prev =>
      prev.map(student =>
        String(student.id) === String(id) ? { ...student, status } : student
      )
    );
  };

  const getStatusCount = (status: AttendanceStatus) => {
    return attendance.filter(s => s.status === status).length;
  };

  // Map frontend status to backend status
  const mapStatusToBackend = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'leave':
        return 'Excused';
      default:
        return 'Absent';
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedDate) {
      alert('Please select a class and date');
      return;
    }

    if (attendance.length === 0) {
      alert('No students to mark attendance for. Please load students first.');
      return;
    }

    // Declare variables outside try block so they're accessible in catch block
    let className = '';
    let studentsArray: Array<{ studentId: string; status: string; remarks: string }> = [];

    try {
      setLoading(true);
      const classResponse = await api.classes.getById(selectedClass) as any;
      const classData = classResponse.data?.class || classResponse.class || classResponse;
      const gradeName = classData.name || '';
      const section = classData.section || '';
      
      // Construct full class name with section: "Grade 1 Section A" or "Grade 2 Section B"
      className = section ? `${gradeName} Section ${section}` : gradeName;
      
      console.log('[ATTENDANCE] Saving attendance for:', attendance.length, 'students');
      console.log('[ATTENDANCE] Class details:', { gradeName, section, className });
      
      // Validate all students have mongoId
      const studentsWithoutId = attendance.filter(s => !s.mongoId);
      if (studentsWithoutId.length > 0) {
        alert(`Error: ${studentsWithoutId.length} student(s) are missing MongoDB IDs. Please reload the students.`);
        return;
      }
      
      // Prepare students array for new structure (one document per class per date)
      studentsArray = attendance.map((student) => ({
        studentId: student.mongoId, // MongoDB _id
        status: mapStatusToBackend(student.status), // Map to backend format (Present, Absent, Late, Excused)
        remarks: 'On time', // Default remark, can be enhanced later
      }));
      
      // Validate studentIds are valid MongoDB ObjectIds (24 hex characters)
      const invalidIds = studentsArray.filter(s => !s.studentId || !/^[0-9a-fA-F]{24}$/.test(s.studentId));
      if (invalidIds.length > 0) {
        console.error('[ATTENDANCE] Invalid student IDs found:', invalidIds);
        alert(`Error: ${invalidIds.length} student(s) have invalid MongoDB IDs. Please reload the students.`);
        return;
      }
      
      // Save attendance as one document for the entire class
      const attendanceData = {
        class: className,
        date: selectedDate,
        students: studentsArray,
      };
      
      console.log('[ATTENDANCE] Saving attendance document:', {
        class: className,
        date: selectedDate,
        studentsCount: studentsArray.length,
        studentsArray: studentsArray.map(s => ({ studentId: s.studentId, status: s.status })),
      });
      
      // Check if we have an existing attendance ID from loading students
      const existingAttendanceId = attendance[0]?.existingAttendanceId;
      
      let response;
      if (existingAttendanceId) {
        // Update existing attendance using PUT (PUT endpoint only expects students array)
        console.log('[ATTENDANCE] Updating existing attendance:', existingAttendanceId);
        const updateData = { students: studentsArray };
        response = await api.attendance.update(existingAttendanceId, updateData);
      } else {
        // Create new attendance using POST (backend will handle update if duplicate)
        console.log('[ATTENDANCE] Creating new attendance');
        response = await api.attendance.create(attendanceData);
      }
      
      console.log('[ATTENDANCE] Save response:', response);
      
      const presentCount = getStatusCount('present');
      const absentCount = getStatusCount('absent');
      const lateCount = getStatusCount('late');
      const leaveCount = getStatusCount('leave');
      
      alert(`Attendance marked successfully!\nPresent: ${presentCount}\nAbsent: ${absentCount}\nLate: ${lateCount}\nOn Leave: ${leaveCount}`);
      
      // Reload students to refresh attendance data
      await loadStudents();
    } catch (error: any) {
      console.error('[ATTENDANCE] Error saving attendance:', error);
      console.error('[ATTENDANCE] Error type:', typeof error);
      console.error('[ATTENDANCE] Error constructor:', error?.constructor?.name);
      console.error('[ATTENDANCE] Error keys:', Object.keys(error || {}));
      console.error('[ATTENDANCE] Error details:', {
        message: error?.message,
        status: error?.status,
        name: error?.name,
        response: error?.response,
        data: error?.data,
        errorData: error?.errorData,
        stack: error?.stack,
      });
      
      // Try to extract error message from various possible locations
      let errorMessage = 'Failed to save attendance. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errorData?.message) {
        errorMessage = error.errorData.message;
      } else if (error?.errorData?.error) {
        errorMessage = error.errorData.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      
      console.error('[ATTENDANCE] Final error message:', errorMessage);
      
      // If it's a duplicate error, try to find and update the existing record
      if ((errorMessage.includes('already marked') || (error?.status === 400 && errorMessage.includes('already'))) && className && studentsArray.length > 0) {
        console.log('[ATTENDANCE] Duplicate detected, fetching existing attendance to update...');
        try {
          // Fetch existing attendance record
          const existingAttendanceResponse = await api.attendance.getAll({
            date: selectedDate,
            class: className,
          }) as any;
          
          const existingAttendanceDocs = existingAttendanceResponse.data?.attendance || existingAttendanceResponse.attendance || [];
          const existingAttendanceDoc = existingAttendanceDocs[0];
          
          if (existingAttendanceDoc && existingAttendanceDoc._id) {
            console.log('[ATTENDANCE] Found existing attendance, updating:', existingAttendanceDoc._id);
            
            // Use PUT to update the existing record (PUT endpoint only expects students array)
            const updateData = { students: studentsArray };
            const updateResponse = await api.attendance.update(existingAttendanceDoc._id, updateData);
            console.log('[ATTENDANCE] Update response:', updateResponse);
            
            const presentCount = getStatusCount('present');
            const absentCount = getStatusCount('absent');
            const lateCount = getStatusCount('late');
            const leaveCount = getStatusCount('leave');
            
            alert(`Attendance updated successfully!\nPresent: ${presentCount}\nAbsent: ${absentCount}\nLate: ${lateCount}\nOn Leave: ${leaveCount}`);
            
            // Reload students to refresh attendance data
            await loadStudents();
            return; // Exit early on success
          } else {
            console.error('[ATTENDANCE] Existing attendance not found, cannot update');
          }
        } catch (retryError: any) {
          console.error('[ATTENDANCE] Retry also failed:', retryError);
          console.error('[ATTENDANCE] Retry error details:', {
            message: retryError?.message,
            status: retryError?.status,
            errorData: retryError?.errorData,
          });
          // Fall through to show the original error
        }
      } else if (errorMessage.includes('already marked') && (!className || studentsArray.length === 0)) {
        console.error('[ATTENDANCE] Cannot retry: missing className or studentsArray');
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'approved';
      case 'absent':
        return 'absent';
      case 'late':
        return 'late';
      case 'leave':
        return 'onLeave';
      default:
        return 'pending';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mark Attendance</h1>
      </div>

      {/* Filters */}
      <Card variant="custom" className="filter-card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="filter-group" style={{ flex: '1', minWidth: '200px' }}>
            <label>Select Class:</label>
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
              <option value="">Select Class</option>
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flex: '1', minWidth: '200px' }}>
            <label>Date:</label>
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
          <div style={{ marginBottom: '0' }}>
            <Button 
              onClick={loadStudents} 
              variant="primary" 
              size="md"
              disabled={!selectedClass || !selectedDate || loading}
            >
              <Calendar size={18} style={{ marginRight: '0.5rem' }} />
              Apply
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Statistics */}
      <Card variant="custom" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>{getStatusCount('present')}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Present</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f87171' }}>{getStatusCount('absent')}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Absent</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fb923c' }}>{getStatusCount('late')}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Late</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#818cf8' }}>{getStatusCount('leave')}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>On Leave</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>{attendance.length}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total</div>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card variant="custom">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Leave</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading students...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    {selectedClass && selectedDate 
                      ? 'No students found for this class. Please click "Apply" to load students.'
                      : 'Please select a class and date, then click "Apply" to load students.'}
                  </td>
                </tr>
              ) : (
                attendance.map((student) => (
                <tr key={student.id}>
                  <td>{(student as any).studentId || student.id || 'N/A'}</td>
                  <td>
                    <strong>{student.name}</strong>
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.status === 'present'}
                      onChange={() => updateAttendance(student.id, 'present')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.status === 'absent'}
                      onChange={() => updateAttendance(student.id, 'absent')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.status === 'late'}
                      onChange={() => updateAttendance(student.id, 'late')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.status === 'leave'}
                      onChange={() => updateAttendance(student.id, 'leave')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(student.status)} size="sm">
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSubmit} variant="primary" size="md">
            <Save size={18} />
            Save Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MarkAttendance;
