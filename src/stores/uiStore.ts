import { create } from 'zustand';
import { DEFAULT_GRID_SIZE_MM, MAX_ZOOM, MIN_ZOOM } from '../constants';
import type { GridConfig, InteractionMode, Position, UIState, ViewportState } from '../types';

interface UIStoreState extends UIState {
  viewport: ViewportState;
  gridConfig: GridConfig;
  pixelRatio: number;
  setMode: (mode: InteractionMode) => void;
  selectFrame: (id: string | null) => void;
  selectWall: () => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setPan: (offset: Position) => void;
  resetViewport: () => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  toggleGrid: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setShowSmartGuides: (show: boolean) => void;
  setPixelRatio: (ratio: number) => void;
}

const defaultViewport: ViewportState = {
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
};

const defaultGridConfig: GridConfig = {
  enabled: true,
  cellSize: DEFAULT_GRID_SIZE_MM,
  snapToGrid: true,
  showGrid: true,
  gridColor: '#9ca3af',
};

export const useUIStore = create<UIStoreState>((set) => ({
  mode: 'free',
  selectedFrameId: null,
  selectedElement: null,
  isDragging: false,
  showSmartGuides: false,
  viewport: defaultViewport,
  gridConfig: defaultGridConfig,
  pixelRatio: 0.5,

  setMode: (mode: InteractionMode) => set({ mode }),

  selectFrame: (id: string | null) =>
    set({
      selectedFrameId: id,
      selectedElement: id ? 'frame' : null,
    }),

  selectWall: () =>
    set({
      selectedFrameId: null,
      selectedElement: 'wall',
    }),

  clearSelection: () =>
    set({
      selectedFrameId: null,
      selectedElement: null,
    }),

  setZoom: (zoom: number) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(
          state.viewport.minZoom,
          Math.min(zoom, state.viewport.maxZoom)
        ),
      },
    })),

  setPan: (offset: Position) =>
    set((state) => ({
      viewport: { ...state.viewport, panOffset: offset },
    })),

  resetViewport: () =>
    set({
      viewport: defaultViewport,
    }),

  setGridConfig: (config: Partial<GridConfig>) =>
    set((state) => ({
      gridConfig: { ...state.gridConfig, ...config },
    })),

  toggleGrid: () =>
    set((state) => ({
      gridConfig: {
        ...state.gridConfig,
        enabled: !state.gridConfig.enabled,
        showGrid: !state.gridConfig.showGrid,
      },
    })),

  setIsDragging: (isDragging: boolean) => set({ isDragging }),

  setShowSmartGuides: (show: boolean) => set({ showSmartGuides: show }),

  setPixelRatio: (ratio: number) => set({ pixelRatio: ratio }),
}));
