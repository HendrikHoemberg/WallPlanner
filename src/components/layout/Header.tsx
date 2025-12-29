import { FileX, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import React from 'react';
import { useUnitConversion } from '../../hooks/useUnitConversion';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNewProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject }) => {
  const { viewport, setZoom, toggleGrid, mode, setMode } = useUIStore();
  const { currentSystem, toggleSystem } = useUnitConversion();

  const handleZoomIn = () => {
    setZoom(viewport.zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(viewport.zoom - 0.1);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleFitToView = () => {
    // This will be enhanced later with actual content dimensions
    setZoom(1);
  };

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Wall Planner</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={onNewProject}
            icon={<FileX size={16} />}
            title="New Project"
          >
            New
          </Button>
        </div>

        {/* Center controls - Zoom */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
            icon={<ZoomOut size={16} />}
            title="Zoom Out"
          />
          <span className="min-w-[60px] text-center text-sm font-medium text-gray-700">
            {zoomPercent}%
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            icon={<ZoomIn size={16} />}
            title="Zoom In"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            100%
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFitToView}
            icon={<Maximize size={16} />}
            title="Fit to View"
          />
        </div>

        {/* Right controls - Mode and Units */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={mode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => setMode(mode === 'grid' ? 'free' : 'grid')}
          >
            {mode === 'grid' ? 'Grid' : 'Free'} Mode
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleSystem}
          >
            {currentSystem === 'metric' ? 'Metric' : 'Imperial'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleGrid}
          >
            Toggle Grid
          </Button>
        </div>
      </div>
    </header>
  );
};
