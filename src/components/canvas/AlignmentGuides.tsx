import React from 'react';
import type { AlignmentGuide, Dimensions } from '../../types';
import { mmToPixels } from '../../utils/geometry';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  wallDimensions: Dimensions;
  pixelRatio: number;
  zoom: number; // kept for interface consistency but not used (parent applies zoom)
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  guides,
  wallDimensions,
  pixelRatio,
}) => {
  if (guides.length === 0) {
    return null;
  }

  // zoom applied by parent transform, use 1
  const wallWidthPx = mmToPixels(wallDimensions.width, pixelRatio, 1);
  const wallHeightPx = mmToPixels(wallDimensions.height, pixelRatio, 1);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${wallWidthPx}px`,
        height: `${wallHeightPx}px`,
        pointerEvents: 'none',
      }}
    >
      {guides.map((guide, idx) => {
        if (guide.type === 'vertical') {
          const x = mmToPixels(guide.position, pixelRatio, 1);
          return (
            <line
              key={`guide-${idx}`}
              x1={x}
              y1={0}
              x2={x}
              y2={wallHeightPx}
              stroke="#ff00ff"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.8}
            />
          );
        } else {
          const y = mmToPixels(guide.position, pixelRatio, 1);
          return (
            <line
              key={`guide-${idx}`}
              x1={0}
              y1={y}
              x2={wallWidthPx}
              y2={y}
              stroke="#00ffff"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.8}
            />
          );
        }
      })}
    </svg>
  );
};
