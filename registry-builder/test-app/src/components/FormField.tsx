import React from 'react';

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'select';
  name: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const generateFieldId = (name: string, type: string): string => {
  return `${type}-${name.toLowerCase().replace(/\s+/g, '-')}`;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  error
}) => {
  const fieldId = generateFieldId(name, type);
  const testId = `field-${name}`;
  
  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
        >
          <option value="">Choose {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        id={fieldId}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        required={required}
      />
    );
  };
  
  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      {renderInput()}
      {error && (
        <div 
          id={`${fieldId}-error`} 
          className="error-message"
          role="alert"
          data-testid={`${testId}-error`}
        >
          {error}
        </div>
      )}
    </div>
  );
};