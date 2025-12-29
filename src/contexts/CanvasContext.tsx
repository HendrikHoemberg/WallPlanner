import { createContext, useContext } from 'react';

interface CanvasContextValue {
  pixelRatio: number;
}

export const CanvasContext = createContext<CanvasContextValue>({
  pixelRatio: 0.5,
});

export const useCanvasContext = () => useContext(CanvasContext);
