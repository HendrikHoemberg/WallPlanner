import { ArrowRightLeft, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const { toDisplay, toBase, currentUnit } = useUnitConversion();
  const [name, setName] = useState(editingTemplate?.name || '');
  const [width, setWidth] = useState(editingTemplate ? toDisplay(editingTemplate.dimensions.width) : 20);
  const [widthInput, setWidthInput] = useState(String(width));
  const [widthPrev, setWidthPrev] = useState(width);
  const [height, setHeight] = useState(editingTemplate ? toDisplay(editingTemplate.dimensions.height) : 20);
  const [heightInput, setHeightInput] = useState(String(height));
  const [heightPrev, setHeightPrev] = useState(height);
  const [borderWidth, setBorderWidth] = useState(
    editingTemplate ? toDisplay(editingTemplate.borderWidth) : 1
  );
  const [borderWidthInput, setBorderWidthInput] = useState(String(borderWidth));
  const [borderWidthPrev, setBorderWidthPrev] = useState(borderWidth);
  const [borderColor, setBorderColor] = useState(editingTemplate?.borderColor || '#000000');
  const [imageUrl, setImageUrl] = useState(editingTemplate?.imageUrl || '');

  const MIN_DIMENSION_MM = 50; // 5cm minimum
  const minDisplayValue = useMemo(() => toDisplay(MIN_DIMENSION_MM), [toDisplay]);

  // Debounce timers for text input
  const widthDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heightDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const borderWidthDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce function to update preview after user stops typing
  const debounceUpdate = (
    inputValue: string,
    setter: (value: number) => void,
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
    minVal: number = 0
  ) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const numValue = Number(inputValue);
      // Only update if it's a valid number and >= minimum
      if (inputValue !== '' && !isNaN(numValue) && numValue >= minVal) {
        setter(numValue);
      }
    }, 500);
  };

  // Handle spinner input (arrow keys and spinner buttons) - update after debounce
  const handleWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWidthInput(newValue);

    if (newValue !== '') {
      // Debounce input - use current width as fallback
      debounceUpdate(newValue, setWidth, widthDebounceRef, minDisplayValue);
    }
  };

  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHeightInput(newValue);

    if (newValue !== '') {
      debounceUpdate(newValue, setHeight, heightDebounceRef, minDisplayValue);
    }
  };

  const handleBorderWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBorderWidthInput(newValue);

    if (newValue !== '') {
      debounceUpdate(newValue, setBorderWidth, borderWidthDebounceRef, 0);
    }
  };

  const handleWidthBlur = () => {
    if (widthDebounceRef.current) clearTimeout(widthDebounceRef.current);
    const numValue = Number(widthInput);
    // Use prev value if invalid or below minimum
    const validatedValue = isNaN(numValue) || numValue < minDisplayValue ? widthPrev : numValue;
    
    setWidth(validatedValue);
    setWidthInput(String(validatedValue));
    setWidthPrev(validatedValue);
  };

  const handleHeightBlur = () => {
    if (heightDebounceRef.current) clearTimeout(heightDebounceRef.current);
    const numValue = Number(heightInput);
    // Use prev value if invalid or below minimum
    const validatedValue = isNaN(numValue) || numValue < minDisplayValue ? heightPrev : numValue;
    
    setHeight(validatedValue);
    setHeightInput(String(validatedValue));
    setHeightPrev(validatedValue);
  };

  const handleBorderWidthBlur = () => {
    if (borderWidthDebounceRef.current) clearTimeout(borderWidthDebounceRef.current);
    const numValue = Number(borderWidthInput);
    const validatedValue = isNaN(numValue) || numValue < 0 ? borderWidthPrev : numValue;
    
    setBorderWidth(validatedValue);
    setBorderWidthInput(String(validatedValue));
    setBorderWidthPrev(validatedValue);
  };

  const handleWidthFocus = () => {
    setWidthPrev(width);
    clearTimeout(widthDebounceRef.current);
  };

  const handleHeightFocus = () => {
    setHeightPrev(height);
    clearTimeout(heightDebounceRef.current);
  };

  const handleBorderWidthFocus = () => {
    setBorderWidthPrev(borderWidth);
    clearTimeout(borderWidthDebounceRef.current);
  };

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(widthDebounceRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(heightDebounceRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(borderWidthDebounceRef.current);
    };
  }, []);

  const PREVIEW_CONTAINER_SIZE = 280; // Fixed size in pixels to scale into

  const scaledPreview = useMemo(() => {
    const w = toBase(width) || 1;
    const h = toBase(height) || 1;
    const bw = toBase(borderWidth) || 0;

    // Scale factor to fit dimensions into PREVIEW_CONTAINER_SIZE
    const scale = Math.min(PREVIEW_CONTAINER_SIZE / w, PREVIEW_CONTAINER_SIZE / h);
    
    return {
      width: w * scale,
      height: h * scale,
      borderWidth: Math.max(1, bw * scale),
    };
  }, [width, height, borderWidth, toBase]);

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
    setWidthInput('20');
    setHeight(20);
    setHeightInput('20');
    setBorderWidth(1);
    setBorderWidthInput('1');
    setBorderColor('#000000');
    setImageUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80">
            <div
              style={{
                width: `${scaledPreview.width}px`,
                height: `${scaledPreview.height}px`,
                borderColor,
                borderWidth: `${scaledPreview.borderWidth}px`,
                borderStyle: 'solid',
              }}
              className="bg-white rounded shadow-sm overflow-hidden shrink-0 transition-all duration-200"
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
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
              value={widthInput}
              onChange={handleWidthInputChange}
              onFocus={handleWidthFocus}
              onBlur={handleWidthBlur}
              unit={currentUnit}
              min={minDisplayValue}
              step="0.1"
            />
            <Input
              label="Height"
              type="number"
              value={heightInput}
              onChange={handleHeightInputChange}
              onFocus={handleHeightFocus}
              onBlur={handleHeightBlur}
              unit={currentUnit}
              min={minDisplayValue}
              step="0.1"
            />
          </div>

          {/* Swap dimensions button */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRightLeft size={16} />}
              onClick={() => {
                const temp = width;
                const tempInput = widthInput;
                setWidth(height);
                setWidthInput(heightInput);
                setHeight(temp);
                setHeightInput(tempInput);
              }}
              title="Swap width and height"
            >
              Swap W/H
            </Button>
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Border Width"
              type="number"
              value={borderWidthInput}
              onChange={handleBorderWidthInputChange}
              onFocus={handleBorderWidthFocus}
              onBlur={handleBorderWidthBlur}
              unit={currentUnit}
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
