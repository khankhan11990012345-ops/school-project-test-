import React, { useState, CSSProperties, ReactNode } from 'react';
import { Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Button';

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'password';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  rows?: number;
  min?: number | string;
  max?: number | string;
  defaultValue?: string | number | string[];
  halfWidth?: boolean; // For form-row (side-by-side) - DEPRECATED, use thirdWidth
  thirdWidth?: boolean; // For form-row (3 fields per row)
  multiple?: boolean; // For multi-select dropdowns
  disabled?: boolean; // For read-only/disabled fields
  spanFull?: boolean; // Span full width in grid
}

export interface FormSection {
  title: string;
  fieldNames: string[]; // Names of fields in this section
}

export interface CreateFormProps {
  title: string;
  fields: FormField[];
  sections?: FormSection[];
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  submitButtonIcon?: ReactNode;
  initialData?: Record<string, any>;
  onFieldChange?: (fieldName: string, value: any) => void;
  customSectionContent?: Record<string, ReactNode>; // Custom content for sections by title
}

const CreateForm: React.FC<CreateFormProps> = ({
  title,
  fields,
  sections,
  onSubmit,
  submitButtonText = 'Submit',
  submitButtonIcon,
  initialData = {},
  onFieldChange,
  customSectionContent = {},
}) => {
  const { colors } = useTheme();
  
  // Initialize form data
  const getInitialData = () => {
    const data: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.multiple) {
        // For multi-select, default to empty array
        data[field.name] = initialData[field.name] ?? field.defaultValue ?? [];
      } else {
        data[field.name] = initialData[field.name] ?? field.defaultValue ?? '';
      }
    });
    return data;
  };

  const [formData, setFormData] = useState<Record<string, any>>(getInitialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      const newData: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.multiple) {
          newData[field.name] = initialData[field.name] ?? field.defaultValue ?? [];
        } else {
          // Use initialData value if it exists, otherwise use defaultValue or empty string
          const value = initialData[field.name];
          newData[field.name] = value !== undefined && value !== null ? value : (field.defaultValue ?? '');
        }
      });
      console.log('Updating form data from initialData:', newData); // Debug log
      setFormData(newData);
    }
  }, [initialData, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Call onFieldChange callback if provided
    if (onFieldChange) {
      onFieldChange(name, value);
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required) {
        if (field.multiple) {
          // For multi-select, check if array is empty
          const value = formData[field.name];
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[field.name] = `${field.label} is required`;
          }
        } else {
          if (!formData[field.name]) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
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
    }
  };

  // Group fields by sections or create default section
  const getFieldGroups = (): Array<{ title?: string; fields: FormField[] }> => {
    if (sections && sections.length > 0) {
      // For sections, group fields into rows of 3
      const sectionGroups: Array<{ title?: string; fields: FormField[] }> = [];
      sections.forEach((section) => {
        const sectionFields = fields.filter((field) => section.fieldNames.includes(field.name));
        const hasCustomContent = customSectionContent[section.title];
        
        // If section has no fields but has custom content, add it anyway
        if (sectionFields.length === 0 && hasCustomContent) {
          sectionGroups.push({
            title: section.title,
            fields: [],
          });
          return;
        }
        
        // Group fields into rows of 3
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
    // If no sections, group fields that should be in rows
    const groups: Array<{ title?: string; fields: FormField[] }> = [];
    let currentGroup: FormField[] = [];
    
    fields.forEach((field, index) => {
      if (field.thirdWidth || field.halfWidth) {
        currentGroup.push(field);
        // If next field is not thirdWidth/halfWidth or we have 3 fields, close the group
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

  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());

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

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const isFocused = focusedFields.has(field.name);
    const fieldId = `field-${field.name}`;

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
          if (field.multiple) {
            // Multi-select
            const selectedValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
            return (
              <select
                id={fieldId}
                multiple
                value={selectedValues}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleChange(field.name, selected);
                }}
                onFocus={() => handleFieldFocus(field.name)}
                onBlur={() => handleFieldBlur(field.name)}
                required={field.required}
                style={{
                  ...inputStyle,
                  minHeight: '120px',
                  padding: '0.5rem',
                }}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          } else {
            // Single select
            return (
              <select
                id={fieldId}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onFocus={() => handleFieldFocus(field.name)}
                onBlur={() => handleFieldBlur(field.name)}
                required={field.required}
                disabled={field.disabled}
                style={{
                  ...inputStyle,
                  ...(field.disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                }}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {Array.isArray(field.options) && field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

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
              disabled={field.disabled}
              min={field.min}
              max={field.max}
              style={{
                ...inputStyle,
                ...(field.disabled ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f5f5f5' } : {}),
              }}
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

  // Container styles
  const pageContainerStyle: CSSProperties = {
    padding: '1rem 2rem',
    paddingTop: '1rem',
    minHeight: '100vh',
    background: colors.background,
  };

  const pageHeaderStyle: CSSProperties = {
    marginBottom: '1rem',
  };

  const pageTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text,
    margin: 0,
  };

  const formContainerStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: colors.text,
    marginTop: '0.75rem',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const formRowStyle: CSSProperties = {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  };


  const fieldGroups = getFieldGroups();

  return (
    <div style={pageContainerStyle}>
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>{title}</h1>
      </div>
      <div style={formContainerStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          {fieldGroups.map((group, groupIndex) => {
            const hasCustomContent = group.title && customSectionContent[group.title];
            const hasFields = group.fields && group.fields.length > 0;
            
            return (
              <div key={groupIndex}>
                {group.title && (
                  <div style={{ ...sectionTitleStyle, marginTop: groupIndex === 0 ? 0 : '1rem' }}>
                    {group.title}
                  </div>
                )}
                
                {hasCustomContent && group.title && (
                  <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    {customSectionContent[group.title]}
                  </div>
                )}
                
                {hasFields && (
                  hasFields && group.fields.length === 1 && !group.fields[0].thirdWidth && !group.fields[0].halfWidth ? (
                    renderField(group.fields[0])
                  ) : (
                    <div style={formRowStyle}>
                      {group.fields.map((field) => renderField(field))}
                    </div>
                  )
                )}
              </div>
            );
          })}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            style={{ marginTop: '0.75rem' }}
          >
            {submitButtonIcon || <Save size={16} />}
            {submitButtonText}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;

