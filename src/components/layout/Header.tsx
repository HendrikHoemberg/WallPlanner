import { FileX, Maximize, Menu, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNewProject?: () => void;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}) => {
  const { viewport, setZoom } = useUIStore();

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
          {/* Mobile Left Sidebar Toggle */}
          <div className="md:hidden">
            <Button
              size="sm"
              variant="secondary"
              onClick={onToggleLeftSidebar}
              icon={<Menu size={20} />}
              title="Menu"
            />
          </div>

          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Wall Planner
          </h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={onNewProject}
            icon={<FileX size={16} />}
            title="New Project"
          >
            <span className="hidden sm:inline">New</span>
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
          <span className="min-w-[60px] text-center text-sm font-medium text-gray-700 hidden sm:block">
            {zoomPercent}%
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            icon={<ZoomIn size={16} />}
            title="Zoom In"
          />
          <div className="hidden sm:block">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResetZoom}
              title="Reset Zoom"
            >
              100%
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFitToView}
            icon={<Maximize size={16} />}
            title="Fit to View"
          />

          {/* Mobile Right Sidebar Toggle */}
          <div className="md:hidden ml-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onToggleRightSidebar}
              icon={<Settings size={20} />}
              title="Properties"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
