import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  error?: string;
  isNumber?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      unit,
      error,
      isNumber,
      className = '',
      type,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputType = isNumber ? 'number' : type || 'text';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            className={`
              w-full px-3 py-2 text-sm border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${unit ? 'pr-10' : ''}
              ${className}
            `.trim()}
            {...props}
          />
          {unit && (
            <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
