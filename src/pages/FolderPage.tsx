import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFolder } from '../hooks/useFolder';
import { Breadcrumb, BreadcrumbSegment } from '../components/ui/Breadcrumb';
import { FolderCard, FolderRow } from '../components/folders/FolderCard';
import { FileCard, FileRow } from '../components/files/FileCard';
import { FolderViewToggle } from '../components/folders/FolderViewToggle';
import { FolderListSkeleton, ResourceListSkeleton } from '../components/ui/Skeletons';
import { EmptyFolderState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Folder as FolderIcon, FileText, Search } from 'lucide-react';

export const FolderPage: React.FC = () => {
  const { subjectId, folderId } = useParams<{ subjectId: string; folderId: string }>();
  const {
    subject,
    currentFolder,
    folderHierarchy,
    subfolders,
    resources,
    isLoading,
    error,
    refetch,
  } = useFolder(subjectId, folderId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterQuery, setFilterQuery] = useState('');

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse mb-4" />
        <div className="h-8 bg-slate-200 rounded w-80 animate-pulse mb-6" />
        <FolderListSkeleton count={3} />
        <ResourceListSkeleton count={4} />
      </div>
    );
  }

  if (error || !currentFolder || !subject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Folder not found"
          message={error || "We couldn't locate this academic folder."}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Construct breadcrumbs
  const breadcrumbSegments: BreadcrumbSegment[] = [
    {
      name: subject.name,
      url: `/subject/${subject.id}`,
    },
  ];

  folderHierarchy.forEach((fld, idx) => {
    breadcrumbSegments.push({
      name: fld.name,
      url: `/subject/${subject.id}/folder/${fld.id}`,
      isCurrent: idx === folderHierarchy.length - 1,
    });
  });

  const filteredSubfolders = subfolders.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.tags?.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const hasItems = subfolders.length > 0 || resources.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 w-full">
      {/* Breadcrumb Path */}
      <Breadcrumb items={breadcrumbSegments} />

      {/* Folder Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-blue-600 font-semibold">{subject.name}</span>
          <span>•</span>
          <span>{currentFolder.itemCount || (subfolders.length + resources.length)} items</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight leading-tight flex items-center gap-3">
          <FolderIcon className="w-7 h-7 text-amber-500 fill-amber-500/20 shrink-0" />
          <span>{currentFolder.name}</span>
        </h1>

        {currentFolder.description && (
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {currentFolder.description}
          </p>
        )}
      </div>

      {/* Action Bar (Search filter + View Mode Toggle) */}
      {hasItems && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in this folder..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <FolderViewToggle viewMode={viewMode} onToggle={setViewMode} />
        </div>
      )}

      {/* Subfolders Section */}
      {subfolders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-amber-500" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Subfolders
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredSubfolders.length})
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSubfolders.map((fld) => (
                <FolderCard
                  key={fld.id}
                  folder={fld}
                  subjectId={subject.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubfolders.map((fld) => (
                <FolderRow
                  key={fld.id}
                  folder={fld}
                  subjectId={subject.id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* PDF Files / Resources Section */}
      {resources.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-500" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Academic Documents & PDFs
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredResources.length})
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((res) => (
                <FileCard
                  key={res.id}
                  resource={res}
                  subjectName={subject.name}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResources.map((res) => (
                <FileRow
                  key={res.id}
                  resource={res}
                  subjectName={subject.name}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {!hasItems && <EmptyFolderState />}
    </div>
  );
};
