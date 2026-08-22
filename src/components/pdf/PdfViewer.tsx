import React, { useState, useEffect } from 'react';
import { Resource } from '../../types/resource';
import { Subject } from '../../types/subject';
import { Folder } from '../../types/folder';
import { PdfHeader } from './PdfHeader';
import { PdfInfoPanel } from './PdfInfoPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfViewerProps {
  resource: Resource;
  subject?: Subject | null;
  folder?: Folder | null;
  folderHierarchy?: Folder[];
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  resource,
  subject,
  folder,
  folderHierarchy = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const totalPages = resource.pageCount || 1;

  // Keyboard navigation for page flip (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="academic-pdf-viewer-root"
      className="flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] bg-slate-100 overflow-hidden"
    >
      {/* Top Header */}
      <PdfHeader
        resource={resource}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isInfoOpen={isInfoOpen}
        onToggleInfo={() => setIsInfoOpen((prev) => !prev)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Page View Area */}
        <div
          id="pdf-scroll-viewport"
          className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start relative"
        >
          <iframe
            title={resource.title || resource.name}
            src={`${resource.fileUrl}#page=${currentPage}&zoom=${Math.round(zoomLevel * 100)}`}
            className="w-full max-w-5xl min-h-[75vh] bg-white border border-slate-200 shadow-sm"
          />
        </div>

        {/* Info Sidebar */}
        <PdfInfoPanel
          resource={resource}
          subject={subject}
          folder={folder}
          folderHierarchy={folderHierarchy}
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
        />
      </div>

      {/* Bottom Floating Page Navigator */}
      <footer
        id="pdf-page-toolbar"
        className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2 flex items-center justify-between gap-4 z-20 shrink-0"
      >
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Use ← / → keys or buttons to navigate pages
        </div>

        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            id="pdf-btn-prev-page"
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= totalPages) setCurrentPage(val);
              }}
              className="w-8 text-center bg-white border border-slate-300 rounded font-semibold text-slate-900 py-0.5 outline-none"
              aria-label="Current page number"
            />
            <span className="text-slate-400">/ {totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            id="pdf-btn-next-page"
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </footer>
    </div>
  );
};
