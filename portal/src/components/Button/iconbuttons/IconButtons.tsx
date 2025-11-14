import React from 'react';
import { Button } from '../index';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
};

export const ViewIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const PrintIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 18.25m0 0h12M10.56 2.25H13.5v1.5H10.56v-1.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9h1.5a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3H6m12 0a42.415 42.415 0 0 0-12 0" />
  </svg>
);

export const EditIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export const DeleteIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export const ApproveIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const AddIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const BackIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

export const GradeIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-6 h-6", 
  size = 18 
}) => (
  <svg {...iconProps} className={className} width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

// Icon Button Components
interface IconButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
}

export const ViewButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'View'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}
  >
    <ViewIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const PrintButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'Print'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}
  >
    <PrintIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const EditButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'Edit'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}
  >
    <EditIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const DeleteButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'Delete'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(229, 62, 62, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#e53e3e',
    }}
  >
    <DeleteIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const ApproveButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'Approve'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(72, 187, 120, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#48bb78',
    }}
  >
    <ApproveIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const AddButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'md',
  disabled = false,
  isLoading = false,
  title = 'Add'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#3b82f6',
    }}
  >
    <AddIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const BackButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  size = 'md',
  disabled = false,
  isLoading = false,
  title = 'Back'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}
  >
    <BackIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

export const GradeButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  variant = 'primary', 
  size = 'sm',
  disabled = false,
  isLoading = false,
  title = 'Grade'
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    title={title}
    style={{ 
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: 'rgba(139, 92, 246, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#8b5cf6',
    }}
  >
    <GradeIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
  </Button>
);

