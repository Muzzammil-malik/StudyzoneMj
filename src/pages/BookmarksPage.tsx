import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../hooks/useBookmarks';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { FileRow } from '../components/files/FileCard';
import { ResourceListSkeleton } from '../components/ui/Skeletons';
import { NoBookmarksEmpty } from '../components/ui/EmptyState';
import { Bookmark, Sparkles } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { bookmarks, isLoading } = useBookmarks();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
      <Breadcrumb
        items={[
          {
            name: 'Bookmarks',
            url: '/bookmarks',
            isCurrent: true,
          },
        ]}
      />

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-4.5 h-4.5 fill-blue-600" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bookmarked Resources
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Quickly access your saved lecture notes, question banks, and laboratory manuals.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-2xl font-bold font-mono text-blue-600">
            {bookmarks.length}
          </span>
          <p className="text-xs text-slate-400 font-medium">Saved Items</p>
        </div>
      </div>

      {isLoading ? (
        <ResourceListSkeleton count={4} />
      ) : bookmarks.length === 0 ? (
        <NoBookmarksEmpty onBrowse={() => navigate('/')} />
      ) : (
        <div className="space-y-2.5">
          {bookmarks.map(({ bookmark, resource, subject }) => (
            <FileRow
              key={bookmark.id}
              resource={resource}
              subjectName={subject?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};
