import React from 'react';
import { LucideIcon, FolderX, SearchX, BookmarkX, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderX,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      id="academic-empty-state"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white/70 border border-dashed border-slate-200 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const NoSearchResults: React.FC<{ query: string; onClear?: () => void }> = ({
  query,
  onClear,
}) => (
  <EmptyState
    icon={SearchX}
    title="No academic resources found"
    description={`We couldn't find any subjects, folders or PDF materials matching "${query}". Try searching by course code or unit topic.`}
    actionLabel={onClear ? 'Clear Search Query' : undefined}
    onAction={onClear}
  />
);

export const NoBookmarksEmpty: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={BookmarkX}
    title="You haven't bookmarked anything yet"
    description="Click the bookmark icon on any lecture note, question bank or lab manual to keep it handy for quick revision."
    actionLabel={onBrowse ? 'Browse Academic Subjects' : undefined}
    onAction={onBrowse}
  />
);

export const EmptyFolderState: React.FC = () => (
  <EmptyState
    icon={FileQuestion}
    title="This folder is empty"
    description="No notes or subfolders have been assigned to this unit yet. Check back soon or verify with your class representative."
  />
);
