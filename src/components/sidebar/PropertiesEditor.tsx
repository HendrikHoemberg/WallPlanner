import { ArrowRightLeft, Copy, RotateCw, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useUnitConversion } from '../../hooks/useUnitConversion';
import { useFrameStore } from '../../stores/frameStore';
import { useUIStore } from '../../stores/uiStore';
import { wallStore } from '../../stores/wallStore';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const PropertiesEditor: React.FC = () => {
  const { selectedElement, selectedFrameId, clearSelection } = useUIStore();
  const { deleteInstance, updateInstance, instances, duplicateInstance, rotateInstance } = useFrameStore();
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
          <Input
            label="Width"
            type="number"
            value={toDisplay(wall.dimensions.width).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
              setDimensions({
                width: mm,
                height: wall.dimensions.height,
              });
            }}
            step="0.1"
          />

          <Input
            label="Height"
            type="number"
            value={toDisplay(wall.dimensions.height).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
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
          <Input
            label="Position X"
            type="number"
            value={toDisplay(selectedFrame.position.x).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
              updateInstance(selectedFrame.id, {
                position: { ...selectedFrame.position, x: mm },
              });
            }}
            step="0.1"
          />

          <Input
            label="Position Y"
            type="number"
            value={toDisplay(selectedFrame.position.y).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
              updateInstance(selectedFrame.id, {
                position: { ...selectedFrame.position, y: mm },
              });
            }}
            step="0.1"
          />

          <Input
            label="Width"
            type="number"
            value={toDisplay(selectedFrame.dimensions.width).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
              updateInstance(selectedFrame.id, {
                dimensions: { ...selectedFrame.dimensions, width: mm },
              });
            }}
            step="0.1"
          />

          <Input
            label="Height"
            type="number"
            value={toDisplay(selectedFrame.dimensions.height).toFixed(2)}
            unit={currentUnit}
            onChange={(e) => {
              const mm = toBase(parseFloat(e.target.value) || 0);
              updateInstance(selectedFrame.id, {
                dimensions: { ...selectedFrame.dimensions, height: mm },
              });
            }}
            step="0.1"
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

          <Input
            label="Border Width"
            type="number"
            value={selectedFrame.borderWidth.toFixed(2)}
            unit="mm"
            onChange={(e) => {
              updateInstance(selectedFrame.id, {
                borderWidth: parseFloat(e.target.value) || 0,
              });
            }}
            step="0.1"
          />

          <div className="pt-2 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 block mb-2">Rotation: {selectedFrame.rotation}°</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<RotateCw size={16} />}
                onClick={() => rotateInstance(selectedFrame.id)}
              >
                Rotate 90°
              </Button>
              <select
                value={selectedFrame.rotation}
                onChange={(e) => {
                  updateInstance(selectedFrame.id, {
                    rotation: parseInt(e.target.value),
                  });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </div>
          </div>
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
