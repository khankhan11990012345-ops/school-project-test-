import { useState, useMemo, CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  FileText, 
  DollarSign, 
  ClipboardList,
  ChevronDown,
  BarChart3,
  UserCog,
  Building2,
  BookOpen,
  BookMarked,
  Settings,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  subMenus?: { title: string; path: string }[];
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const { colors } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const menuItems = useMemo((): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        title: 'Dashboard',
        path: `/dashboard/${role}`,
        icon: <LayoutDashboard size={20} />,
      },
    ];

    // Role-specific items
    if (role === 'teacher') {
      baseItems.push(
        {
          title: 'Students',
          path: `/dashboard/${role}/students`,
          icon: <Users size={20} />,
        },
        {
          title: 'Attendance',
          path: `/dashboard/${role}/attendance`,
          icon: <CheckSquare size={20} />,
        },
        {
          title: 'Assignments',
          path: `/dashboard/${role}/assignments`,
          icon: <FileText size={20} />,
        },
        {
          title: 'Exams & Results',
          path: `/dashboard/${role}/exams`,
          icon: <GraduationCap size={20} />,
        },
        {
          title: 'Timetable',
          path: `/dashboard/${role}/timetable`,
          icon: <Calendar size={20} />,
        }
      );
    }

    if (role === 'student') {
      baseItems.push(
        {
          title: 'My Courses',
          path: `/dashboard/${role}/my-courses`,
          icon: <BookOpen size={20} />,
        },
        {
          title: 'Assignments',
          path: `/dashboard/${role}/assignments`,
          icon: <ClipboardList size={20} />,
        },
        {
          title: 'Papers',
          path: `/dashboard/${role}/papers`,
          icon: <FileText size={20} />,
        },
        {
          title: 'My Grades',
          path: `/dashboard/${role}/my-grades`,
          icon: <BarChart3 size={20} />,
        }
      );
    }

    if (role === 'accountant') {
      // Accountant only sees Accounts module
      baseItems.push(
        {
          title: 'Accounts',
          path: `/dashboard/${role}/accounts`,
          icon: <DollarSign size={20} />,
          subMenus: [
            { title: 'Overview', path: '/accounts' },
            { title: 'Student Fee Collection', path: '/accounts/fees' },
            { title: 'Teacher Payroll', path: '/accounts/payroll' },
            { title: 'Expenses', path: '/accounts/expenses' },
            { title: 'Reports', path: '/accounts/reports' },
            { title: 'Transactions', path: '/accounts/transactions' },
          ],
        }
      );
    }

    // Admin items (all modules)
    if (role === 'admin') {
      baseItems.push(
        {
          title: 'Teachers',
          path: `/dashboard/${role}/teachers`,
          icon: <Users size={20} />,
          subMenus: [
            { title: 'All Teachers', path: '/teachers' },
            { title: 'Teacher Performance', path: '/teachers/performance' },
          ],
        },
        {
          title: 'Students',
          path: `/dashboard/${role}/students`,
          icon: <GraduationCap size={20} />,
          subMenus: [
            { title: 'All Students', path: '/students' },
            { title: 'Student Records', path: '/students/records' },
            { title: 'Student Assignments', path: '/students/assignments' },
            { title: 'Tests Papers', path: '/students/tests' },
            { title: 'Quizzes', path: '/students/quizzes' },
          ],
        },
        {
          title: 'Classes',
          path: `/dashboard/${role}/classes`,
          icon: <BookOpen size={20} />,
        },
        {
          title: 'Subjects',
          path: `/dashboard/${role}/subjects`,
          icon: <BookMarked size={20} />,
        },
        {
          title: 'Attendance',
          path: `/dashboard/${role}/attendance/mark`,
          icon: <CheckSquare size={20} />,
          subMenus: [
            { title: 'Mark Attendance', path: '/attendance/mark' },
            { title: 'View Attendance', path: '/attendance/view' },
            { title: 'Attendance Reports', path: '/attendance/reports' },
            { title: 'Daily Reports', path: '/attendance/daily' },
          ],
        },
        {
          title: 'Exams',
          path: `/dashboard/${role}/exams`,
          icon: <FileText size={20} />,
          subMenus: [
            { title: 'All Exams', path: '/exams' },
            { title: 'Results', path: '/exams/results' },
          ],
        },
        {
          title: 'Accounts',
          path: `/dashboard/${role}/accounts`,
          icon: <DollarSign size={20} />,
          subMenus: [
            { title: 'Overview', path: '/accounts' },
            { title: 'Fee Management', path: '/accounts/fee-management' },
            { title: 'Student Fee Collection', path: '/accounts/fees' },
            { title: 'Teacher Payroll', path: '/accounts/payroll' },
            { title: 'Expenses', path: '/accounts/expenses' },
            { title: 'Reports', path: '/accounts/reports' },
            { title: 'Transactions', path: '/accounts/transactions' },
          ],
        },
        {
          title: 'Admissions',
          path: `/dashboard/${role}/admissions`,
          icon: <ClipboardList size={20} />,
          subMenus: [
            { title: 'Applications', path: '/admissions' },
            { title: 'Admission Reports', path: '/admissions/reports' },
          ],
        },
        {
          title: 'Reports',
          path: `/dashboard/${role}/reports`,
          icon: <BarChart3 size={20} />,
          subMenus: [
            { title: 'Academic Reports', path: '/reports/academic' },
            { title: 'Attendance Reports', path: '/reports/attendance' },
          ],
        },
        {
          title: 'User Management',
          path: `/dashboard/${role}/users`,
          icon: <UserCog size={20} />,
          subMenus: [
            { title: 'All Users', path: '/users' },
            { title: 'User Activity', path: '/users/activity' },
          ],
        },
        {
          title: 'Multi Branch',
          path: `/dashboard/${role}/branches`,
          icon: <Building2 size={20} />,
          subMenus: [
            { title: 'All Branches', path: '/branches' },
            { title: 'Add Branch', path: '/branches/add' },
            { title: 'Branch Settings', path: '/branches/settings' },
            { title: 'Branch Transfer', path: '/branches/transfer' },
            { title: 'Branch Reports', path: '/branches/reports' },
          ],
        },
        {
          title: 'Settings',
          path: `/dashboard/${role}/settings`,
          icon: <Settings size={20} />,
          subMenus: [
            { title: 'Master Data', path: '/settings/master-data' },
            { title: 'Theme Settings', path: '/settings/theme' },
            { title: 'Button Examples', path: '/settings/buttons' },
            { title: 'Badge Examples', path: '/settings/badges' },
            { title: 'Icon Button Examples', path: '/settings/icon-buttons' },
          ],
        }
      );
    }

    return baseItems;
  }, [role]);

  const filteredMenus = menuItems;

  const sidebarStyle: CSSProperties = {
    width: '260px',
    background: colors.sidebar,
    color: colors.text,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
    zIndex: 1000,
    borderRight: `1px solid ${colors.border}`,
  };

  const headerStyle: CSSProperties = {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };

  const headerTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };

  const navStyle: CSSProperties = {
    padding: '1rem 0',
  };

  const getMenuTitleStyle = (isActive: boolean, isExpanded: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    color: isActive ? colors.active : colors.text,
    textDecoration: 'none',
    cursor: 'pointer',
    borderLeft: `3px solid ${isActive ? colors.active : 'transparent'}`,
    background: isActive ? colors.surface : isExpanded ? colors.background : 'transparent',
    fontWeight: isActive ? 600 : 400,
  });

  const iconStyle: CSSProperties = {
    marginRight: '0.75rem',
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
  };

  const subMenuStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    background: colors.background,
  };

  const getSubMenuLinkStyle = (isActive: boolean): CSSProperties => ({
    display: 'block',
    padding: '0.75rem 1.5rem 0.75rem 3.5rem',
    color: isActive ? colors.active : colors.textSecondary,
    textDecoration: 'none',
    borderLeft: `3px solid ${isActive ? colors.active : 'transparent'}`,
    fontSize: '0.9rem',
    background: isActive ? colors.surface : 'transparent',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <>
      <style>{`
        .menu-title:hover {
          background: ${colors.background} !important;
          border-left-color: ${colors.hover} !important;
        }
        .sub-menu a:hover {
          background: ${colors.surface} !important;
          border-left-color: ${colors.hover} !important;
          padding-left: 4rem;
          color: ${colors.text} !important;
        }
        .menu-title.active .menu-icon {
          color: ${colors.active} !important;
        }
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: ${colors.background};
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: ${colors.textSecondary};
        }
      `}</style>
      <aside className="sidebar" style={sidebarStyle}>
        <div style={headerStyle}>
          <h2 style={headerTitleStyle}>Scholyman</h2>
        </div>
        <nav style={navStyle}>
          {filteredMenus.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const isExpanded = expandedMenus.includes(item.title);
            
            return (
              <div key={item.title} style={{ marginBottom: '0.25rem' }}>
                {item.subMenus ? (
                  <>
                    <div
                      style={getMenuTitleStyle(isActive, isExpanded)}
                      className="menu-title"
                      onClick={() => toggleMenu(item.title)}
                    >
                      <span style={iconStyle} className="menu-icon">{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.title}</span>
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }} 
                      />
                    </div>
                    {isExpanded && (
                      <ul style={subMenuStyle}>
                        {item.subMenus.map((subMenu) => {
                          const subIsActive = location.pathname === `/dashboard/${role}${subMenu.path}`;
                          return (
                            <li key={subMenu.path} style={{ margin: 0 }}>
                              <Link
                                to={`/dashboard/${role}${subMenu.path}`}
                                style={getSubMenuLinkStyle(subIsActive)}
                                className={subIsActive ? 'active' : ''}
                              >
                                {subMenu.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    style={getMenuTitleStyle(isActive, false)}
                    className={isActive ? 'active' : ''}
                  >
                    <span style={iconStyle} className="menu-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.title}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
