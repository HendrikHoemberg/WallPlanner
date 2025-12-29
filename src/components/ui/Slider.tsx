import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { label, value, onChange, min = 0, max = 100, step = 1, className = '', ...props },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            accent-blue-600
          "
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
