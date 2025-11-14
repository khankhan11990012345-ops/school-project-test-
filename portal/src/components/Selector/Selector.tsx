import { useState, useEffect, ReactNode, CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './Selector.css';

export interface SelectorOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectorProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  options: SelectorOption[] | (() => Promise<SelectorOption[]>);
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  filterFn?: (option: SelectorOption) => boolean;
  sortFn?: (a: SelectorOption, b: SelectorOption) => number;
  renderOption?: (option: SelectorOption) => ReactNode;
  hasError?: boolean; // For error state styling
}

export const Selector: React.FC<SelectorProps> = ({
  value = '',
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  style = {},
  id,
  name,
  loading: externalLoading,
  loadingText = 'Loading...',
  emptyText = 'No options available',
  filterFn,
  sortFn,
  renderOption,
  hasError = false,
}) => {
  const { colors } = useTheme();
  const [internalOptions, setInternalOptions] = useState<SelectorOption[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if options is a function (async) or array
  const isAsync = typeof options === 'function';
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (isAsync) {
      const loadOptions = async () => {
        try {
          setInternalLoading(true);
          const loadedOptions = await options();
          let processedOptions = loadedOptions;

          // Apply filter if provided
          if (filterFn) {
            processedOptions = processedOptions.filter(filterFn);
          }

          // Apply sort if provided
          if (sortFn) {
            processedOptions = [...processedOptions].sort(sortFn);
          }

          setInternalOptions(processedOptions);
        } catch (error) {
          console.error('Error loading options:', error);
          setInternalOptions([]);
        } finally {
          setInternalLoading(false);
        }
      };

      loadOptions();
    } else {
      // Options is an array
      let processedOptions = options;

      // Apply filter if provided
      if (filterFn) {
        processedOptions = processedOptions.filter(filterFn);
      }

      // Apply sort if provided
      if (sortFn) {
        processedOptions = [...processedOptions].sort(sortFn);
      }

      setInternalOptions(processedOptions);
    }
  }, [options, filterFn, sortFn, isAsync]);

  // Base style matching CreateForm input styling
  const selectBaseStyle: CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: hasError ? '#e53e3e' : colors.border,
    borderRadius: '0.5rem',
    backgroundColor: disabled ? '#f3f4f6' : 'white',
    color: disabled ? '#6b7280' : colors.text,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    boxSizing: 'border-box',
    appearance: 'none',
    backgroundImage: disabled || isLoading 
      ? 'none'
      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(colors.text)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '12px',
    paddingRight: '2.5rem',
  };

  // Focus style
  const selectFocusStyle: CSSProperties = {
    outline: 'none',
    borderColor: hasError ? '#e53e3e' : colors.active,
    boxShadow: `0 0 0 3px ${hasError ? 'rgba(229, 62, 62, 0.1)' : `${colors.active}20`}`,
  };

  const selectStyle: CSSProperties = {
    ...selectBaseStyle,
    ...(isFocused ? selectFocusStyle : {}),
    ...style,
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    // Convert to number if the value is numeric
    const numValue = !isNaN(Number(selectedValue)) && selectedValue !== '' 
      ? Number(selectedValue) 
      : selectedValue;
    onChange(numValue);
  };

  return (
    <div className="selector-wrapper">
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        disabled={disabled || isLoading}
        className={className}
        style={selectStyle}
        data-loading={isLoading}
        data-error={hasError}
      >
      <option value="" style={{ color: colors.textSecondary }}>
        {isLoading ? loadingText : placeholder}
      </option>
      {internalOptions.map((option) => (
        <option 
          key={String(option.value)} 
          value={String(option.value)}
          disabled={option.disabled}
          style={{
            color: option.disabled ? colors.textSecondary : colors.text,
            backgroundColor: 'white',
          }}
        >
          {renderOption ? renderOption(option) : option.label}
        </option>
      ))}
      {!isLoading && internalOptions.length === 0 && (
        <option value="" disabled style={{ color: colors.textSecondary }}>
          {emptyText}
        </option>
      )}
      </select>
    </div>
  );
};

export default Selector;

