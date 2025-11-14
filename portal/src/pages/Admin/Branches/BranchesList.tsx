import { Building2, MapPin, Users, Phone, Mail, TrendingUp, Plus } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { ViewButton, EditButton } from '../../../components/Button/iconbuttons';
import '../../../styles/universal.css';
import './Branches.css';

const BranchesList = () => {
  const branches = [
    {
      id: 1,
      name: 'Main Campus',
      code: 'MAIN-001',
      address: '123 Education Street, City Center',
      phone: '+1234567890',
      email: 'main@school.com',
      students: 450,
      teachers: 35,
      status: 'Active',
      established: '2020-01-15',
    },
    {
      id: 2,
      name: 'North Branch',
      code: 'NORTH-002',
      address: '456 Learning Avenue, North District',
      phone: '+1234567891',
      email: 'north@school.com',
      students: 320,
      teachers: 25,
      status: 'Active',
      established: '2021-03-20',
    },
    {
      id: 3,
      name: 'South Branch',
      code: 'SOUTH-003',
      address: '789 Knowledge Road, South Area',
      phone: '+1234567892',
      email: 'south@school.com',
      students: 280,
      teachers: 22,
      status: 'Active',
      established: '2022-06-10',
    },
    {
      id: 4,
      name: 'East Branch',
      code: 'EAST-004',
      address: '321 Wisdom Lane, East Side',
      phone: '+1234567893',
      email: 'east@school.com',
      students: 195,
      teachers: 18,
      status: 'Active',
      established: '2023-01-05',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Multi Branch Management</h1>
        <Button variant="primary" size="md">
          <Plus size={18} />
          Add New Branch
        </Button>
      </div>
      <div className="branches-grid">
        {branches.slice(0, 10).map((branch) => (
          <Card key={branch.id} variant="custom" className="branch-card">
            <div className="branch-header">
              <div className="branch-icon">
                <Building2 size={24} />
              </div>
              <div className="branch-title">
                <h3>{branch.name}</h3>
                <span className="branch-code">{branch.code}</span>
              </div>
              <Badge variant={branch.status.toLowerCase() === 'active' ? 'success' : 'secondary'} size="sm">
                {branch.status}
              </Badge>
            </div>
            <div className="branch-details">
              <div className="detail-item">
                <MapPin size={16} />
                <span>{branch.address}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{branch.phone}</span>
              </div>
              <div className="detail-item">
                <Mail size={16} />
                <span>{branch.email}</span>
              </div>
            </div>
            <div className="branch-stats">
              <div className="stat-item">
                <Users size={18} />
                <div>
                  <span className="stat-value">{branch.students}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              <div className="stat-item">
                <Users size={18} />
                <div>
                  <span className="stat-value">{branch.teachers}</span>
                  <span className="stat-label">Teachers</span>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp size={18} />
                <div>
                  <span className="stat-value">{branch.established}</span>
                  <span className="stat-label">Established</span>
                </div>
              </div>
            </div>
            <div className="branch-actions">
              <EditButton size="sm" onClick={() => console.log('Settings', branch.id)} />
              <ViewButton size="sm" onClick={() => console.log('View', branch.id)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BranchesList;
