import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole, DashboardData } from '../types';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import TeacherDashboard from '../pages/Teacher/TeacherDashboard';
import StudentDashboard from '../pages/Student/StudentDashboard';
import AccountantDashboard from '../pages/Accountant/AccountantDashboard';
import { Layout } from './layout';
import './Dashboard.css';

const Dashboard = () => {
  const { role } = useParams<{ role: UserRole }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role || !['admin', 'teacher', 'student', 'accountant'].includes(role)) {
      navigate('/');
      return;
    }

    // Ensure API_BASE_URL always ends with /api
    const getApiBaseUrl = (): string => {
      const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // Remove trailing slash if present
      const baseUrl = envUrl.replace(/\/$/, '');
      // Add /api if not already present
      return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    };

    const API_BASE_URL = getApiBaseUrl();
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // No token, redirect to login
      navigate('/');
      return;
    }
    
    fetch(`${API_BASE_URL}/dashboard/${role}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            // Token invalid, clear and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            navigate('/');
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Backend returns { success: true, data: dashboardData }
        if (data.success && data.data) {
          // Transform admin data to include stats property
          if (role === 'admin' && data.data) {
            const adminData: any = {
              stats: {
                totalStudents: data.data.totalStudents || 0,
                totalTeachers: data.data.totalTeachers || 0,
                totalClasses: data.data.totalClasses || 0,
                totalSubjects: data.data.totalSubjects || 0,
                pendingAdmissions: data.data.pendingAdmissions || 0,
                activeExams: data.data.activeExams || 0,
                totalUsers: data.data.totalUsers || 0,
              },
              financial: data.data.financial,
              recentFeeCollections: data.data.recentFeeCollections,
            };
            setDashboardData({ admin: adminData });
          } else {
            setDashboardData({ [role]: data.data } as DashboardData);
          }
        } else {
          // Transform admin data to include stats property
          if (role === 'admin' && data) {
            const adminData: any = {
              stats: {
                totalStudents: data.totalStudents || 0,
                totalTeachers: data.totalTeachers || 0,
                totalClasses: data.totalClasses || 0,
                totalSubjects: data.totalSubjects || 0,
                pendingAdmissions: data.pendingAdmissions || 0,
                activeExams: data.activeExams || 0,
                totalUsers: data.totalUsers || 0,
              },
              financial: data.financial,
              recentFeeCollections: data.recentFeeCollections,
            };
            setDashboardData({ admin: adminData });
          } else {
            setDashboardData({ [role]: data } as DashboardData);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
        setDashboardData(null);
      });
  }, [role, navigate]);


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!role) return null;

  if (error) {
    return (
      <Layout role={role}>
        <div className="error-message">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role}>
      <Outlet />
      {location.pathname === `/dashboard/${role}` && (
        <>
          {role === 'admin' && dashboardData?.admin && (
            <AdminDashboard data={dashboardData.admin as any} />
          )}
          {role === 'teacher' && <TeacherDashboard />}
          {role === 'student' && <StudentDashboard />}
          {role === 'accountant' && <AccountantDashboard />}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;

