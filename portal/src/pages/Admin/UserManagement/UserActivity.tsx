import { memo, useMemo, useCallback, useState } from 'react';
import { Activity, Clock, User, FileText, Globe, Calendar, UserCheck } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ViewButton } from '../../../components/Button/iconbuttons';
import { Modal } from '../../../components/Modal';
import { ViewForm } from '../../../components/Form';
import '../../../styles/universal.css';
import './UserManagement.css';

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

const UserActivity = memo(() => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const activities = useMemo(() => [
    {
      id: 1,
      user: 'John Admin',
      action: 'Created new user',
      target: 'Sarah Teacher',
      timestamp: '2024-03-15 10:30 AM',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      user: 'Sarah Teacher',
      action: 'Graded assignments',
      target: 'Grade 10A',
      timestamp: '2024-03-15 09:15 AM',
      ip: '192.168.1.101',
    },
    {
      id: 3,
      user: 'Mike Accountant',
      action: 'Processed fee payment',
      target: 'Alice Johnson',
      timestamp: '2024-03-15 08:45 AM',
      ip: '192.168.1.102',
    },
    {
      id: 4,
      user: 'John Admin',
      action: 'Updated student record',
      target: 'Bob Williams',
      timestamp: '2024-03-14 04:20 PM',
      ip: '192.168.1.100',
    },
    {
      id: 5,
      user: 'Sarah Teacher',
      action: 'Marked attendance',
      target: 'Grade 10A',
      timestamp: '2024-03-14 02:30 PM',
      ip: '192.168.1.101',
    },
  ], []);

  const handleViewDetails = useCallback((activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsViewModalOpen(true);
    }
  }, [activities]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Activity</h1>
        <Button variant="primary" size="md">
          <FileText size={18} />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Activity size={24} />
          <div>
            <h3>Total Activities</h3>
            <p>1,245</p>
          </div>
        </div>
        <div className="stat-card">
          <User size={24} />
          <div>
            <h3>Active Users</h3>
            <p>45</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <h3>Today's Activities</h3>
            <p>125</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>Log Entries</h3>
            <p>5,680</p>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="section-title">Recent Activity Log</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Target</th>
              <th>Timestamp</th>
              <th>IP Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>
                  <strong>{activity.user}</strong>
                </td>
                <td>{activity.action}</td>
                <td>{activity.target}</td>
                <td>{activity.timestamp}</td>
                <td>{activity.ip}</td>
                <td>
                  <ViewButton size="sm" onClick={() => handleViewDetails(activity.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedActivity(null);
        }}
        title="Activity Details"
        size="md"
      >
        {selectedActivity && (
          <ViewForm
            sections={[
              {
                title: 'Activity Information',
                icon: Activity,
                fields: [
                  { label: 'User', value: selectedActivity.user, icon: User },
                  { label: 'Action', value: selectedActivity.action, icon: Activity },
                  { label: 'Target', value: selectedActivity.target, icon: UserCheck },
                  { label: 'Timestamp', value: selectedActivity.timestamp, icon: Calendar },
                  { label: 'IP Address', value: selectedActivity.ip, icon: Globe },
                ],
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
});

UserActivity.displayName = 'UserActivity';

export default UserActivity;

