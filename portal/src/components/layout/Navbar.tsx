import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { CSSProperties } from 'react';

interface NavbarProps {
  role: UserRole;
}

const Navbar = ({ role }: NavbarProps) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleLogout = () => {
    navigate('/');
  };

  const navbarStyle: CSSProperties = {
    background: colors.navbar,
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: colors.text,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const badgeStyle: CSSProperties = {
    background: colors.background,
    color: colors.active,
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '0.875rem',
  };

  const buttonStyle: CSSProperties = {
    background: colors.button,
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 500,
  };

  return (
    <header style={navbarStyle}>
      <h1 style={titleStyle}>Scholyman</h1>
      <div style={actionsStyle}>
        <span style={badgeStyle}>{role.toUpperCase()}</span>
        <button
          onClick={handleLogout}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.button;
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
