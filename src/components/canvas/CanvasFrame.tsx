import { useDraggable } from '@dnd-kit/core';
import React, { useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { useUIStore } from '../../stores/uiStore';
import type { FrameInstance, FrameTemplate } from '../../types';
import { mmToPixels } from '../../utils/geometry';

interface CanvasFrameProps {
  frame: FrameInstance;
  template: FrameTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export const CanvasFrame: React.FC<CanvasFrameProps> = ({
  frame,
  isSelected,
  onSelect,
}) => {
  const { pixelRatio } = useCanvasContext();
  const zoom = useUIStore((state) => state.viewport.zoom);
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `frame-${frame.id}`,
    data: { type: 'instance', instanceId: frame.id },
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect]
  );

  // Convert mm to pixels (zoom is applied by parent transform, so use 1)
  const leftPx = mmToPixels(frame.position.x, pixelRatio, 1);
  const topPx = mmToPixels(frame.position.y, pixelRatio, 1);
  const widthPx = mmToPixels(frame.dimensions.width, pixelRatio, 1);
  const heightPx = mmToPixels(frame.dimensions.height, pixelRatio, 1);
  const borderWidthPx = Math.max(1, mmToPixels(frame.borderWidth, pixelRatio, 1));

  // Apply transform from dnd-kit during drag
  // Divide by zoom to compensate for the parent container's CSS scale transform
  // dnd-kit's transform is in screen pixels, but we're inside a scaled container
  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0) rotate(${frame.rotation}deg)`,
        transition: isDragging ? 'none' : undefined,
      }
    : {
        transform: `rotate(${frame.rotation}deg)`,
      };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        border: `${borderWidthPx}px solid ${frame.borderColor}`,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        zIndex: isDragging ? 9999 : frame.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isSelected ? '0 0 0 2px #3b82f6' : isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        transformOrigin: 'center',
        ...dragStyle,
      }}
      className="group"
    >
      {/* Image content */}
      {frame.imageUrl && (
        <img
          src={frame.imageUrl}
          alt="Frame content"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Resize handles (visual only, for future implementation) */}
      {isSelected && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '-4px',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
};
