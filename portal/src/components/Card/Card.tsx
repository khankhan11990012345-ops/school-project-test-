import React, { ReactNode, CSSProperties, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps {
  variant?: 'stat' | 'custom';
  icon?: ReactNode;
  value?: string | number;
  label?: string;
  color?: string;
  trend?: string;
  trendType?: 'positive' | 'negative';
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  fontSize?: number; // Scale factor for font sizes (e.g., 0.5 for 50%)
}

const Card: React.FC<CardProps> = ({
  variant = 'stat',
  icon,
  value,
  label,
  color,
  trend,
  trendType,
  onClick,
  children,
  className = '',
  style,
  fontSize = 1,
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Base card styles
  const baseCardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  // Hover effect
  const hoverStyle: CSSProperties = {
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
    background: 'rgba(255, 255, 255, 0.85)',
  };

  const cardStyle: CSSProperties = {
    ...baseCardStyle,
    ...(isHovered && onClick ? hoverStyle : {}),
  };

  // Top border accent (appears on hover)
  const topBorderStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${color || colors.primary} 0%, ${colors.secondary} 100%)`,
    opacity: isHovered ? 1 : 0,
  };

  // Stat card specific styles
  const statCardContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const iconContainerStyle: CSSProperties = {
    width: `${60 * fontSize}px`,
    height: `${60 * fontSize}px`,
    borderRadius: `${0.75 * fontSize}rem`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
    color: color || colors.primary,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
  };

  const labelStyle: CSSProperties = {
    margin: '0 0 0.5rem 0',
    color: colors.textSecondary,
    fontSize: `${0.875 * fontSize}rem`,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle: CSSProperties = {
    margin: 0,
    color: colors.text,
    fontSize: `${2 * fontSize * 0.7}rem`, // Reduced by 30%
    fontWeight: 700,
  };

  const trendStyle: CSSProperties = {
    marginTop: '0.5rem',
    fontSize: `${0.75 * fontSize}rem`,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: trendType === 'positive' ? '#27ae60' : trendType === 'negative' ? '#e74c3c' : colors.textSecondary,
  };

  if (variant === 'custom' && children) {
    return (
      <div
        className={className}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div style={topBorderStyle} />
        {children}
      </div>
    );
  }

  // Stat card variant
  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={topBorderStyle} />
      <div style={statCardContainerStyle}>
        {icon && <div style={iconContainerStyle}>{icon}</div>}
        <div style={contentStyle}>
          {label && <h3 style={labelStyle}>{label}</h3>}
          {value !== undefined && <p style={valueStyle}>{value}</p>}
          {trend && <p style={trendStyle}>{trend}</p>}
        </div>
      </div>
    </div>
  );
};

export default Card;

