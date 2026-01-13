import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { CanvasFrame } from './components/canvas/CanvasFrame';
import { WallCanvas } from './components/canvas/WallCanvas';
import { AppLayout } from './components/layout/AppLayout';
import { FrameLibrary } from './components/sidebar/FrameLibrary';
import { PropertiesEditor } from './components/sidebar/PropertiesEditor';
import { DEFAULT_WALL_HEIGHT_MM, DEFAULT_WALL_WIDTH_MM } from './constants';
import { useFrameStore } from './stores/frameStore';
import { useUIStore } from './stores/uiStore';
import { wallStore } from './stores/wallStore';
import { clearProject, loadProject, saveProject } from './utils/storage';

function App() {
  const wall = wallStore((state) => state.wall);
  const instances = useFrameStore((state) => state.instances);
  const templates = useFrameStore((state) => state.templates);
  const addInstance = useFrameStore((state) => state.addInstance);
  const deleteInstance = useFrameStore((state) => state.deleteInstance);
  const duplicateInstance = useFrameStore((state) => state.duplicateInstance);
  const clearSelection = useUIStore((state) => state.clearSelection);
  const selectedFrameId = useUIStore((state) => state.selectedFrameId);
  const selectFrame = useUIStore((state) => state.selectFrame);
  const setZoom = useUIStore((state) => state.setZoom);
  const resetViewport = useUIStore((state) => state.resetViewport);

  const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  // Load and save project
  useEffect(() => {
    const saved = loadProject();
    if (saved) {
      wallStore.setState({ wall: saved.wall });
      useFrameStore.setState({
        templates: saved.frameTemplates,
        instances: saved.frameInstances,
      });
      useUIStore.setState({
        viewport: saved.viewport,
      });
    }

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BODY' || target.tagName === 'HTML') {
        clearSelection();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [clearSelection]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace - delete selected frame
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFrameId) {
        e.preventDefault();
        deleteInstance(selectedFrameId);
        clearSelection();
      }

      // Escape - clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Ctrl/Cmd + D - duplicate selected frame
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedFrameId) {
          const newId = duplicateInstance(selectedFrameId);
          selectFrame(newId);
        }
      }

      // Ctrl/Cmd + 0 - reset zoom to 100%
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetViewport();
      }

      // Ctrl/Cmd + Plus - zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const currentZoom = useUIStore.getState().viewport.zoom;
        setZoom(Math.min(3, currentZoom + 0.1));
      }

      // Ctrl/Cmd + Minus - zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        const currentZoom = useUIStore.getState().viewport.zoom;
        setZoom(Math.max(0.1, currentZoom - 0.1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFrameId, deleteInstance, clearSelection, duplicateInstance, selectFrame, resetViewport, setZoom, wall.dimensions.width]);

  // Auto-save on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const viewport = useUIStore.getState().viewport;
      saveProject({
        version: '1.0.0',
        wall,
        frameTemplates: templates,
        frameInstances: instances,
        viewport,
        lastSaved: Date.now(),
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [wall, instances, templates]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const data = active.data.current as any;

    if (data?.type === 'template' && over?.id === 'wall-canvas') {
      // For drop, we need to calculate the position on the wall
      // This is simplified - a full implementation would use the DndContext's position tracking
      const templateId = data.templateId;
      const template = templates.find((t) => t.id === templateId);

      if (template) {
        // Create instance at center of wall
        let position = {
          x: Math.max(0, wall.dimensions.width / 2 - template.dimensions.width / 2),
          y: Math.max(0, wall.dimensions.height / 2 - template.dimensions.height / 2),
        };

        addInstance(templateId, position);
      }
    } else if (data?.type === 'instance' && over?.id === 'wall-canvas') {
      // Frame was moved on canvas
      const instanceId = data.instanceId;
      const instance = instances.find((i) => i.id === instanceId);

      if (instance) {
        // Calculate new position from delta
        // Delta is in screen pixels, we need to convert to wall coordinates (mm)
        // The wall canvas is scaled by zoom, so we divide by (pixelRatio * zoom)
        const pixelRatio = useUIStore.getState().pixelRatio;
        const zoom = useUIStore.getState().viewport.zoom;
        const deltaXmm = delta.x / (pixelRatio * zoom);
        const deltaYmm = delta.y / (pixelRatio * zoom);

        let newPosition = {
          x: Math.max(0, Math.min(instance.position.x + deltaXmm, wall.dimensions.width - instance.dimensions.width)),
          y: Math.max(0, Math.min(instance.position.y + deltaYmm, wall.dimensions.height - instance.dimensions.height)),
        };

        useFrameStore.getState().moveInstance(instanceId, newPosition);
      }
    }

    setDraggedTemplateId(null);
  };

  const handleDragStart = (event: any) => {
    const data = event.active.data.current as any;
    if (data?.type === 'template') {
      setDraggedTemplateId(data.templateId);
    }
  };

  const handleDragMove = (event: any) => {
    const data = event.active.data.current as any;

    if (data?.type === 'instance') {
      // Calculate guides for this dragging frame
      const instanceId = data.instanceId;
      const instance = instances.find((i) => i.id === instanceId);
      const showSmartGuides = useUIStore.getState().showSmartGuides;

      if (instance && showSmartGuides) {
        // The guides will be shown in AlignmentGuides component
        // This is handled via the hook state
      }
    }
  };

  const draggedTemplate = draggedTemplateId
    ? templates.find((t) => t.id === draggedTemplateId)
    : null;

  const handleNewProject = () => {
    if (confirm('Start a new project? Current work will be lost.')) {
      clearProject();
      wallStore.setState({
        wall: {
          id: 'default',
          dimensions: {
            width: DEFAULT_WALL_WIDTH_MM,
            height: DEFAULT_WALL_HEIGHT_MM,
          },
          backgroundColor: '#f5f5f5',
          unitConfig: {
            displayUnit: 'cm',
          },
        },
      });
      useFrameStore.setState({
        templates: [],
        instances: [],
      });
      useUIStore.setState({
        mode: 'free',
        selectedFrameId: null,
        selectedElement: null,
        isDragging: false,
        showSmartGuides: false,
        viewport: {
          zoom: 1,
          panOffset: { x: 0, y: 0 },
          minZoom: 0.1,
          maxZoom: 3,
        },
        gridConfig: {
          enabled: true,
          cellSize: 100,
          snapToGrid: true,
          showGrid: true,
          gridColor: '#9ca3af',
        },
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AppLayout
        onNewProject={handleNewProject}
        leftSidebar={<FrameLibrary />}
        canvas={
          <WallCanvas wall={wall}>
            {instances.map((instance) => {
              const template = templates.find((t) => t.id === instance.templateId);
              if (!template) return null;

              return (
                <CanvasFrame
                  key={instance.id}
                  frame={instance}
                  template={template}
                  isSelected={selectedFrameId === instance.id}
                  onSelect={() => selectFrame(instance.id)}
                />
              );
            })}
          </WallCanvas>
        }
        rightSidebar={<PropertiesEditor />}
      />

      <DragOverlay>
        {draggedTemplate ? (
          <div
            style={{
              width: `${draggedTemplate.dimensions.width / 10}px`,
              height: `${draggedTemplate.dimensions.height / 10}px`,
              border: `2px solid ${draggedTemplate.borderColor}`,
              backgroundColor: '#f5f5f5',
              opacity: 0.8,
            }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
