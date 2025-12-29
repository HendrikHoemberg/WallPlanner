import React from 'react';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, checked, onChange, className = '', ...props }, ref) => {
    const handleClick = () => {
      if (onChange) {
        // Create a synthetic event that mimics a checkbox change event
        const syntheticEvent = {
          target: { checked: !checked },
          currentTarget: { checked: !checked },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="hidden"
            {...props}
          />
          <button
            type="button"
            onClick={handleClick}
            className={`
              w-11 h-6 rounded-full transition-colors
              ${
                checked
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <div
              className={`
                w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-200 absolute top-0.5
                ${checked ? 'translate-x-5' : 'translate-x-0.5'}
              `}
            />
          </button>
        </div>
        {label && (
          <label
            onClick={handleClick}
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
