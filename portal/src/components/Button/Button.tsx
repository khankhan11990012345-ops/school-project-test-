import { ButtonHTMLAttributes, ReactNode, CSSProperties, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const { colors } = useTheme();
  
  // Base styles
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'inherit',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.5rem',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    position: 'relative',
    opacity: disabled || isLoading ? 0.6 : 1,
    ...style,
  };

  // Size styles
  const sizeStyles: Record<string, CSSProperties> = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  // Variant styles
  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${colors.button} 0%, ${colors.secondary} 100%)`,
      color: 'white',
    },
    secondary: {
      background: colors.background,
      color: colors.text,
    },
    danger: {
      background: '#e53e3e',
      color: 'white',
    },
    success: {
      background: '#48bb78',
      color: 'white',
    },
    outline: {
      background: 'transparent',
      color: colors.button,
      border: `2px solid ${colors.button}`,
    },
  };

  // Hover styles (applied via onMouseEnter/onMouseLeave)
  const hoverStyles: Record<string, CSSProperties> = {
    primary: {
      boxShadow: `0 5px 15px ${colors.button}40`,
      background: `linear-gradient(135deg, ${colors.buttonHover} 0%, ${colors.secondary} 100%)`,
    },
    secondary: {
      background: colors.surface,
    },
    danger: {
      background: '#c53030',
      boxShadow: '0 5px 15px rgba(229, 62, 62, 0.4)',
    },
    success: {
      background: '#38a169',
      boxShadow: '0 5px 15px rgba(72, 187, 120, 0.4)',
    },
    outline: {
      background: colors.button,
      color: 'white',
    },
  };

  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled && !isLoading ? hoverStyles[variant] : {}),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const spinnerStyle: CSSProperties = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
  };

  return (
    <>
      <button
        className={className}
        style={buttonStyle}
        disabled={disabled || isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {isLoading && <span style={spinnerStyle}></span>}
        <span style={{ opacity: isLoading ? 0.7 : 1 }}>{children}</span>
      </button>
    </>
  );
};

export default Button;
