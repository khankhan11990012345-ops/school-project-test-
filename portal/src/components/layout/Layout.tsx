import { ReactNode, CSSProperties } from 'react';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  role: UserRole;
  children: ReactNode;
}

const Layout = ({ role, children }: LayoutProps) => {
  const { colors } = useTheme();

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    background: colors.background,
    display: 'flex',
  };

  const mainContentStyle: CSSProperties = {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    background: colors.background,
  };

  const contentStyle: CSSProperties = {
    padding: '2rem',
    flex: 1,
    minHeight: 'calc(100vh - 80px)',
  };

  return (
    <div style={containerStyle}>
      <Sidebar role={role} />
      <div style={mainContentStyle}>
        <Navbar role={role} />
        <main style={contentStyle}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
