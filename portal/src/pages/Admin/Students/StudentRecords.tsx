import { ViewButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Students.css';

const StudentRecords = () => {
  const students = [
    {
      id: 1,
      name: 'Alice Johnson',
      class: 'Grade 10A',
      attendance: 95,
      averageGrade: 88,
      totalSubjects: 6,
      completedAssignments: 45,
      pendingAssignments: 3,
    },
    {
      id: 2,
      name: 'Bob Williams',
      class: 'Grade 9B',
      attendance: 92,
      averageGrade: 85,
      totalSubjects: 5,
      completedAssignments: 38,
      pendingAssignments: 5,
    },
    {
      id: 3,
      name: 'Charlie Brown',
      class: 'Grade 11A',
      attendance: 98,
      averageGrade: 91,
      totalSubjects: 7,
      completedAssignments: 52,
      pendingAssignments: 2,
    },
    {
      id: 4,
      name: 'Diana Prince',
      class: 'Grade 10B',
      attendance: 89,
      averageGrade: 82,
      totalSubjects: 6,
      completedAssignments: 42,
      pendingAssignments: 4,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Records</h1>
      </div>

      {/* Student Records Table */}
      <div className="section-title">Individual Student Records</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Attendance %</th>
              <th>Average Grade</th>
              <th>Subjects</th>
              <th>Completed Assignments</th>
              <th>Pending Assignments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 10).map((student) => (
              <tr key={student.id}>
                <td>
                  <strong>{student.name}</strong>
                </td>
                <td>{student.class}</td>
                <td>
                  <Badge variant={student.attendance >= 90 ? 'high' : student.attendance >= 80 ? 'medium' : 'low'} size="sm">
                    {student.attendance}%
                  </Badge>
                </td>
                <td>
                  <Badge variant={student.averageGrade >= 85 ? 'high' : student.averageGrade >= 75 ? 'medium' : 'low'} size="sm">
                    {student.averageGrade}%
                  </Badge>
                </td>
                <td>{student.totalSubjects}</td>
                <td>{student.completedAssignments}</td>
                <td>
                  <Badge variant="pending" size="sm">{student.pendingAssignments}</Badge>
                </td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View Details', student.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRecords;

