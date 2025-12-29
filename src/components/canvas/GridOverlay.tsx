import React, { useMemo } from 'react';
import type { Dimensions, GridConfig } from '../../types';
import { mmToPixels } from '../../utils/geometry';

interface GridOverlayProps {
  wallDimensions: Dimensions;
  gridConfig: GridConfig;
  pixelRatio: number;
  zoom: number; // kept for interface consistency but not used (parent applies zoom)
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  wallDimensions,
  gridConfig,
  pixelRatio,
}) => {
  if (!gridConfig.showGrid) {
    return null;
  }

  const cellSizePx = mmToPixels(gridConfig.cellSize, pixelRatio, 1);
  const wallWidthPx = mmToPixels(wallDimensions.width, pixelRatio, 1);
  const wallHeightPx = mmToPixels(wallDimensions.height, pixelRatio, 1);

  // Use CSS linear gradients for the grid - no encoding issues
  const gridStyle = useMemo(() => {
    const color = gridConfig.gridColor;
    return {
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${cellSizePx}px ${cellSizePx}px`,
    };
  }, [gridConfig.gridColor, cellSizePx]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${wallWidthPx}px`,
        height: `${wallHeightPx}px`,
        ...gridStyle,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
};
