import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import type { Dimensions, FrameInstance, FrameTemplate, Position } from '../types';

interface FrameStoreState {
  templates: FrameTemplate[];
  instances: FrameInstance[];

  // Template management
  addTemplate: (template: Omit<FrameTemplate, 'id' | 'createdAt'>) => string;
  updateTemplate: (id: string, updates: Partial<FrameTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Instance management
  addInstance: (templateId: string, position: Position) => string;
  updateInstance: (id: string, updates: Partial<FrameInstance>) => void;
  deleteInstance: (id: string) => void;
  moveInstance: (id: string, position: Position) => void;
  resizeInstance: (id: string, dimensions: Dimensions) => void;

  // Bulk operations
  clearAllInstances: () => void;
  duplicateInstance: (id: string) => string;

  // Z-index management
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

export const useFrameStore = create<FrameStoreState>((set) => ({
  templates: [],
  instances: [],

  addTemplate: (template) => {
    const id = uuidv4();
    set((state) => ({
      templates: [
        ...state.templates,
        {
          ...template,
          id,
          createdAt: Date.now(),
        },
      ],
    }));
    return id;
  },

  updateTemplate: (id, updates) =>
    set((state) => {
      // Update the template
      const updatedTemplates = state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );

      // Update all instances that reference this template
      const updatedInstances = state.instances.map((instance) => {
        if (instance.templateId !== id) return instance;

        // Apply template updates to instance
        const instanceUpdates: Partial<FrameInstance> = {};
        
        if (updates.dimensions) {
          instanceUpdates.dimensions = updates.dimensions;
        }
        if (updates.borderColor !== undefined) {
          instanceUpdates.borderColor = updates.borderColor;
        }
        if (updates.borderWidth !== undefined) {
          instanceUpdates.borderWidth = updates.borderWidth;
        }
        if (updates.imageUrl !== undefined) {
          instanceUpdates.imageUrl = updates.imageUrl;
        }

        return { ...instance, ...instanceUpdates };
      });

      return {
        templates: updatedTemplates,
        instances: updatedInstances,
      };
    }),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      instances: state.instances.filter((i) => i.templateId !== id),
    })),

  addInstance: (templateId, position) => {
    let instanceId = '';
    set((state) => {
      const id = uuidv4();
      instanceId = id;
      const template = state.templates.find((t) => t.id === templateId);

      if (!template) return state;

      const maxZIndex =
        state.instances.length > 0
          ? Math.max(...state.instances.map((i) => i.zIndex))
          : 0;

      return {
        instances: [
          ...state.instances,
          {
            id,
            templateId,
            position,
            dimensions: template.dimensions,
            borderColor: template.borderColor,
            borderWidth: template.borderWidth,
            imageUrl: template.imageUrl,
            rotation: 0,
            zIndex: maxZIndex + 1,
          },
        ],
      };
    });
    return instanceId;
  },

  updateInstance: (id, updates) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),

  deleteInstance: (id) =>
    set((state) => ({
      instances: state.instances.filter((i) => i.id !== id),
    })),

  moveInstance: (id, position) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, position } : i
      ),
    })),

  resizeInstance: (id, dimensions) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, dimensions } : i
      ),
    })),

  clearAllInstances: () => set({ instances: [] }),

  duplicateInstance: (id) => {
    let newInstanceId = '';
    set((state) => {
      const instance = state.instances.find((i) => i.id === id);
      if (!instance) return state;

      const newId = uuidv4();
      newInstanceId = newId;
      const maxZIndex = Math.max(...state.instances.map((i) => i.zIndex));

      return {
        instances: [
          ...state.instances,
          {
            ...instance,
            id: newId,
            position: {
              x: instance.position.x + 100,
              y: instance.position.y + 100,
            },
            zIndex: maxZIndex + 1,
          },
        ],
      };
    });
    return newInstanceId;
  },

  bringToFront: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.instances.map((i) => i.zIndex));
      return {
        instances: state.instances.map((i) =>
          i.id === id ? { ...i, zIndex: maxZIndex + 1 } : i
        ),
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const minZIndex = Math.min(...state.instances.map((i) => i.zIndex));
      return {
        instances: state.instances.map((i) =>
          i.id === id
            ? { ...i, zIndex: minZIndex - 1 }
            : { ...i, zIndex: i.zIndex + 1 }
        ),
      };
    }),
}));
