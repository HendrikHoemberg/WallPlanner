import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useFrameStore } from '../../stores/frameStore';
import type { FrameTemplate } from '../../types';
import { Button } from '../ui/Button';
import { AddFrameModal } from './AddFrameModal';
import { FrameTemplateCard } from './FrameTemplateCard';

export const FrameLibrary: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FrameTemplate | undefined>();

  const templates = useFrameStore((state) => state.templates);
  const addTemplate = useFrameStore((state) => state.addTemplate);
  const updateTemplate = useFrameStore((state) => state.updateTemplate);
  const deleteTemplate = useFrameStore((state) => state.deleteTemplate);

  const handleAddTemplate = (template: Omit<FrameTemplate, 'id' | 'createdAt'>) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, template);
      setEditingTemplate(undefined);
    } else {
      addTemplate(template);
    }
    setIsAddModalOpen(false);
  };

  const handleEditTemplate = (template: FrameTemplate) => {
    setEditingTemplate(template);
    setIsAddModalOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
  };

  const handleCloseModal = () => {
    setEditingTemplate(undefined);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Frame Library</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Add
        </Button>
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto p-4">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No frame templates yet</p>
            <p className="text-sm mt-2">Create your first frame template</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <FrameTemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleEditTemplate(template)}
                onDelete={() => handleDeleteTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AddFrameModal
        isOpen={isAddModalOpen}
        editingTemplate={editingTemplate}
        onClose={handleCloseModal}
        onSave={handleAddTemplate}
      />
    </div>
  );
};
