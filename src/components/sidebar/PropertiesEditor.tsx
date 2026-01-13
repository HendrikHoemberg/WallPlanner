import { ArrowRightLeft, Copy, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useUnitConversion } from '../../hooks/useUnitConversion';
import { useFrameStore } from '../../stores/frameStore';
import { useUIStore } from '../../stores/uiStore';
import { wallStore } from '../../stores/wallStore';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface PropertyInputProps {
  label: string;
  value: number;
  unit?: string;
  onChange: (mm: number) => void;
  toDisplay: (mm: number) => number;
  toBase: (display: number) => number;
  step?: string;
  min?: number;
}

const PropertyInput: React.FC<PropertyInputProps> = ({
  label,
  value,
  unit,
  onChange,
  toDisplay,
  toBase,
  step = "0.1",
  min,
}) => {
  const displayValue = toDisplay(value);
  const [localValue, setLocalValue] = useState(Number(displayValue.toFixed(2)).toString());
  const [isFocused, setIsFocused] = useState(false);
  const [prevDisplayValue, setPrevDisplayValue] = useState(displayValue);

  if (displayValue !== prevDisplayValue) {
    setPrevDisplayValue(displayValue);
    if (!isFocused) {
      setLocalValue(Number(displayValue.toFixed(2)).toString());
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    const numericVal = parseFloat(newVal);
    if (!isNaN(numericVal)) {
      onChange(toBase(numericVal));
    }
  };

  return (
    <Input
      label={label}
      type="number"
      value={localValue}
      unit={unit}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        setLocalValue(Number(displayValue.toFixed(2)).toString());
      }}
      step={step}
      min={min}
    />
  );
};

export const PropertiesEditor: React.FC = () => {
  const { selectedElement, selectedFrameId, clearSelection } = useUIStore();
  const { deleteInstance, updateInstance, instances, duplicateInstance } = useFrameStore();
  const { wall, setDimensions, setBackgroundColor } = wallStore();
  const { toDisplay, toBase, currentUnit, setUnit, getAvailableUnits } = useUnitConversion();

  const selectedFrame = useMemo(
    () => instances.find((f) => f.id === selectedFrameId),
    [selectedFrameId, instances]
  );

  const units = useMemo(() => getAvailableUnits(), [getAvailableUnits]);
  const unitOptions = units.map((u) => ({ value: u, label: u.toUpperCase() }));

  // Wall Properties
  if (selectedElement === 'wall') {
    return (
      <div className="p-4 space-y-4 overflow-y-auto max-h-full">
        <h2 className="text-lg font-semibold text-gray-900">Wall Properties</h2>

        <div className="space-y-3">
          <PropertyInput
            label="Width"
            value={wall.dimensions.width}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              setDimensions({
                width: mm,
                height: wall.dimensions.height,
              });
            }}
            step="0.1"
          />

          <PropertyInput
            label="Height"
            value={wall.dimensions.height}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              setDimensions({
                width: wall.dimensions.width,
                height: mm,
              });
            }}
            step="0.1"
          />

          <Select
            label="Unit"
            value={currentUnit}
            options={unitOptions}
            onChange={(e) => setUnit(e.target.value as typeof currentUnit)}
          />

          <ColorPicker
            label="Background Color"
            value={wall.backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
      </div>
    );
  }

  // Frame Properties
  if (selectedElement === 'frame' && selectedFrame) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Frame Properties</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Copy size={16} />}
              onClick={() => {
                duplicateInstance(selectedFrame.id);
              }}
              title="Duplicate Frame"
            />
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => {
                deleteInstance(selectedFrame.id);
                clearSelection();
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <PropertyInput
            label="Position X"
            value={selectedFrame.position.x}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              updateInstance(selectedFrame.id, {
                position: { ...selectedFrame.position, x: mm },
              });
            }}
          />

          <PropertyInput
            label="Position Y"
            value={selectedFrame.position.y}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              updateInstance(selectedFrame.id, {
                position: { ...selectedFrame.position, y: mm },
              });
            }}
          />

          <PropertyInput
            label="Width"
            value={selectedFrame.dimensions.width}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              updateInstance(selectedFrame.id, {
                dimensions: { ...selectedFrame.dimensions, width: mm },
              });
            }}
          />

          <PropertyInput
            label="Height"
            value={selectedFrame.dimensions.height}
            toDisplay={toDisplay}
            toBase={toBase}
            unit={currentUnit}
            onChange={(mm) => {
              updateInstance(selectedFrame.id, {
                dimensions: { ...selectedFrame.dimensions, height: mm },
              });
            }}
          />

          {/* Swap dimensions button */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRightLeft size={16} />}
              onClick={() => {
                updateInstance(selectedFrame.id, {
                  dimensions: {
                    width: selectedFrame.dimensions.height,
                    height: selectedFrame.dimensions.width,
                  },
                });
              }}
              title="Swap width and height"
            >
              Swap W/H
            </Button>
          </div>

          <ColorPicker
            label="Border Color"
            value={selectedFrame.borderColor}
            onChange={(color) => {
              updateInstance(selectedFrame.id, { borderColor: color });
            }}
          />

          <PropertyInput
            label="Border Width"
            value={selectedFrame.borderWidth}
            toDisplay={(v) => v}
            toBase={(v) => v}
            unit="mm"
            onChange={(mm) => {
              updateInstance(selectedFrame.id, {
                borderWidth: mm,
              });
            }}
          />
        </div>
      </div>
    );
  }

  // No selection
  return (
    <div className="p-4 text-center text-gray-400">
      <p>Select an element to edit properties</p>
    </div>
  );
};
