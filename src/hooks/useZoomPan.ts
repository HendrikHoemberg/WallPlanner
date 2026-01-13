import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../constants';
import { useUIStore } from '../stores/uiStore';
import type { Dimensions, Position } from '../types';

interface UseZoomPanOptions {
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (offset: Position) => void;
}

interface UseZoomPanReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  panOffset: Position;
  isPanning: boolean;
  handlers: {
    onWheel: (e: WheelEvent) => void;
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: () => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToView: (contentDimensions: Dimensions) => void;
}

export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, setZoom, setPan } = useUIStore();
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const spaceKeyRef = useRef(false);

  const minZoom = options.minZoom ?? MIN_ZOOM;
  const maxZoom = options.maxZoom ?? MAX_ZOOM;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Determine zoom direction (scroll up = zoom in)
      const isZoomingIn = e.deltaY < 0;
      const zoomDelta = isZoomingIn ? ZOOM_STEP : -ZOOM_STEP;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, viewport.zoom + zoomDelta));

      // Calculate new pan offset to zoom toward cursor
      const zoomRatio = newZoom / viewport.zoom;
      const newPanX =
        cursorX - (cursorX - viewport.panOffset.x) * zoomRatio;
      const newPanY =
        cursorY - (cursorY - viewport.panOffset.y) * zoomRatio;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });

      options.onZoomChange?.(newZoom);
      options.onPanChange?.({ x: newPanX, y: newPanY });
    },
    [viewport.zoom, viewport.panOffset, setZoom, setPan, minZoom, maxZoom, options]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Middle mouse button or space key + left click
      if (e.button === 1 || (e.button === 0 && (e.shiftKey || spaceKeyRef.current))) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX - viewport.panOffset.x,
          y: e.clientY - viewport.panOffset.y,
        };
        e.preventDefault();
      }
    },
    [viewport.panOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning || !panStartRef.current) return;

      const newPanX = e.clientX - panStartRef.current.x;
      const newPanY = e.clientY - panStartRef.current.y;

      setPan({ x: newPanX, y: newPanY });
      options.onPanChange?.({ x: newPanX, y: newPanY });
    },
    [isPanning, setPan, options]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      spaceKeyRef.current = true;
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      spaceKeyRef.current = false;
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp]);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(maxZoom, viewport.zoom + ZOOM_STEP);
    setZoom(newZoom);
    options.onZoomChange?.(newZoom);
  }, [viewport.zoom, maxZoom, setZoom, options]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(minZoom, viewport.zoom - ZOOM_STEP);
    setZoom(newZoom);
    options.onZoomChange?.(newZoom);
  }, [viewport.zoom, minZoom, setZoom, options]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    options.onZoomChange?.(1);
    options.onPanChange?.({ x: 0, y: 0 });
  }, [setZoom, setPan, options]);

  const fitToView = useCallback(
    (contentDimensions: Dimensions) => {
      if (!containerRef.current) return;

      const { width: containerWidth, height: containerHeight } =
        containerRef.current.getBoundingClientRect();

      const zoomX = (containerWidth * 0.9) / contentDimensions.width;
      const zoomY = (containerHeight * 0.9) / contentDimensions.height;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zoomX, zoomY)));

      const offsetX = (containerWidth - contentDimensions.width * newZoom) / 2;
      const offsetY = (containerHeight - contentDimensions.height * newZoom) / 2;

      setZoom(newZoom);
      setPan({ x: offsetX, y: offsetY });
      options.onZoomChange?.(newZoom);
      options.onPanChange?.({ x: offsetX, y: offsetY });
    },
    [minZoom, maxZoom, setZoom, setPan, options]
  );

  return {
    containerRef,
    zoom: viewport.zoom,
    panOffset: viewport.panOffset,
    isPanning,
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    zoomIn,
    zoomOut,
    resetView,
    fitToView,
  };
}
