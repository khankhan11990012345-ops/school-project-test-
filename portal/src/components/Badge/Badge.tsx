import { ReactNode, CSSProperties } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'approved' | 'active' | 'rejected' | 'late' | 'absent' | 'onLeave' | 'excellent' | 'good' | 'average' | 'poor' | 'high' | 'medium' | 'low' | 'passed' | 'failed' | 'paid' | 'partial';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  style?: CSSProperties;
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = true,
  className = '',
  style,
}: BadgeProps) => {
  // Status variants with opacity-based design (matching the example pattern)
  const statusVariantStyles: Record<string, CSSProperties> = {
    pending: {
      backgroundColor: 'rgba(234, 179, 8, 0.1)', // yellow-500/10
      color: '#facc15', // yellow-400
      border: '1px solid rgba(234, 179, 8, 0.2)', // yellow-500/20
    },
    approved: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
      color: '#4ade80', // green-400
      border: '1px solid rgba(34, 197, 94, 0.2)', // green-500/20
    },
    active: {
      backgroundColor: 'rgba(14, 165, 233, 0.1)', // sky-500/10
      color: '#38bdf8', // sky-400
      border: '1px solid rgba(14, 165, 233, 0.2)', // sky-500/20
    },
    rejected: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
      color: '#f87171', // red-400
      border: '1px solid rgba(239, 68, 68, 0.2)', // red-500/20
    },
    late: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)', // orange-500/10
      color: '#fb923c', // orange-400
      border: '1px solid rgba(249, 115, 22, 0.2)', // orange-500/20
    },
    absent: {
      backgroundColor: 'rgba(244, 63, 94, 0.1)', // rose-500/10
      color: '#fb7185', // rose-400
      border: '1px solid rgba(244, 63, 94, 0.2)', // rose-500/20
    },
    onLeave: {
      backgroundColor: 'rgba(99, 102, 241, 0.1)', // indigo-500/10
      color: '#818cf8', // indigo-400
      border: '1px solid rgba(99, 102, 241, 0.2)', // indigo-500/20
    },
    excellent: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
      color: '#22c55e', // green-500
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    good: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500/10
      color: '#3b82f6', // blue-500
      border: '1px solid rgba(59, 130, 246, 0.2)',
    },
    average: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)', // orange-500/10
      color: '#f97316', // orange-500
      border: '1px solid rgba(249, 115, 22, 0.2)',
    },
    poor: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
      color: '#ef4444', // red-500
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    high: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
      color: '#22c55e', // green-500
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    medium: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)', // orange-500/10
      color: '#f97316', // orange-500
      border: '1px solid rgba(249, 115, 22, 0.2)',
    },
    low: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
      color: '#ef4444', // red-500
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    passed: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
      color: '#22c55e', // green-500
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    failed: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
      color: '#ef4444', // red-500
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    paid: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
      color: '#22c55e', // green-500
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    partial: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)', // orange-500/10
      color: '#f97316', // orange-500
      border: '1px solid rgba(249, 115, 22, 0.2)',
    },
  };

  // Legacy variants (kept for backward compatibility)
  const legacyVariantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: '#f0f0f0',
      color: '#333',
      border: 'none',
    },
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#4ade80',
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    warning: {
      backgroundColor: 'rgba(234, 179, 8, 0.1)', // yellow-500/10
      color: '#eab308', // yellow-500 (bright yellow)
      border: '1px solid rgba(234, 179, 8, 0.2)', // yellow-500/20
    },
    info: {
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      color: '#38bdf8',
      border: '1px solid rgba(14, 165, 233, 0.2)',
    },
  };

  // Get variant style (prioritize status variants)
  const variantStyle = statusVariantStyles[variant] || legacyVariantStyles[variant] || legacyVariantStyles.primary;

  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      padding: '0.125rem 0.625rem', // px-2.5 py-0.5 equivalent
      fontSize: '0.75rem', // text-xs
      borderRadius: rounded ? '9999px' : '0.25rem',
    },
    md: {
      padding: '0.125rem 0.625rem',
      fontSize: '0.75rem',
      borderRadius: rounded ? '9999px' : '0.375rem',
    },
    lg: {
      padding: '0.25rem 0.875rem',
      fontSize: '0.875rem',
      borderRadius: rounded ? '9999px' : '0.5rem',
    },
  };

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 500, // font-medium
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...variantStyle,
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span className={className} style={badgeStyle}>
      {children}
    </span>
  );
};

export default Badge;
