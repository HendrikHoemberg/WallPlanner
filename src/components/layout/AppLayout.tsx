import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Header } from './Header';

interface AppLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  canvas?: React.ReactNode;
  onNewProject?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  leftSidebar,
  rightSidebar,
  canvas,
  onNewProject,
}) => {
  const {
    isLeftSidebarOpen, setLeftSidebarOpen,
    isRightSidebarOpen, setRightSidebarOpen
  } = useUIStore();

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <Header
        onNewProject={onNewProject}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!isRightSidebarOpen)}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {(isLeftSidebarOpen || isRightSidebarOpen) && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
          w-64 bg-white border-r border-gray-200 overflow-y-auto
          fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-0
          ${isLeftSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}
        >
          {leftSidebar || (
            <div className="p-4 text-gray-400">Frame Library</div>
          )}
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden bg-gray-100 relative">
          {canvas || <div className="w-full h-full" />}
        </main>

        {/* Right Sidebar */}
        <aside
          className={`
          w-64 bg-white border-l border-gray-200 overflow-y-auto
          fixed inset-y-0 right-0 z-30 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-0
          ${isRightSidebarOpen ? 'translate-x-0 shadow-xl' : 'translate-x-full'}
        `}
        >
          {rightSidebar || <div className="p-4 text-gray-400">Properties</div>}
        </aside>
      </div>
    </div>
  );
};

export default AppLayout;
