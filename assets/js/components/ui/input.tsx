import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password';
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  error,
  label,
  required = false,
  type = 'text',
  onKeyDown,
  autoFocus = false,
  disabled = false
}) => {
  const inputClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200
    bg-white dark:bg-slate-800 
    text-slate-900 dark:text-slate-100
    placeholder-slate-500 dark:placeholder-slate-400
    ${error 
      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
    }
    ${disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'
    }
  `;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};