import type { AlignmentGuide, Dimensions, FrameInstance, Position } from '../types';
import { getFrameEdges } from './geometry';

const SNAP_THRESHOLD_MM = 5; // Snapping distance in mm
const GUIDE_MATCH_THRESHOLD = 0.1;

interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function calculateSnap(
  movingInstance: FrameInstance,
  proposedPosition: Position,
  otherInstances: FrameInstance[],
  wallDimensions: Dimensions,
  threshold: number = SNAP_THRESHOLD_MM
): SnapResult {
  const guides: AlignmentGuide[] = [];
  let snappedX = proposedPosition.x;
  let snappedY = proposedPosition.y;

  const movingEdges = getFrameEdges(proposedPosition, movingInstance.dimensions);
  const width = movingInstance.dimensions.width;
  const height = movingInstance.dimensions.height;

  // --- 1. X-AXIS SNAPPING (Vertical Alignment + Horizontal Spacing) ---
  const verticalTargets: { pos: number; type: 'left' | 'center' | 'right' }[] = [];
  verticalTargets.push({ pos: 0, type: 'left' });
  verticalTargets.push({ pos: wallDimensions.width / 2, type: 'center' });
  verticalTargets.push({ pos: wallDimensions.width, type: 'right' });

  for (const frame of otherInstances) {
    if (frame.id === movingInstance.id) continue;
    const edges = getFrameEdges(frame.position, frame.dimensions);
    verticalTargets.push({ pos: edges.left, type: 'left' });
    verticalTargets.push({ pos: edges.centerX, type: 'center' });
    verticalTargets.push({ pos: edges.right, type: 'right' });
  }

  let closestXDelta = Infinity;
  let finalSnapX = snappedX;

  // Alignment Loop X
  for (const target of verticalTargets) {
    const dLeft = target.pos - movingEdges.left;
    if (Math.abs(dLeft) < threshold && Math.abs(dLeft) < Math.abs(closestXDelta)) {
      closestXDelta = dLeft;
      finalSnapX = target.pos;
    }
    const dCenter = target.pos - movingEdges.centerX;
    if (Math.abs(dCenter) < threshold && Math.abs(dCenter) < Math.abs(closestXDelta)) {
      closestXDelta = dCenter;
      finalSnapX = target.pos - width / 2;
    }
    const dRight = target.pos - movingEdges.right;
    if (Math.abs(dRight) < threshold && Math.abs(dRight) < Math.abs(closestXDelta)) {
      closestXDelta = dRight;
      finalSnapX = target.pos - width;
    }
  }

  // Spacing Loop X
  const yOverlapping = otherInstances.filter(f => 
    f.id !== movingInstance.id &&
    intervalsOverlap(proposedPosition.y, proposedPosition.y + height, f.position.y, f.position.y + f.dimensions.height)
  );
  yOverlapping.sort((a, b) => a.position.x - b.position.x);

  for (let i = 0; i < yOverlapping.length - 1; i++) {
    const A = yOverlapping[i];
    const B = yOverlapping[i+1];
    const gapAB = B.position.x - (A.position.x + A.dimensions.width);
    
    // Case 1: M ... A ... B
    const t1 = A.position.x - gapAB - width;
    const diff1 = t1 - movingEdges.left;
    if (Math.abs(diff1) < threshold && Math.abs(diff1) < Math.abs(closestXDelta)) {
      closestXDelta = diff1;
      finalSnapX = t1;
    }
    // Case 2: A ... B ... M
    const t2 = B.position.x + B.dimensions.width + gapAB;
    const diff2 = t2 - movingEdges.left;
    if (Math.abs(diff2) < threshold && Math.abs(diff2) < Math.abs(closestXDelta)) {
      closestXDelta = diff2;
      finalSnapX = t2;
    }
    // Case 3: A ... M ... B
    const t3 = (B.position.x + (A.position.x + A.dimensions.width) - width) / 2;
    const diff3 = t3 - movingEdges.left;
    if (Math.abs(diff3) < threshold && Math.abs(diff3) < Math.abs(closestXDelta)) {
      closestXDelta = diff3;
      finalSnapX = t3;
    }
  }

  if (Math.abs(closestXDelta) < threshold) {
    snappedX = finalSnapX;
  }

  // Guides X (using snappedX)
  const finalEdgesX = getFrameEdges({x: snappedX, y: proposedPosition.y}, movingInstance.dimensions);

  // Alignment Guides X
  for (const target of verticalTargets) {
    if (
      Math.abs(finalEdgesX.left - target.pos) < GUIDE_MATCH_THRESHOLD ||
      Math.abs(finalEdgesX.centerX - target.pos) < GUIDE_MATCH_THRESHOLD ||
      Math.abs(finalEdgesX.right - target.pos) < GUIDE_MATCH_THRESHOLD
    ) {
      if (!guides.some(g => g.type === 'vertical' && Math.abs((g.position || 0) - target.pos) < GUIDE_MATCH_THRESHOLD)) {
        guides.push({ type: 'vertical', position: target.pos, alignmentType: target.type });
      }
    }
  }

  // Spacing Guides X
  for (let i = 0; i < yOverlapping.length - 1; i++) {
    const A = yOverlapping[i];
    const B = yOverlapping[i+1];
    const gapAB = B.position.x - (A.position.x + A.dimensions.width);
    const A_right = A.position.x + A.dimensions.width;
    const B_left = B.position.x;
    const B_right = B.position.x + B.dimensions.width;

    if (Math.abs(finalEdgesX.right - (A.position.x - gapAB)) < GUIDE_MATCH_THRESHOLD) {
      guides.push({ type: 'spacing-x', position: finalEdgesX.centerY, regions: [{ start: finalEdgesX.right, size: gapAB }, { start: A_right, size: gapAB }] });
    }
    if (Math.abs(finalEdgesX.left - (B_right + gapAB)) < GUIDE_MATCH_THRESHOLD) {
      guides.push({ type: 'spacing-x', position: finalEdgesX.centerY, regions: [{ start: A_right, size: gapAB }, { start: B_right, size: gapAB }] });
    }
    const gapAM = finalEdgesX.left - A_right;
    const gapMB = B_left - finalEdgesX.right;
    if (Math.abs(gapAM - gapMB) < GUIDE_MATCH_THRESHOLD && Math.abs(gapAM - gapAB/2) > 0.1) {
      guides.push({ type: 'spacing-x', position: finalEdgesX.centerY, regions: [{ start: A_right, size: gapAM }, { start: finalEdgesX.right, size: gapAM }] });
    }
  }

  // --- 2. Y-AXIS SNAPPING ---
  const horizontalTargets: { pos: number; type: 'top' | 'middle' | 'bottom' }[] = [];
  horizontalTargets.push({ pos: 0, type: 'top' });
  horizontalTargets.push({ pos: wallDimensions.height / 2, type: 'middle' });
  horizontalTargets.push({ pos: wallDimensions.height, type: 'bottom' });

  for (const frame of otherInstances) {
    if (frame.id === movingInstance.id) continue;
    const edges = getFrameEdges(frame.position, frame.dimensions);
    horizontalTargets.push({ pos: edges.top, type: 'top' });
    horizontalTargets.push({ pos: edges.centerY, type: 'middle' });
    horizontalTargets.push({ pos: edges.bottom, type: 'bottom' });
  }

  let closestYDelta = Infinity;
  let finalSnapY = snappedY;

  // Alignment Loop Y
  for (const target of horizontalTargets) {
    const dTop = target.pos - movingEdges.top;
    if (Math.abs(dTop) < threshold && Math.abs(dTop) < Math.abs(closestYDelta)) {
      closestYDelta = dTop;
      finalSnapY = target.pos;
    }
    const dMid = target.pos - movingEdges.centerY;
    if (Math.abs(dMid) < threshold && Math.abs(dMid) < Math.abs(closestYDelta)) {
      closestYDelta = dMid;
      finalSnapY = target.pos - height / 2;
    }
    const dBot = target.pos - movingEdges.bottom;
    if (Math.abs(dBot) < threshold && Math.abs(dBot) < Math.abs(closestYDelta)) {
      closestYDelta = dBot;
      finalSnapY = target.pos - height;
    }
  }

  // Spacing Loop Y (Use snappedX for overlap)
  const xOverlapping = otherInstances.filter(f => 
    f.id !== movingInstance.id &&
    intervalsOverlap(snappedX, snappedX + width, f.position.x, f.position.x + f.dimensions.width)
  );
  xOverlapping.sort((a, b) => a.position.y - b.position.y);

  for (let i = 0; i < xOverlapping.length - 1; i++) {
    const A = xOverlapping[i];
    const B = xOverlapping[i+1];
    const gapAB = B.position.y - (A.position.y + A.dimensions.height);

    const t1 = A.position.y - gapAB - height;
    const diff1 = t1 - movingEdges.top;
    if (Math.abs(diff1) < threshold && Math.abs(diff1) < Math.abs(closestYDelta)) {
      closestYDelta = diff1;
      finalSnapY = t1;
    }
    const t2 = B.position.y + B.dimensions.height + gapAB;
    const diff2 = t2 - movingEdges.top;
    if (Math.abs(diff2) < threshold && Math.abs(diff2) < Math.abs(closestYDelta)) {
      closestYDelta = diff2;
      finalSnapY = t2;
    }
    const t3 = (B.position.y + (A.position.y + A.dimensions.height) - height) / 2;
    const diff3 = t3 - movingEdges.top;
    if (Math.abs(diff3) < threshold && Math.abs(diff3) < Math.abs(closestYDelta)) {
      closestYDelta = diff3;
      finalSnapY = t3;
    }
  }

  if (Math.abs(closestYDelta) < threshold) {
    snappedY = finalSnapY;
  }

  // Guides Y
  const finalEdgesY = getFrameEdges({x: snappedX, y: snappedY}, movingInstance.dimensions);

  // Alignment Guides Y
  for (const target of horizontalTargets) {
    if (
      Math.abs(finalEdgesY.top - target.pos) < GUIDE_MATCH_THRESHOLD ||
      Math.abs(finalEdgesY.centerY - target.pos) < GUIDE_MATCH_THRESHOLD ||
      Math.abs(finalEdgesY.bottom - target.pos) < GUIDE_MATCH_THRESHOLD
    ) {
      if (!guides.some(g => g.type === 'horizontal' && Math.abs((g.position || 0) - target.pos) < GUIDE_MATCH_THRESHOLD)) {
        guides.push({ type: 'horizontal', position: target.pos, alignmentType: target.type });
      }
    }
  }

  // Spacing Guides Y
  for (let i = 0; i < xOverlapping.length - 1; i++) {
    const A = xOverlapping[i];
    const B = xOverlapping[i+1];
    const gapAB = B.position.y - (A.position.y + A.dimensions.height);
    const A_bottom = A.position.y + A.dimensions.height;
    const B_top = B.position.y;
    const B_bottom = B.position.y + B.dimensions.height;

    if (Math.abs(finalEdgesY.bottom - (A.position.y - gapAB)) < GUIDE_MATCH_THRESHOLD) {
      guides.push({ type: 'spacing-y', position: finalEdgesY.centerX, regions: [{ start: finalEdgesY.bottom, size: gapAB }, { start: A_bottom, size: gapAB }] });
    }
    if (Math.abs(finalEdgesY.top - (B_bottom + gapAB)) < GUIDE_MATCH_THRESHOLD) {
      guides.push({ type: 'spacing-y', position: finalEdgesY.centerX, regions: [{ start: A_bottom, size: gapAB }, { start: B_bottom, size: gapAB }] });
    }
    const gapAM = finalEdgesY.top - A_bottom;
    const gapMB = B_top - finalEdgesY.bottom;
    if (Math.abs(gapAM - gapMB) < GUIDE_MATCH_THRESHOLD  && Math.abs(gapAM - gapAB/2) > 0.1) {
      guides.push({ type: 'spacing-y', position: finalEdgesY.centerX, regions: [{ start: A_bottom, size: gapAM }, { start: finalEdgesY.bottom, size: gapAM }] });
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
}
