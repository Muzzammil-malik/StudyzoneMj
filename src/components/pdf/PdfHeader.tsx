import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Download, Share2, ZoomIn, ZoomOut, Maximize2, Minimize2, Info } from 'lucide-react';
import { Resource } from '../../types/resource';
import { useIsBookmarked } from '../../hooks/useBookmarks';
import { useToast } from '../ui/Toast';
import { triggerPdfDownload } from '../../services/samplePdfGenerator';

interface PdfHeaderProps {
  resource: Resource;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  resource,
  zoomLevel,
  onZoomChange,
  isFullscreen,
  onToggleFullscreen,
  isInfoOpen,
  onToggleInfo,
}) => {
  const navigate = useNavigate();
  const { isBookmarked, toggle: toggleBookmark } = useIsBookmarked(resource.id);
  const { showToast } = useToast();

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.name,
          text: `Check out ${resource.name} on StudyZone MJCET`,
          url: shareUrl,
        });
        showToast('Resource link shared.', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Resource link copied.', 'success');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Resource link copied.', 'success');
    }
  };

  const handleDownload = () => {
    triggerPdfDownload(resource);
    showToast(`Downloading "${resource.name}"`, 'info');
  };

  const handleBookmarkToggle = async () => {
    const state = await toggleBookmark();
    showToast(state ? 'Added to your bookmarks' : 'Removed from bookmarks', 'info');
  };

  return (
    <header
      id="pdf-top-bar"
      className="bg-white border-b border-slate-200/90 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-2xs z-20"
    >
      {/* Left: Back & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          id="pdf-back-button"
          aria-label="Go back"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-sans font-semibold text-sm sm:text-base text-slate-900 truncate leading-snug">
            {resource.name}
          </h1>
          <div className="text-[11px] text-slate-400 truncate hidden sm:block">
            {resource.authorOrProfessor ? `${resource.authorOrProfessor} • ` : ''}
            {resource.pageCount ? `${resource.pageCount} Pages` : 'PDF Document'}
          </div>
        </div>
      </div>

      {/* Center Zoom Controls (Desktop) */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.6, zoomLevel - 0.15))}
          disabled={zoomLevel <= 0.6}
          aria-label="Zoom out"
          className="p-1.5 hover:bg-white hover:text-slate-900 rounded disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-mono font-medium text-[11px] min-w-[45px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(1.8, zoomLevel + 0.15))}
          disabled={zoomLevel >= 1.8}
          aria-label="Zoom in"
          className="p-1.5 hover:bg-white hover:text-slate-900 rounded disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleBookmarkToggle}
          id="pdf-btn-bookmark"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          id="pdf-btn-share"
          aria-label="Share resource"
          className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDownload}
          id="pdf-btn-download"
          aria-label="Download PDF"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button
          type="button"
          onClick={onToggleInfo}
          id="pdf-btn-info"
          aria-label="Toggle document information"
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isInfoOpen
              ? 'bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          id="pdf-btn-fullscreen"
          aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
          className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline-flex cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
