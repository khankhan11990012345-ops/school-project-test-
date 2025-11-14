import { ReactNode, useEffect, CSSProperties } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  customMaxWidth?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  customMaxWidth,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeMap: Record<string, string> = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1200px',
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
  };

  const contentStyle: CSSProperties = {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: customMaxWidth || sizeMap[size],
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderBottom: '1px solid #e0e0e0',
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#333',
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    color: '#666',
    borderRadius: '0.25rem',
  };

  const bodyStyle: CSSProperties = {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  };

  return (
    <>
      <style>{`
        .modal-body-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .modal-body-scroll::-webkit-scrollbar-track {
          background: #f5f5f5;
        }
        .modal-body-scroll::-webkit-scrollbar-thumb {
          background: #d0d0d0;
          border-radius: 3px;
        }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover {
          background: #b0b0b0;
        }
      `}</style>
      <div style={overlayStyle} onClick={handleOverlayClick}>
        <div style={contentStyle}>
          {(title || showCloseButton) && (
            <div style={headerStyle}>
              {title && <h2 style={titleStyle}>{title}</h2>}
              {showCloseButton && (
                <button
                  style={closeButtonStyle}
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div style={bodyStyle} className="modal-body-scroll">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
