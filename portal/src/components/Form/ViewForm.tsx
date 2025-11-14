import React, { CSSProperties, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '../Badge';
import { useTheme } from '../../contexts/ThemeContext';

export interface ViewField {
  label: string;
  value: string | number | ReactNode;
  icon?: LucideIcon;
  spanFull?: boolean; // Span full width in grid
  span?: number; // Span specific number of columns
  renderAsBadge?: {
    variant: 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'active' | 'rejected' | 'pending' | 'approved' | 'late' | 'absent' | 'onLeave';
    size?: 'sm' | 'md' | 'lg';
  };
  badge?: {
    variant: 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'active' | 'rejected' | 'pending' | 'approved' | 'late' | 'absent' | 'onLeave';
    text: string;
  };
  customRender?: (value: any) => ReactNode;
}

export interface ViewSection {
  title: string;
  icon?: LucideIcon;
  fields: ViewField[];
  customContent?: ReactNode; // For special sections like permissions
  columns?: number; // Number of columns for this section (overrides global columns prop)
}

export interface ViewFormProps {
  sections: ViewSection[];
  title?: string;
  columns?: number; // Number of columns per row (default: 2)
}

const ViewForm: React.FC<ViewFormProps> = ({ sections, title, columns = 2 }) => {
  const { colors } = useTheme();

  const containerStyle: CSSProperties = {
    padding: '0.5rem 0',
  };

  const sectionStyle: CSSProperties = {
    marginBottom: '1.5rem',
  };

  const sectionTitleStyle: CSSProperties = {
    marginBottom: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };


  const fieldContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '0.1rem',
  };

  const valueStyle: CSSProperties = {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 500,
  };

  const valueTextStyle: CSSProperties = {
    margin: 0,
    fontSize: '0.9rem',
  };

  const renderField = (field: ViewField, index: number) => {
    let gridColumn: string | undefined;
    if (field.spanFull) {
      gridColumn = '1 / -1';
    } else if (field.span && field.span > 1) {
      gridColumn = `span ${field.span}`;
    }
    
    const fieldStyle: CSSProperties = {
      ...fieldContainerStyle,
      gridColumn,
    };

    const Icon = field.icon;
    // Use field label as key for stability, fallback to index
    const fieldKey = (field as any).key || field.label || index;

    return (
      <div key={fieldKey} style={fieldStyle}>
        <label style={labelStyle}>
          {Icon && <Icon size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />}
          {field.label}
        </label>
        {field.renderAsBadge ? (
          <div style={{ display: 'inline-block' }}>
            <Badge variant={field.renderAsBadge.variant} size={field.renderAsBadge.size || 'sm'}>
              {field.value}
            </Badge>
          </div>
        ) : field.customRender ? (
          field.customRender(field.value)
        ) : (
          <p style={typeof field.value === 'string' && field.value.length > 50 ? valueTextStyle : valueStyle}>
            {field.value}
          </p>
        )}
      </div>
    );
  };

  const renderSection = (section: ViewSection, sectionIndex: number) => {
    const SectionIcon = section.icon;
    // Use section-specific columns if provided, otherwise use global columns
    const sectionColumns = section.columns ?? columns;
    const sectionGridStyle: CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${sectionColumns}, 1fr)`,
      gap: '0.25rem',
    };

    return (
      <div key={sectionIndex} style={sectionStyle}>
        <h3 style={sectionTitleStyle}>
          {SectionIcon && <SectionIcon size={18} />}
          {section.title}
        </h3>
        {section.customContent ? (
          section.customContent
        ) : (
          <div style={sectionGridStyle}>
            {section.fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {title && (
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600, color: colors.text }}>
          {title}
        </h2>
      )}
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default ViewForm;

