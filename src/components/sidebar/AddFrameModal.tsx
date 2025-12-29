import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useUnitConversion } from '../../hooks/useUnitConversion';
import type { FrameTemplate } from '../../types';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { Input } from '../ui/Input';
import { ImageUploadInput } from './ImageUploadInput';

interface AddFrameModalProps {
  isOpen: boolean;
  editingTemplate?: FrameTemplate;
  onClose: () => void;
  onSave: (template: Omit<FrameTemplate, 'id' | 'createdAt'>) => void;
}

export const AddFrameModal: React.FC<AddFrameModalProps> = ({
  isOpen,
  editingTemplate,
  onClose,
  onSave,
}) => {
  const { toDisplay, toBase } = useUnitConversion();
  const [name, setName] = useState(editingTemplate?.name || '');
  const [width, setWidth] = useState(editingTemplate ? toDisplay(editingTemplate.dimensions.width) : 20);
  const [height, setHeight] = useState(editingTemplate ? toDisplay(editingTemplate.dimensions.height) : 20);
  const [borderWidth, setBorderWidth] = useState(
    editingTemplate ? toDisplay(editingTemplate.borderWidth) : 1
  );
  const [borderColor, setBorderColor] = useState(editingTemplate?.borderColor || '#000000');
  const [imageUrl, setImageUrl] = useState(editingTemplate?.imageUrl || '');

  const previewAspectRatio = useMemo(() => {
    return width / height;
  }, [width, height]);

  const handleSave = () => {
    if (!width || !height) {
      alert('Width and height are required');
      return;
    }

    const template: Omit<FrameTemplate, 'id' | 'createdAt'> = {
      name: name || `Frame ${Math.random().toString(36).substr(2, 9)}`,
      dimensions: {
        width: toBase(width),
        height: toBase(height),
      },
      borderColor,
      borderWidth: toBase(borderWidth),
      imageUrl: imageUrl || undefined,
    };

    onSave(template);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setWidth(20);
    setHeight(20);
    setBorderWidth(1);
    setBorderColor('#000000');
    setImageUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editingTemplate ? 'Edit Frame Template' : 'Add Frame Template'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div
              style={{
                aspectRatio: previewAspectRatio,
                borderColor,
                borderWidth: `${Math.max(1, borderWidth / 10)}px`,
              }}
              className="bg-white rounded"
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Input
              label="Frame Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'Portrait Frame'"
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={10}
              step={10}
            />
            <Input
              label="Height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={10}
              step={10}
            />
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Border Width"
              type="number"
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              min={0}
              max={50}
              step={1}
            />
            <div>
              <ColorPicker
                label="Border Color"
                value={borderColor}
                onChange={setBorderColor}
              />
            </div>
          </div>

          {/* Image */}
          <ImageUploadInput
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
            onImageRemove={() => setImageUrl('')}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t bg-gray-50">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
