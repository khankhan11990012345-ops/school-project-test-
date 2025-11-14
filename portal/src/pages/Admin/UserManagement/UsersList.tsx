import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Activity, UserCheck, UserX, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ViewButton, EditButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { Badge } from '../../../components/Badge';
import { ViewForm } from '../../../components/Form';
import { Table, TableColumn } from '../../../components/Table';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './UserManagement.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  phone?: string;
  joinDate?: string;
}

const UsersList = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      loadUsers();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.users.getAll() as any;
      // Backend returns { success: true, data: { users } }
      if (response.data?.users) {
        setUsers(response.data.users.map((u: any) => ({
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.isActive ? 'Active' : 'Inactive',
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString().split('T')[0] : undefined,
          phone: u.phone || '',
          joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const permissions = [
    {
      category: 'Dashboard',
      permissions: [
        { name: 'View Dashboard', admin: true, teacher: true, accountant: true, student: true },
        { name: 'View Statistics', admin: true, teacher: true, accountant: true, student: false },
      ],
    },
    {
      category: 'Students',
      permissions: [
        { name: 'View Students', admin: true, teacher: true, accountant: false, student: false },
        { name: 'Add Students', admin: true, teacher: false, accountant: false, student: false },
        { name: 'Edit Students', admin: true, teacher: true, accountant: false, student: false },
        { name: 'Delete Students', admin: true, teacher: false, accountant: false, student: false },
      ],
    },
    {
      category: 'Teachers',
      permissions: [
        { name: 'View Teachers', admin: true, teacher: true, accountant: false, student: false },
        { name: 'Add Teachers', admin: true, teacher: false, accountant: false, student: false },
        { name: 'Edit Teachers', admin: true, teacher: false, accountant: false, student: false },
      ],
    },
    {
      category: 'Accounts',
      permissions: [
        { name: 'View Accounts', admin: true, teacher: false, accountant: true, student: false },
        { name: 'Manage Fees', admin: true, teacher: false, accountant: true, student: false },
        { name: 'Manage Expenses', admin: true, teacher: false, accountant: true, student: false },
      ],
    },
    {
      category: 'Reports',
      permissions: [
        { name: 'View Reports', admin: true, teacher: true, accountant: true, student: true },
        { name: 'Generate Reports', admin: true, teacher: true, accountant: true, student: false },
        { name: 'Export Reports', admin: true, teacher: true, accountant: true, student: false },
      ],
    },
  ];

  const getRolePermissions = (role: string) => {
    const roleKey = role.toLowerCase() as 'admin' | 'teacher' | 'accountant' | 'student';
    return permissions.map(category => ({
      category: category.category,
      permissions: category.permissions
        .filter(p => p[roleKey])
        .map(p => p.name)
    })).filter(cat => cat.permissions.length > 0);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/dashboard/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      try {
        await api.users.delete(userId);
      alert('User deleted successfully!');
        // Reload users list
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return '#e74c3c';
      case 'Teacher':
        return '#3498db';
      case 'Accountant':
        return '#27ae60';
      case 'Student':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Active' ? <UserCheck size={16} /> : <UserX size={16} />;
  };

  const columns: TableColumn<User>[] = [
    { key: 'id', header: 'ID' },
    {
      key: 'name',
      header: 'Name',
      render: (value) => <strong>{value as string}</strong>,
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (_value, row) => (
        <Badge variant="info" size="sm" style={{ backgroundColor: getRoleColor(row.role) + '20', color: getRoleColor(row.role) }}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_value, row) => (
        <Badge variant={row.status.toLowerCase() === 'active' ? 'active' : 'pending'} size="sm">
          {getStatusIcon(row.status)}
          {row.status}
        </Badge>
      ),
    },
    { key: 'lastLogin', header: 'Last Login' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ViewButton size="sm" onClick={() => handleViewUser(row)} />
          <EditButton size="sm" onClick={() => handleEditUser(row.id)} />
          <DeleteButton size="sm" onClick={() => handleDeleteUser(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <Button variant="primary" size="md" onClick={() => navigate('/dashboard/admin/users/add')}>
          <UserPlus size={18} />
          Add New User
        </Button>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <Shield size={24} />
          <div>
            <h3>Total Users</h3>
            <p>125</p>
          </div>
        </div>
        <div className="stat-card">
          <UserCheck size={24} />
          <div>
            <h3>Active Users</h3>
            <p>118</p>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={24} />
          <div>
            <h3>Online Now</h3>
            <p>45</p>
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        data={users.slice(0, itemsPerPage)}
        emptyMessage="No users found"
      />

      {/* User Profile Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Profile Details"
        size="lg"
      >
        {selectedUser && (
          <ViewForm
            sections={[
              {
                title: 'Basic Information',
                fields: [
                  { label: 'Name', value: selectedUser.name },
                  { label: 'Email', value: selectedUser.email, icon: Mail },
                  ...(selectedUser.phone ? [{ label: 'Phone', value: selectedUser.phone, icon: Phone }] : []),
                  ...(selectedUser.joinDate ? [{ label: 'Join Date', value: selectedUser.joinDate, icon: Calendar }] : []),
                  { 
                    label: 'Role', 
                    value: selectedUser.role, 
                    renderAsBadge: { 
                      variant: selectedUser.role === 'Admin' ? 'danger' : selectedUser.role === 'Teacher' ? 'info' : selectedUser.role === 'Accountant' ? 'success' : 'warning' as any, 
                      size: 'sm' 
                    }
                  },
                  { 
                    label: 'Status', 
                    value: selectedUser.status, 
                    renderAsBadge: { variant: selectedUser.status === 'Active' ? 'active' : 'rejected' as any, size: 'sm' }
                  },
                  { label: 'Last Login', value: selectedUser.lastLogin },
                ],
              },
              {
                title: 'Role & Permissions',
                icon: Shield,
                fields: [],
                customContent: (
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#333' }}>Role:</strong>{' '}
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem',
                        backgroundColor: getRoleColor(selectedUser.role) + '20',
                        color: getRoleColor(selectedUser.role)
                      }}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#333', display: 'block', marginBottom: '0.75rem' }}>Permissions:</strong>
                      {getRolePermissions(selectedUser.role).map((category) => (
                        <div key={category.category} style={{ marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#555', marginBottom: '0.5rem' }}>
                            {category.category}
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {category.permissions.map((permission, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: 'white',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  border: '1px solid #e5e7eb'
                                }}
                              >
                                <CheckCircle size={14} style={{ color: '#10b981' }} />
                                <span>{permission}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default UsersList;
