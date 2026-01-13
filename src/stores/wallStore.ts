import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { DEFAULT_WALL_COLOR, DEFAULT_WALL_HEIGHT_MM, DEFAULT_WALL_WIDTH_MM } from '../constants';
import type { Dimensions, Unit, WallConfig } from '../types';

interface WallStoreState {
  wall: WallConfig;
  setDimensions: (dimensions: Dimensions) => void;
  setBackgroundColor: (color: string) => void;
  setDisplayUnit: (unit: Unit) => void;
  resetWall: () => void;
}

const createDefaultWall = (): WallConfig => ({
  id: uuidv4(),
  dimensions: { width: DEFAULT_WALL_WIDTH_MM, height: DEFAULT_WALL_HEIGHT_MM },
  backgroundColor: DEFAULT_WALL_COLOR,
  unitConfig: { displayUnit: 'cm' },
});

export const wallStore = create<WallStoreState>((set) => ({
  wall: createDefaultWall(),
  
  setDimensions: (dimensions: Dimensions) =>
    set((state) => ({
      wall: { ...state.wall, dimensions },
    })),
  
  setBackgroundColor: (color: string) =>
    set((state) => ({
      wall: { ...state.wall, backgroundColor: color },
    })),
  
  setDisplayUnit: (unit: Unit) =>
    set((state) => ({
      wall: {
        ...state.wall,
        unitConfig: { ...state.wall.unitConfig, displayUnit: unit },
      },
    })),
  
  resetWall: () => set({ wall: createDefaultWall() }),
}));
