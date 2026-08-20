import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSubject } from '../hooks/useSubject';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { FolderCard, FolderRow } from '../components/folders/FolderCard';
import { FolderViewToggle } from '../components/folders/FolderViewToggle';
import { FolderListSkeleton } from '../components/ui/Skeletons';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { Folder, Search, Filter } from 'lucide-react';

export const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { subject, rootFolders, isLoading, error, refetch } = useSubject(subjectId);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [folderQuery, setFolderQuery] = useState('');

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
        <div className="h-4 bg-slate-200 rounded w-48 animate-pulse mb-4" />
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse mb-6" />
        <FolderListSkeleton count={4} />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Subject not found"
          message={error || "We couldn't find the requested academic subject."}
          onRetry={refetch}
        />
      </div>
    );
  }

  const filteredFolders = rootFolders.filter((f) =>
    f.name.toLowerCase().includes(folderQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(folderQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            name: subject.name,
            url: `/subject/${subject.id}`,
            isCurrent: true,
          },
        ]}
      />

      {/* Subject Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {subject.semester && (
              <Badge variant="blue" size="md">
                {subject.semester}
              </Badge>
            )}
            {subject.code && (
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {subject.code}
              </span>
            )}
            {subject.department && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {subject.department}
              </span>
            )}
          </div>

          <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
            {subject.resourceCount || 0} Academic Resources
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight leading-tight">
          {subject.name}
        </h1>

        {subject.description && (
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {subject.description}
          </p>
        )}
      </div>

      {/* Folders Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
            Academic Folders
          </h2>
          <span className="text-xs text-slate-400 font-medium ml-1">
            ({filteredFolders.length})
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick folder filter input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={folderQuery}
              onChange={(e) => setFolderQuery(e.target.value)}
              placeholder="Filter folders..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Grid / List Mode */}
          <FolderViewToggle viewMode={viewMode} onToggle={setViewMode} />
        </div>
      </div>

      {/* Folders List/Grid */}
      {filteredFolders.length === 0 ? (
        <EmptyState
          title={folderQuery ? "No matching folders" : "No folders found"}
          description={folderQuery ? `No folders match "${folderQuery}" in this subject.` : "This subject has no academic folders assigned yet."}
          actionLabel={folderQuery ? "Clear Filter" : undefined}
          onAction={() => setFolderQuery('')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              subjectId={subject.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFolders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              subjectId={subject.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
