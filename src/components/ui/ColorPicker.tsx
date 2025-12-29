import React, { useRef } from 'react';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  className?: string;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value = '#000000', onChange, label, className = '' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClick}
            className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
            title={value}
          />
          <span className="text-sm font-mono text-gray-600">{value}</span>
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
