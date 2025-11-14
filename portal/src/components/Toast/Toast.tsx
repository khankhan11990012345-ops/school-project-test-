import { useEffect, CSSProperties } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#48bb78';
      case 'error':
        return '#e53e3e';
      case 'warning':
        return '#ed8936';
      default:
        return '#667eea';
    }
  };

  const getIconColor = () => {
    return getBorderColor();
  };

  const toastStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '300px',
    borderLeft: `4px solid ${getBorderColor()}`,
  };

  const iconStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    color: getIconColor(),
  };

  const messageStyle: CSSProperties = {
    flex: 1,
    fontSize: '0.9rem',
    color: '#333',
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    color: '#666',
  };

  return (
    <>
      <div style={toastStyle}>
        <div style={iconStyle}>{getIcon()}</div>
        <div style={messageStyle}>{message}</div>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
        >
          <X size={18} />
        </button>
      </div>
    </>
  );
};

export default Toast;
