import { Copy, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useUnitConversion } from '../../hooks/useUnitConversion';
import { useFrameStore } from '../../stores/frameStore';
import { useUIStore } from '../../stores/uiStore';
import { wallStore } from '../../stores/wallStore';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

export const PropertiesEditor: React.FC = () => {
  const { selectedElement, selectedFrameId, clearSelection, gridConfig, setGridConfig } = useUIStore();
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

        {/* Grid Configuration Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Grid Settings</h3>

          <div className="space-y-3">
            <Toggle
              label="Enable Grid"
              checked={gridConfig.enabled}
              onChange={(e) => setGridConfig({ enabled: (e.target as HTMLInputElement).checked })}
            />

            <Toggle
              label="Show Grid"
              checked={gridConfig.showGrid}
              onChange={(e) => setGridConfig({ showGrid: (e.target as HTMLInputElement).checked })}
            />

            <Toggle
              label="Snap to Grid"
              checked={gridConfig.snapToGrid}
              onChange={(e) => setGridConfig({ snapToGrid: (e.target as HTMLInputElement).checked })}
            />

            <div>
              <label className="text-sm font-medium text-gray-700">Grid Size: {gridConfig.cellSize}mm</label>
              <input
                type="range"
                value={gridConfig.cellSize}
                min={10}
                max={500}
                step={10}
                onChange={(e) => setGridConfig({ cellSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setGridConfig({ cellSize: 50 })}
                >
                  Small (50mm)
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setGridConfig({ cellSize: 100 })}
                >
                  Medium (100mm)
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setGridConfig({ cellSize: 200 })}
                >
                  Large (200mm)
                </button>
              </div>
            </div>

            <ColorPicker
              label="Grid Color"
              value={gridConfig.gridColor}
              onChange={(color) => setGridConfig({ gridColor: color })}
            />
          </div>
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
