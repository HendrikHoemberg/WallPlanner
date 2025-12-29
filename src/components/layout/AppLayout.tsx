import React from 'react';
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
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header onNewProject={onNewProject} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          {leftSidebar || <div className="p-4 text-gray-400">Frame Library</div>}
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden bg-gray-100">
          {canvas || <div className="w-full h-full" />}
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          {rightSidebar || <div className="p-4 text-gray-400">Properties</div>}
        </aside>
      </div>
    </div>
  );
};

export default AppLayout;
