import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useFrameStore } from '../../stores/frameStore';
import { useUIStore } from '../../stores/uiStore';
import { wallStore } from '../../stores/wallStore';
import type { FrameTemplate } from '../../types';
import { Button } from '../ui/Button';
import { AddFrameModal } from './AddFrameModal';
import { FrameTemplateCard } from './FrameTemplateCard';

export const FrameLibrary: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FrameTemplate | undefined>();
  const setLeftSidebarOpen = useUIStore((state) => state.setLeftSidebarOpen);

  const templates = useFrameStore((state) => state.templates);
  const addTemplate = useFrameStore((state) => state.addTemplate);
  const updateTemplate = useFrameStore((state) => state.updateTemplate);
  const deleteTemplate = useFrameStore((state) => state.deleteTemplate);
  
  const addInstance = useFrameStore((state) => state.addInstance);
  const selectFrame = useUIStore((state) => state.selectFrame);
  const wallConfig = wallStore((state) => state.wall);

  const handleCreateInstance = (template: FrameTemplate) => {
    // Only allow click-to-add on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Add to center of wall
    const x = (wallConfig.dimensions.width - template.dimensions.width) / 2;
    const y = (wallConfig.dimensions.height - template.dimensions.height) / 2;
    
    const newId = addInstance(template.id, { x, y });
    selectFrame(newId);
    
    // Close sidebar on mobile
    setLeftSidebarOpen(false);
  };

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
          className="min-h-11 min-w-11 md:min-h-0 md:min-w-0 md:h-auto"
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
                onClick={() => handleCreateInstance(template)}
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
