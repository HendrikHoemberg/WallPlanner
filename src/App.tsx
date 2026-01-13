import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasFrame } from './components/canvas/CanvasFrame';
import { WallCanvas } from './components/canvas/WallCanvas';
import { AppLayout } from './components/layout/AppLayout';
import { FrameLibrary } from './components/sidebar/FrameLibrary';
import { PropertiesEditor } from './components/sidebar/PropertiesEditor';
import { DEFAULT_WALL_HEIGHT_MM, DEFAULT_WALL_WIDTH_MM } from './constants';
import { useFrameStore } from './stores/frameStore';
import { useUIStore } from './stores/uiStore';
import { wallStore } from './stores/wallStore';
import { calculateSnap } from './utils/snapping';
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
  // Add alignment guides state
  const alignmentGuides = useUIStore((state) => state.alignmentGuides);
  const setAlignmentGuides = useUIStore((state) => state.setAlignmentGuides);
  const showSmartGuides = useUIStore((state) => state.showSmartGuides);
  const pixelRatio = useUIStore((state) => state.pixelRatio);
  const zoom = useUIStore((state) => state.viewport.zoom);

  const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null);
  
  // Ref to store the last snap result for commit
  const lastSnapResultRef = useRef<{ x: number, y: number } | null>(null);

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
    const { active, over, delta, activatorEvent } = event;
    const data = active.data.current;
    
    // Clear guides
    setAlignmentGuides([]);

    if (data?.type === 'template' && over?.id === 'wall-canvas') {
      const templateId = data.templateId;
      const template = templates.find((t) => t.id === templateId);

      if (template) {
        // Calculate the drop position relative to the wall canvas
        // Get the current cursor position
        const activator = activatorEvent as MouseEvent | TouchEvent;
        const clientX = 'clientX' in activator ? activator.clientX : activator.touches[0].clientX;
        const clientY = 'clientY' in activator ? activator.clientY : activator.touches[0].clientY;
        
        const dropX = clientX + delta.x;
        const dropY = clientY + delta.y;

        // Get wall canvas position from the 'over' object
        // over.rect is the bounding box of the wall canvas on screen
        const wallRect = over.rect;
        
        // Coordinates relative to wall top-left (in screen pixels, already zoomed)
        const relativeX = dropX - wallRect.left;
        const relativeY = dropY - wallRect.top;

        // Convert to mm (pixelRatio * zoom is pixels per mm on screen)
        const posX = relativeX / (pixelRatio * zoom);
        const posY = relativeY / (pixelRatio * zoom);

        // Center the frame on the drop point and constrain to wall bounds
        const position = {
          x: Math.max(0, Math.min(posX - template.dimensions.width / 2, wall.dimensions.width - template.dimensions.width)),
          y: Math.max(0, Math.min(posY - template.dimensions.height / 2, wall.dimensions.height - template.dimensions.height)),
        };

        addInstance(templateId, position);
      }
    } else if (data?.type === 'instance' && over?.id === 'wall-canvas') {
      // Frame was moved on canvas
      const instanceId = data.instanceId;
      
      // Use snapped result if available (calculated in modifier)
      if (lastSnapResultRef.current) {
        useFrameStore.getState().moveInstance(instanceId, lastSnapResultRef.current);
        lastSnapResultRef.current = null;
      } else {
        // Fallback to delta calculation if modifier didn't run (e.g. smart guides disabled)
        const instance = instances.find((i) => i.id === instanceId);
  
        if (instance) {
          const deltaXmm = delta.x / (pixelRatio * zoom);
          const deltaYmm = delta.y / (pixelRatio * zoom);
  
          const newPosition = {
            x: Math.max(0, Math.min(instance.position.x + deltaXmm, wall.dimensions.width - instance.dimensions.width)),
            y: Math.max(0, Math.min(instance.position.y + deltaYmm, wall.dimensions.height - instance.dimensions.height)),
          };
  
          useFrameStore.getState().moveInstance(instanceId, newPosition);
        }
      }
    }

    setDraggedTemplateId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'template') {
      setDraggedTemplateId(data.templateId);
    }
    // Reset snap result
    lastSnapResultRef.current = null;
  };

  // Modifier to center the drag overlay on the cursor for templates
  const snapCenterToCursor: Modifier = useCallback(
    ({ transform, activatorEvent, active }) => {
      if (active?.data.current?.type !== 'template' || !activatorEvent) {
        return transform;
      }

      const template = templates.find((t) => t.id === active.data.current?.templateId);
      if (!template) return transform;

      const activator = activatorEvent as MouseEvent | TouchEvent;
      const clientX = 'clientX' in activator ? activator.clientX : activator.touches[0].clientX;
      const clientY = 'clientY' in activator ? activator.clientY : activator.touches[0].clientY;

      const activeRect = active.rect.current;
      if (!activeRect || !activeRect.initial) return transform;

      // Calculate the scaled dimensions of the frame as it will appear in the overlay
      const overlayWidth = template.dimensions.width * pixelRatio * zoom;
      const overlayHeight = template.dimensions.height * pixelRatio * zoom;

      // To center the overlay on the cursor, we need to:
      // 1. Subtract the initial offset of the cursor from the top-left of the source element
      // 2. Subtract half the overlay dimensions
      // 3. Add the current transform (movement delta)
      return {
        ...transform,
        x: (clientX - activeRect.initial.left) - overlayWidth / 2 + transform.x,
        y: (clientY - activeRect.initial.top) - overlayHeight / 2 + transform.y,
      };
    },
    [templates, pixelRatio, zoom]
  );

  // Modifier for snapping
  const snapToGridModifier: Modifier = useCallback(
    ({ transform, active }) => {
      // Clean up guides if not dragging specific instance
      if (active?.data?.current?.type !== 'instance') {
        return transform;
      }

      if (!showSmartGuides) return transform;

      const instanceId = active.data.current.instanceId;
      const instance = instances.find((i) => i.id === instanceId);

      if (!instance) return transform;

      // Calculate proposed position in mm
      const deltaXmm = transform.x / (pixelRatio * zoom);
      const deltaYmm = transform.y / (pixelRatio * zoom);

      const proposedX = instance.position.x + deltaXmm;
      const proposedY = instance.position.y + deltaYmm;

      const result = calculateSnap(
        instance,
        { x: proposedX, y: proposedY },
        instances,
        wall.dimensions
      );
      
      // Store result for drag end
      lastSnapResultRef.current = { x: result.x, y: result.y };

      // Update guides if different
      // Debounce or check equality to avoid excess re-renders
      const guidesChanged = 
        result.guides.length !== alignmentGuides.length ||
        !result.guides.every((g, i) => {
          const other = alignmentGuides[i];
          if (g.type !== other.type) return false;
          // treat undefined and null the same for position checks
          const pos1 = g.position ?? null;
          const pos2 = other.position ?? null;
          
          if (pos1 === null && pos2 === null) return true;
          if (pos1 === null || pos2 === null) return false;
          
          return Math.abs(pos1 - pos2) < 0.001;
        });

      if (guidesChanged) {
        requestAnimationFrame(() => setAlignmentGuides(result.guides));
      } else if (result.guides.length === 0 && alignmentGuides.length > 0) {
         requestAnimationFrame(() => setAlignmentGuides([]));
      }

      // Convert back to transform pixels
      const snappedDeltaXmm = result.x - instance.position.x;
      const snappedDeltaYmm = result.y - instance.position.y;
      
      return {
        ...transform,
        x: snappedDeltaXmm * pixelRatio * zoom,
        y: snappedDeltaYmm * pixelRatio * zoom,
      };

    },
    [instances, wall.dimensions, alignmentGuides, setAlignmentGuides, showSmartGuides, pixelRatio, zoom]
  );

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
        // mode: 'free', // removed as it is not part of UIState
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
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[snapToGridModifier]}
      onDragStart={handleDragStart}
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

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {draggedTemplate ? (
          <div
            style={{
              width: `${draggedTemplate.dimensions.width * pixelRatio * zoom}px`,
              height: `${draggedTemplate.dimensions.height * pixelRatio * zoom}px`,
              border: `${Math.max(1, draggedTemplate.borderWidth * pixelRatio * zoom)}px solid ${draggedTemplate.borderColor}`,
              backgroundColor: '#ffffff',
              opacity: 0.8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {draggedTemplate.imageUrl ? (
              <img
                src={draggedTemplate.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Preview</span>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
