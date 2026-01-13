// Unit Types
export type Unit = 'mm' | 'cm' | 'm';

export interface UnitConfig {
  displayUnit: Unit;
}

// Coordinate and Dimension Types
// All internal values stored in millimeters (mm) as base unit
export interface Position {
  x: number; // mm from left edge of wall
  y: number; // mm from top edge of wall
}

export interface Dimensions {
  width: number; // mm
  height: number; // mm
}

// Wall Configuration
export interface WallConfig {
  id: string;
  dimensions: Dimensions; // Wall size in mm (base unit)
  backgroundColor: string; // Wall color (e.g., '#f5f5f5')
  unitConfig: UnitConfig; // Current display unit settings
}

// Frame Template
export interface FrameTemplate {
  id: string;
  name: string;
  dimensions: Dimensions; // Frame size in mm
  borderColor: string;
  borderWidth: number; // mm
  imageUrl?: string; // Optional uploaded image (base64 or blob URL)
  createdAt: number; // timestamp
}

// Frame Instance (placed on canvas)
export interface FrameInstance {
  id: string;
  templateId: string; // Reference to FrameTemplate
  position: Position; // Position on wall in mm
  dimensions: Dimensions; // Can override template dimensions
  borderColor: string; // Can override template color
  borderWidth: number;
  imageUrl?: string; // Can override template image
  rotation: number; // Degrees (0, 90, 180, 270)
  zIndex: number; // Layering order
}

// Canvas/Viewport State
export interface ViewportState {
  zoom: number; // Scale factor (1 = 100%)
  panOffset: Position; // Current pan offset in screen pixels
  minZoom: number;
  maxZoom: number;
}

export interface UIState {
  selectedFrameId: string | null;
  selectedElement: 'wall' | 'frame' | null;
  isDragging: boolean;
  showSmartGuides: boolean;
}

// Alignment Guide
export type GuideType = 'vertical' | 'horizontal';
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export interface AlignmentGuide {
  type: GuideType;
  position: number; // mm from edge
  alignmentType: AlignmentType;
}

// Project/Persistence
export interface ProjectData {
  version: string;
  wall: WallConfig;
  frameTemplates: FrameTemplate[];
  frameInstances: FrameInstance[];
  viewport: ViewportState;
  lastSaved: number; // timestamp
}
