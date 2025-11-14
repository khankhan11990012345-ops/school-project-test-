import { Search, Mail, Phone } from 'lucide-react';
import { ViewButton } from '../../components/Button/iconbuttons';
import { Badge } from '../../components/Badge';
import '../../styles/universal.css';
import './Teacher.css';

const MyStudents = () => {
  const students = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      class: 'Mathematics 101',
      attendance: '95%',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      class: 'Mathematics 101',
      attendance: '98%',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Students</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search students..." />
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} />
                    {student.email}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} />
                    {student.phone}
                  </div>
                </td>
                <td>{student.class}</td>
                <td>
                  <Badge variant="success" size="sm">{student.attendance}</Badge>
                </td>
                <td>
                  <ViewButton size="sm" onClick={() => console.log('View', student.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyStudents;

