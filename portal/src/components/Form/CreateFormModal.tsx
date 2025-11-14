import React, { useState, CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { Save, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Button';
import { FormField, FormSection } from './CreateForm';

export interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  sections?: FormSection[];
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  submitButtonIcon?: ReactNode;
  initialData?: Record<string, any>;
  onFieldChange?: (fieldName: string, value: any, formData: Record<string, any>) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  sections,
  onSubmit,
  submitButtonText = 'Submit',
  submitButtonIcon,
  initialData = {},
  onFieldChange,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const { colors } = useTheme();

  // Initialize form data
  const getInitialData = () => {
    const data: Record<string, any> = {};
    fields.forEach((field) => {
      data[field.name] = initialData[field.name] ?? field.defaultValue ?? '';
    });
    return data;
  };

  const [formData, setFormData] = useState<Record<string, any>>(getInitialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());
  
  // Use ref to track if modal was open to detect when it opens
  const prevIsOpenRef = useRef<boolean>(isOpen);

  // Initialize form data when modal opens
  useEffect(() => {
    // Only run when modal transitions from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      if (Object.keys(initialData).length > 0) {
        const newData: Record<string, any> = {};
        fields.forEach((field) => {
          newData[field.name] = initialData[field.name] ?? field.defaultValue ?? '';
        });
        setFormData(newData);
      } else {
        // Reset form when modal opens with empty initialData
        setFormData(getInitialData());
      }
    }
    
    // Reset form when modal closes
    if (!isOpen && prevIsOpenRef.current) {
      setFormData(getInitialData());
      setErrors({});
      setFocusedFields(new Set());
    }
    
    prevIsOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen - initialize once when it opens

  // Prevent body scroll when modal is open
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

  const handleChange = (name: string, value: any) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Call onFieldChange callback if provided
    if (onFieldChange) {
      onFieldChange(name, value, updatedFormData);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Optionally close modal after successful submit
      // onClose();
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedFields((prev) => new Set(prev).add(fieldName));
  };

  const handleFieldBlur = (fieldName: string) => {
    setFocusedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  // Group fields by sections or create default section
  const getFieldGroups = (): Array<{ title?: string; fields: FormField[] }> => {
    if (sections && sections.length > 0) {
      const sectionGroups: Array<{ title?: string; fields: FormField[] }> = [];
      sections.forEach((section) => {
        const sectionFields = fields.filter((field) => section.fieldNames.includes(field.name));
        
        let currentRow: FormField[] = [];
        let isFirstRow = true;
        
        sectionFields.forEach((field, index) => {
          if (field.thirdWidth || field.halfWidth) {
            currentRow.push(field);
            if (currentRow.length === 3 || index === sectionFields.length - 1 || (!sectionFields[index + 1]?.thirdWidth && !sectionFields[index + 1]?.halfWidth)) {
              sectionGroups.push({ 
                title: isFirstRow ? section.title : undefined,
                fields: [...currentRow] 
              });
              isFirstRow = false;
              currentRow = [];
            }
          } else {
            if (currentRow.length > 0) {
              sectionGroups.push({ 
                title: isFirstRow ? section.title : undefined,
                fields: [...currentRow] 
              });
              isFirstRow = false;
              currentRow = [];
            }
            sectionGroups.push({ 
              title: isFirstRow ? section.title : undefined,
              fields: [field] 
            });
            isFirstRow = false;
          }
        });
        if (currentRow.length > 0) {
          sectionGroups.push({ 
            title: isFirstRow ? section.title : undefined,
            fields: currentRow 
          });
        }
      });
      return sectionGroups;
    }
    
    const groups: Array<{ title?: string; fields: FormField[] }> = [];
    let currentGroup: FormField[] = [];
    
    fields.forEach((field, index) => {
      if (field.thirdWidth || field.halfWidth) {
        currentGroup.push(field);
        const nextField = fields[index + 1];
        const shouldCloseGroup = 
          !nextField || 
          (!nextField.thirdWidth && !nextField.halfWidth) ||
          currentGroup.length === 3;
        
        if (shouldCloseGroup) {
          groups.push({ fields: [...currentGroup] });
          currentGroup = [];
        }
      } else {
        if (currentGroup.length > 0) {
          groups.push({ fields: [...currentGroup] });
          currentGroup = [];
        }
        groups.push({ fields: [field] });
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    
    return groups;
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const isFocused = focusedFields.has(field.name);
    const fieldId = `modal-field-${field.name}`;

    const inputBaseStyle: CSSProperties = {
      padding: '0.625rem 0.75rem',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: hasError ? '#e53e3e' : colors.border,
      borderRadius: '0.5rem',
      fontSize: '0.9rem',
      fontFamily: 'inherit',
      background: 'white',
      width: '100%',
      boxSizing: 'border-box',
    };

    const inputFocusStyle: CSSProperties = {
      outline: 'none',
      borderColor: hasError ? '#e53e3e' : colors.active,
    };

    const inputStyle: CSSProperties = {
      ...inputBaseStyle,
      ...(isFocused ? inputFocusStyle : {}),
    };

    const labelStyle: CSSProperties = {
      fontWeight: 500,
      color: colors.text,
      fontSize: '0.85rem',
      marginBottom: '0.375rem',
    };

    const errorStyle: CSSProperties = {
      color: '#e53e3e',
      fontSize: '0.8rem',
      marginTop: '0.25rem',
    };

    const fieldContainerStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      flex: (field.thirdWidth || field.halfWidth) ? '1' : undefined,
    };

    const renderInput = () => {
      switch (field.type) {
        case 'select':
          return (
            <select
              id={fieldId}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              onBlur={() => handleFieldBlur(field.name)}
              required={field.required}
              style={inputStyle}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'textarea':
          return (
            <textarea
              id={fieldId}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              rows={field.rows || 4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
          );

        default:
          return (
            <input
              id={fieldId}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              style={inputStyle}
            />
          );
      }
    };

    return (
      <div key={field.name} style={fieldContainerStyle}>
        <label htmlFor={fieldId} style={labelStyle}>
          {field.label} {field.required && <span style={{ color: '#e53e3e' }}>*</span>}
        </label>
        {renderInput()}
        {hasError && <span style={errorStyle}>{errors[field.name]}</span>}
      </div>
    );
  };

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

  const modalContentStyle: CSSProperties = {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: sizeMap[size],
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
  };

  const bodyStyle: CSSProperties = {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  };

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: `2px solid ${colors.border}`,
  };

  const formRowStyle: CSSProperties = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  };

  const footerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1.5rem',
    borderTop: `1px solid ${colors.border}`,
    background: '#f8f9fa',
  };

  const fieldGroups = getFieldGroups();

  return (
    <>
      <div style={overlayStyle} onClick={handleOverlayClick}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={bodyStyle}>
            <form id="create-form-modal" onSubmit={handleSubmit} style={formStyle}>
              {fieldGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.title && (
                    <h3 style={sectionTitleStyle}>{group.title}</h3>
                  )}
                  {group.fields && group.fields.length > 0 && (
                    <div style={group.fields.some(f => f.thirdWidth || f.halfWidth) ? formRowStyle : {}}>
                      {group.fields.map((field) => renderField(field))}
                    </div>
                  )}
                </div>
              ))}
            </form>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-form-modal"
              variant="primary"
              size="md"
            >
              {submitButtonIcon || <Save size={16} />}
              {submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateFormModal;

