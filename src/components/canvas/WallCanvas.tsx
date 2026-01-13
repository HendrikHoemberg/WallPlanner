import { useDroppable } from '@dnd-kit/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasContext } from '../../contexts/CanvasContext';
import { useZoomPan } from '../../hooks/useZoomPan';
import { useUIStore } from '../../stores/uiStore';
import type { WallConfig } from '../../types';
import { calculatePixelRatio, mmToPixels } from '../../utils/geometry';
import { AlignmentGuides } from './AlignmentGuides';

interface WallCanvasProps {
  wall: WallConfig;
  children?: React.ReactNode;
}

export const WallCanvas: React.FC<WallCanvasProps> = ({ wall, children }) => {
  const { containerRef, zoom, panOffset } = useZoomPan();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectWall, setPixelRatio: setStorePixelRatio, setPan, alignmentGuides } = useUIStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'wall-canvas',
  });
  const [pixelRatio, setPixelRatio] = useState(0.5);

  // Calculate pixel ratio when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const newRatio = calculatePixelRatio(wall.dimensions, { width, height });
    setPixelRatio(newRatio);
    setStorePixelRatio(newRatio);

    // Center the wall in the viewport
    // We assume zoom is 1 because calculatePixelRatio is designed to fit the wall at 1x
    // If the wall dimensions change, we want to re-center securely.
    const wallWidthPx = wall.dimensions.width * newRatio;
    const wallHeightPx = wall.dimensions.height * newRatio;
    
    // Calculate centered position
    const panX = (width - wallWidthPx) / 2;
    const panY = (height - wallHeightPx) / 2;
    
    setPan({ x: panX, y: panY });

  }, [wall.dimensions, containerRef, setStorePixelRatio, setPan]);

  // Convert wall dimensions to pixels (zoom applied by CSS transform, use 1 here)
  const wallWidthPx = mmToPixels(wall.dimensions.width, pixelRatio, 1);
  const wallHeightPx = mmToPixels(wall.dimensions.height, pixelRatio, 1);

  // Handle canvas background click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.currentTarget === canvasRef.current) {
        selectWall();
      }
    },
    [selectWall]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Inner container for zoom/pan transforms */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: 'none',
        }}
      >
        {/* Wall container */}
        <div
          ref={(node) => {
            canvasRef.current = node;
            setNodeRef(node);
          }}
          onClick={handleCanvasClick}
          style={{
            width: `${wallWidthPx}px`,
            height: `${wallHeightPx}px`,
            backgroundColor: wall.backgroundColor,
            boxShadow: isOver
              ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(0, 0, 0, 0.15)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            cursor: 'default',
            transition: 'box-shadow 0.2s',
          }}
          className="relative"
        >
          {/* Alignment guides */}
          <AlignmentGuides
            guides={alignmentGuides}
            wallDimensions={wall.dimensions}
            pixelRatio={pixelRatio}
            zoom={zoom}
          />

          {/* Scale reference bar */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
            Scale: 1mm = {pixelRatio.toFixed(2)}px
          </div>

          {/* Frame instances */}
          <CanvasContext.Provider value={{ pixelRatio }}>
            {children}
          </CanvasContext.Provider>
        </div>
      </div>
    </div>
  );
};
