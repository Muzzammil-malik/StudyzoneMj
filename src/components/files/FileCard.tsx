import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Share2, Bookmark } from 'lucide-react';
import { Resource } from '../../types/resource';
import { useIsBookmarked } from '../../hooks/useBookmarks';
import { useToast } from '../ui/Toast';
import { downloadResource } from '../../services/fileService';
import { PdfThumbnail } from './PdfThumbnail';

interface FileCardProps {
  resource: Resource;
  subjectName?: string;
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return 'PDF';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export const FileCard: React.FC<FileCardProps> = ({ resource, subjectName }) => {
  const { isBookmarked, toggle: toggleBookmark } = useIsBookmarked(resource.id);
  const { showToast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/resource/${resource.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.name,
          text: `Check out ${resource.name} on StudyZone MJCET`,
          url: shareUrl,
        });
        showToast('Resource shared successfully.', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Resource link copied to clipboard.', 'success');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Resource link copied to clipboard.', 'success');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadResource(resource);
      showToast(`Downloading "${resource.name}"`, 'info');
    } catch (error) {
      console.error('PDF download failed', error);
      showToast('Unable to download this PDF.', 'error');
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = await toggleBookmark();
    showToast(
      nextState ? 'Resource added to bookmarks.' : 'Resource removed from bookmarks.',
      'info'
    );
  };

  return (
    <div
      id={`file-card-${resource.id}`}
      className="group bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between overflow-hidden"
    >
      <Link
        to={`/resource/${resource.id}`}
        className="block focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
        aria-label={`Open ${resource.name}`}
      >
        <PdfThumbnail fileUrl={resource.fileUrl} fileName={resource.name} />
        <div className="p-3.5">
          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 mt-0.5 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <h4 title={resource.name} className="font-sans font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate leading-snug">
                {resource.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="font-medium text-slate-600">{formatBytes(resource.fileSize)}</span>
                {resource.pageCount && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{resource.pageCount} pages</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-3.5 pb-3.5 flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5">
        <button
          type="button"
          onClick={handleBookmarkToggle}
          id={`btn-bookmark-${resource.id}`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleShare}
          id={`btn-share-${resource.id}`}
          aria-label="Share resource"
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          id={`btn-download-${resource.id}`}
          aria-label={`Download ${resource.name}`}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const FileRow: React.FC<FileCardProps> = ({ resource, subjectName }) => {
  const { isBookmarked, toggle: toggleBookmark } = useIsBookmarked(resource.id);
  const { showToast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/resource/${resource.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.name,
          text: `Check out ${resource.name} on StudyZone MJCET`,
          url: shareUrl,
        });
        showToast('Resource shared successfully.', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Resource link copied to clipboard.', 'success');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Resource link copied to clipboard.', 'success');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadResource(resource);
      showToast(`Downloading "${resource.name}"`, 'info');
    } catch (error) {
      console.error('PDF download failed', error);
      showToast('Unable to download this PDF.', 'error');
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = await toggleBookmark();
    showToast(
      nextState ? 'Resource added to bookmarks.' : 'Resource removed from bookmarks.',
      'info'
    );
  };

  return (
    <div
      id={`file-row-${resource.id}`}
      className="group flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-blue-300 rounded-xl transition-all duration-150 min-h-[56px]"
    >
      <Link
        to={`/resource/${resource.id}`}
        className="flex items-center gap-3.5 min-w-0 flex-1 mr-3 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-0.5"
      >
        <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-sans font-medium text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {resource.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <span className="font-medium text-slate-600">{formatBytes(resource.fileSize)}</span>
            {resource.pageCount && (
              <>
                <span className="text-slate-300">•</span>
                <span>{resource.pageCount} pages</span>
              </>
            )}
            {resource.authorOrProfessor && (
              <>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="truncate max-w-[180px] hidden md:inline">{resource.authorOrProfessor}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleBookmarkToggle}
          id={`row-btn-bookmark-${resource.id}`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-400 hover:text-slate-700'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          id={`row-btn-share-${resource.id}`}
          aria-label="Share resource"
          className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDownload}
          id={`row-btn-download-${resource.id}`}
          aria-label={`Download ${resource.name}`}
          className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
