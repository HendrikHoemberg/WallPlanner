import { useCallback, useMemo, useState } from 'react';
import type { AlignmentGuide, Dimensions, FrameInstance } from '../types';
import { getFrameEdges } from '../utils/geometry';

const ALIGNMENT_THRESHOLD = 20; // mm tolerance

interface UseAlignmentGuidesReturn {
  guides: AlignmentGuide[];
  calculateGuides: (
    movingFrame: FrameInstance,
    otherFrames: FrameInstance[],
    wallDimensions: Dimensions
  ) => void;
  clearGuides: () => void;
}

export function useAlignmentGuides(): UseAlignmentGuidesReturn {
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);

  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  const calculateGuides = useCallback(
    (movingFrame: FrameInstance, otherFrames: FrameInstance[], wallDimensions: Dimensions) => {
      const alignmentGuides: AlignmentGuide[] = [];

      const movingEdges = getFrameEdges(movingFrame.position, movingFrame.dimensions);

      // Check alignment with other frames
      for (const targetFrame of otherFrames) {
        const targetEdges = getFrameEdges(targetFrame.position, targetFrame.dimensions);

        // Vertical alignments
        // Left edges
        if (Math.abs(movingEdges.left - targetEdges.left) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'vertical',
            position: targetEdges.left,
            alignmentType: 'left',
          });
        }

        // Center alignment
        if (Math.abs(movingEdges.centerX - targetEdges.centerX) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'vertical',
            position: targetEdges.centerX,
            alignmentType: 'center',
          });
        }

        // Right edges
        if (Math.abs(movingEdges.right - targetEdges.right) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'vertical',
            position: targetEdges.right,
            alignmentType: 'right',
          });
        }

        // Horizontal alignments
        // Top edges
        if (Math.abs(movingEdges.top - targetEdges.top) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'horizontal',
            position: targetEdges.top,
            alignmentType: 'top',
          });
        }

        // Middle alignment
        if (Math.abs(movingEdges.centerY - targetEdges.centerY) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'horizontal',
            position: targetEdges.centerY,
            alignmentType: 'middle',
          });
        }

        // Bottom edges
        if (Math.abs(movingEdges.bottom - targetEdges.bottom) < ALIGNMENT_THRESHOLD) {
          alignmentGuides.push({
            type: 'horizontal',
            position: targetEdges.bottom,
            alignmentType: 'bottom',
          });
        }
      }

      // Check alignment with wall edges/center
      // Wall left/right/center
      if (Math.abs(movingEdges.left - 0) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'vertical',
          position: 0,
          alignmentType: 'left',
        });
      }

      if (Math.abs(movingEdges.centerX - wallDimensions.width / 2) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'vertical',
          position: wallDimensions.width / 2,
          alignmentType: 'center',
        });
      }

      if (Math.abs(movingEdges.right - wallDimensions.width) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'vertical',
          position: wallDimensions.width,
          alignmentType: 'right',
        });
      }

      // Wall top/bottom/middle
      if (Math.abs(movingEdges.top - 0) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'horizontal',
          position: 0,
          alignmentType: 'top',
        });
      }

      if (Math.abs(movingEdges.centerY - wallDimensions.height / 2) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'horizontal',
          position: wallDimensions.height / 2,
          alignmentType: 'middle',
        });
      }

      if (Math.abs(movingEdges.bottom - wallDimensions.height) < ALIGNMENT_THRESHOLD) {
        alignmentGuides.push({
          type: 'horizontal',
          position: wallDimensions.height,
          alignmentType: 'bottom',
        });
      }

      setGuides(alignmentGuides);
    },
    []
  );

  return useMemo(
    () => ({
      guides,
      calculateGuides,
      clearGuides,
    }),
    [guides, calculateGuides, clearGuides]
  );
}
