import { useDraggable } from '@dnd-kit/core';
import { Edit2, Trash2 } from 'lucide-react';
import React from 'react';
import type { FrameTemplate } from '../../types';
import { Button } from '../ui/Button';

interface FrameTemplateCardProps {
  template: FrameTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

export const FrameTemplateCard: React.FC<FrameTemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', templateId: template.id },
  });

  const handleDelete = () => {
    if (confirm(`Delete frame template "${template.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg bg-white transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Frame preview */}
      <div
        style={{
          aspectRatio: `${template.dimensions.width} / ${template.dimensions.height}`,
          borderColor: template.borderColor,
          borderWidth: `${Math.max(2, Math.round(template.borderWidth / template.dimensions.width * 100))}px`,
          borderStyle: 'solid',
          boxSizing: 'border-box',
        }}
        className="w-full bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden"
      >
        {template.imageUrl && (
          <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Template info */}
      <div className="mb-2">
        <h4 className="font-medium text-sm truncate">{template.name}</h4>
        <p className="text-xs text-gray-500">
          {template.dimensions.width}mm × {template.dimensions.height}mm
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          className="flex-1"
          icon={<Edit2 size={14} />}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="flex-1"
          icon={<Trash2 size={14} />}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
