import React from 'react';
import { Link } from 'react-router-dom';
import { Folder as FolderIcon, ChevronRight } from 'lucide-react';
import { Folder } from '../../types/folder';

interface FolderCardProps {
  folder: Folder;
  subjectId: string;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, subjectId }) => {
  return (
    <Link
      to={`/subject/${subjectId}/folder/${folder.id}`}
      id={`folder-card-${folder.id}`}
      className="group flex flex-col justify-between p-4 bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[110px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
          <FolderIcon className="w-5 h-5 fill-current" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="mt-3">
        <h4 className="font-sans font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
          {folder.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span>{folder.itemCount ?? 0} {folder.itemCount === 1 ? 'item' : 'items'}</span>
          {folder.description && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate max-w-[140px]">{folder.description}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export const FolderRow: React.FC<FolderCardProps> = ({ folder, subjectId }) => {
  return (
    <Link
      to={`/subject/${subjectId}/folder/${folder.id}`}
      id={`folder-row-${folder.id}`}
      className="group flex items-center justify-between p-3.5 sm:p-4 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-blue-300 rounded-xl transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[48px]"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center shrink-0">
          <FolderIcon className="w-4.5 h-4.5 fill-amber-500/30 text-amber-600" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-sans font-medium text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {folder.name}
          </h4>
          {folder.description && (
            <p className="text-xs text-slate-500 truncate mt-0.5 hidden sm:block">
              {folder.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-3">
        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
          {folder.itemCount ?? 0} {folder.itemCount === 1 ? 'item' : 'items'}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};
