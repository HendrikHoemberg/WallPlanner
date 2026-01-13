import { create } from 'zustand';
import { MAX_ZOOM, MIN_ZOOM } from '../constants';
import type { AlignmentGuide, Position, UIState, ViewportState } from '../types';

interface UIStoreState extends UIState {
  viewport: ViewportState;
  pixelRatio: number;
  alignmentGuides: AlignmentGuide[];
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  selectFrame: (id: string | null) => void;
  selectWall: () => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setPan: (offset: Position) => void;
  resetViewport: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setShowSmartGuides: (show: boolean) => void;
  setPixelRatio: (ratio: number) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  setLeftSidebarOpen: (isOpen: boolean) => void;
  setRightSidebarOpen: (isOpen: boolean) => void;
}

const defaultViewport: ViewportState = {
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
};

export const useUIStore = create<UIStoreState>((set) => ({
  selectedFrameId: null,
  selectedElement: null,
  isDragging: false,
  showSmartGuides: true,
  viewport: defaultViewport,
  pixelRatio: 0.5,
  alignmentGuides: [],
  isLeftSidebarOpen: false,
  isRightSidebarOpen: false,

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

  setIsDragging: (isDragging: boolean) => set({ isDragging }),

  setShowSmartGuides: (show: boolean) => set({ showSmartGuides: show }),


  setAlignmentGuides: (guides: AlignmentGuide[]) => set({ alignmentGuides: guides }),
  setPixelRatio: (ratio: number) => set({ pixelRatio: ratio }),
  
  setLeftSidebarOpen: (isOpen) => set({ isLeftSidebarOpen: isOpen }),
  setRightSidebarOpen: (isOpen) => set({ isRightSidebarOpen: isOpen }),
}));
