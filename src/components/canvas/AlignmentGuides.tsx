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
          const x = mmToPixels(guide.position || 0, pixelRatio, 1);
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
        } else if (guide.type === 'horizontal') {
          const y = mmToPixels(guide.position || 0, pixelRatio, 1);
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
        } else if (guide.type === 'spacing-x' && guide.regions) {
          const y = mmToPixels(guide.position || 0, pixelRatio, 1);
          return (
            <g key={`guide-${idx}`}>
              {guide.regions.map((region, rIdx) => {
                const x1 = mmToPixels(region.start, pixelRatio, 1);
                const size = mmToPixels(region.size, pixelRatio, 1);
                const x2 = x1 + size;
                return (
                  <React.Fragment key={`region-${rIdx}`}>
                    <line x1={x1} y1={y} x2={x2} y2={y} stroke="#ff9900" strokeWidth={2} />
                    <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="#ff9900" strokeWidth={2} />
                    <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke="#ff9900" strokeWidth={2} />
                  </React.Fragment>
                );
              })}
            </g>
          );
        } else if (guide.type === 'spacing-y' && guide.regions) {
          const x = mmToPixels(guide.position || 0, pixelRatio, 1);
          return (
            <g key={`guide-${idx}`}>
              {guide.regions.map((region, rIdx) => {
                const y1 = mmToPixels(region.start, pixelRatio, 1);
                const size = mmToPixels(region.size, pixelRatio, 1);
                const y2 = y1 + size;
                return (
                  <React.Fragment key={`region-${rIdx}`}>
                    <line x1={x} y1={y1} x2={x} y2={y2} stroke="#ff9900" strokeWidth={2} />
                    <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} stroke="#ff9900" strokeWidth={2} />
                    <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke="#ff9900" strokeWidth={2} />
                  </React.Fragment>
                );
              })}
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};
