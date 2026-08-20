import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface FolderViewToggleProps {
  viewMode: 'grid' | 'list';
  onToggle: (mode: 'grid' | 'list') => void;
}

export const FolderViewToggle: React.FC<FolderViewToggleProps> = ({
  viewMode,
  onToggle,
}) => {
  return (
    <div
      id="folder-view-toggle"
      className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
      role="group"
      aria-label="Toggle view display mode"
    >
      <button
        type="button"
        onClick={() => onToggle('list')}
        id="btn-view-list"
        aria-pressed={viewMode === 'list'}
        aria-label="List view"
        className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          viewMode === 'list'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('grid')}
        id="btn-view-grid"
        aria-pressed={viewMode === 'grid'}
        aria-label="Grid view"
        className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          viewMode === 'grid'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </button>
    </div>
  );
};
