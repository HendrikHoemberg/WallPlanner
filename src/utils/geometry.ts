import type { Dimensions, Position } from '../types';

// Calculate pixel ratio based on wall dimensions and viewport
export function calculatePixelRatio(
  wallDimensions: Dimensions,
  viewportSize: { width: number; height: number }
): number {
  // Try to fit the wall with some padding
  const padding = 0.9;
  const ratioX = (viewportSize.width * padding) / wallDimensions.width;
  const ratioY = (viewportSize.height * padding) / wallDimensions.height;

  // Use the smaller ratio to ensure the wall fits
  return Math.min(ratioX, ratioY);
}

// Convert screen coordinates to wall coordinates (mm)
export function screenToWall(
  screenPos: Position,
  pixelRatio: number,
  zoom: number,
  panOffset: Position
): Position {
  return {
    x: (screenPos.x - panOffset.x) / (pixelRatio * zoom),
    y: (screenPos.y - panOffset.y) / (pixelRatio * zoom),
  };
}

// Convert wall coordinates (mm) to screen coordinates
export function wallToScreen(
  wallPos: Position,
  pixelRatio: number,
  zoom: number,
  panOffset: Position
): Position {
  return {
    x: wallPos.x * pixelRatio * zoom + panOffset.x,
    y: wallPos.y * pixelRatio * zoom + panOffset.y,
  };
}

// Convert mm to pixels for rendering
export function mmToPixels(mm: number, pixelRatio: number, zoom: number): number {
  return mm * pixelRatio * zoom;
}

// Convert pixels to mm
export function pixelsToMm(pixels: number, pixelRatio: number, zoom: number): number {
  return pixels / (pixelRatio * zoom);
}

// Get frame edges
interface FrameEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export function getFrameEdges(
  position: Position,
  dimensions: Dimensions
): FrameEdges {
  return {
    left: position.x,
    right: position.x + dimensions.width,
    top: position.y,
    bottom: position.y + dimensions.height,
    centerX: position.x + dimensions.width / 2,
    centerY: position.y + dimensions.height / 2,
  };
}
