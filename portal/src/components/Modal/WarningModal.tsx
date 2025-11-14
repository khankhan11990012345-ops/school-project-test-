import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import Modal from './Modal';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string | ReactNode;
  type?: 'warning' | 'error' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
}

const WarningModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
  onConfirm,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
}: WarningModalProps) => {
  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#e53e3e';
      case 'info':
        return '#667eea';
      default:
        return '#ed8936';
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'error':
        return 'Error';
      case 'info':
        return 'Information';
      default:
        return 'Warning';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
      closeOnOverlayClick={!onConfirm}
    >
      <div style={{ padding: '1rem 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `${getIconColor()}15`,
            color: getIconColor(),
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            {typeof message === 'string' ? (
              <div style={{ 
                whiteSpace: 'pre-line',
                lineHeight: '1.6',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                {message}
              </div>
            ) : (
              message
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.75rem',
          marginTop: '1.5rem'
        }}>
          {showCancel && (
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={type === 'error' ? 'danger' : 'primary'}
            size="md"
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              }
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WarningModal;

