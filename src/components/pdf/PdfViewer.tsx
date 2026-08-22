import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Resource } from '../../types/resource';
import { Subject } from '../../types/subject';
import { Folder } from '../../types/folder';
import { PdfHeader } from './PdfHeader';
import { PdfInfoPanel } from './PdfInfoPanel';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  resource: Resource;
  subject?: Subject | null;
  folder?: Folder | null;
  folderHierarchy?: Folder[];
}

interface PageShellProps {
  pageNumber: number;
  width: number;
  renderPage: boolean;
  register: (pageNumber: number, element: HTMLDivElement | null) => void;
}

const PageShell = React.memo(({ pageNumber, width, renderPage, register }: PageShellProps) => (
  <div
    ref={(element) => register(pageNumber, element)}
    data-page={pageNumber}
    className="w-full flex justify-center scroll-mt-4"
  >
    {renderPage ? (
      <Page
        pageNumber={pageNumber}
        width={width}
        renderAnnotationLayer
        renderTextLayer
        className="bg-white shadow-md"
        loading={<div className="w-full max-w-3xl aspect-[1/1.414] bg-white shadow-md animate-pulse" />}
      />
    ) : (
      <div className="w-full max-w-3xl aspect-[1/1.414] bg-white shadow-md" aria-hidden="true" />
    )}
  </div>
));

interface ThumbnailProps {
  pageNumber: number;
  active: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (pageNumber: number) => void;
}

const Thumbnail = React.memo(({ pageNumber, active, rootRef, onSelect }: ThumbnailProps) => {
  const thumbnailRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = useState(pageNumber <= 3);

  useEffect(() => {
    const element = thumbnailRef.current;
    const root = rootRef.current;
    if (!element || shouldRender || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { root, rootMargin: '240px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef, shouldRender]);

  return (
    <button
      ref={thumbnailRef}
      type="button"
      onClick={() => onSelect(pageNumber)}
      className={`block w-full p-1.5 rounded-lg transition-colors ${active ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-200'}`}
      aria-label={`Go to page ${pageNumber}`}
    >
      {shouldRender ? (
        <Page pageNumber={pageNumber} width={170} renderTextLayer={false} renderAnnotationLayer={false} className="bg-white shadow-sm mx-auto" />
      ) : (
        <div className="w-[170px] aspect-[1/1.414] bg-white rounded shadow-sm mx-auto" aria-hidden="true" />
      )}
      <span className="block text-[11px] font-semibold text-slate-600 mt-1">{pageNumber}</span>
    </button>
  );
});

const pageNumbers = (count: number) => Array.from({ length: count }, (_, index) => index + 1);
const pageWindow = (center: number, count: number, radius = 3) =>
  new Set(pageNumbers(count).filter((page) => Math.abs(page - center) <= radius));

export const PdfViewer: React.FC<PdfViewerProps> = ({ resource, subject, folder, folderHierarchy = [] }) => {
  const viewerRootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const thumbnailViewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const currentPageRef = useRef(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageCount, setPageCount] = useState(resource.pageCount || 1);
  const [pageWidth, setPageWidth] = useState(760);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(() => new Set([1, 2, 3]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const registerPage = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    pageRefs.current[pageNumber] = element;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateWidth = () => setPageWidth(Math.max(280, Math.min(860, viewport.clientWidth - 32)));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isSidebarOpen]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let nextPage: number | null = null;
        const nextPages = new Set<number>();
        entries.forEach((entry) => {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (entry.isIntersecting) {
            nextPages.add(page);
            [page - 1, page, page + 1].filter((value) => value > 0 && value <= pageCount).forEach((value) => nextPages.add(value));
            if (entry.intersectionRatio >= 0.35 && nextPage === null) nextPage = page;
          }
        });
        if (nextPage !== null && nextPage !== currentPageRef.current) {
          currentPageRef.current = nextPage;
          setCurrentPage(nextPage);
        }
        if (nextPage !== null) {
          setRenderedPages((previous) => {
            const next = pageWindow(nextPage as number, pageCount);
            return next.size === previous.size && [...next].every((page) => previous.has(page)) ? previous : next;
          });
        } else if (nextPages.size) {
          setRenderedPages((previous) => {
            const next = new Set(previous);
            nextPages.forEach((page) => next.add(page));
            return next;
          });
        }
      },
      { root: viewport, rootMargin: '900px 0px', threshold: [0.35] },
    );
    Object.values(pageRefs.current).forEach((page) => page && observer.observe(page as Element));
    return () => observer.disconnect();
  }, [pageCount]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        setZoomLevel((zoom) => Math.min(1.8, zoom + 0.15));
      } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setZoomLevel((zoom) => Math.max(0.6, zoom - 0.15));
      } else if (!event.ctrlKey && !event.metaKey && (event.key === '+' || event.key === '=')) {
        setZoomLevel((zoom) => Math.min(1.8, zoom + 0.15));
      } else if (!event.ctrlKey && !event.metaKey && event.key === '-') {
        setZoomLevel((zoom) => Math.max(0.6, zoom - 0.15));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === viewerRootRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    pageRefs.current = {};
    currentPageRef.current = 1;
    setCurrentPage(1);
    setPageCount(resource.pageCount || 1);
    setRenderedPages(new Set([1, 2, 3]));
    setPdfError(false);
  }, [resource.id, resource.fileUrl, resource.pageCount]);

  const scrollToPage = useCallback((page: number) => {
    setRenderedPages(pageWindow(page, pageCount));
    pageRefs.current[page]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    currentPageRef.current = page;
    setCurrentPage(page);
    setIsSidebarOpen(false);
  }, [pageCount]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await viewerRootRef.current?.requestFullscreen();
  };

  return (
    <div ref={viewerRootRef} id="academic-pdf-viewer-root" className="flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
      <PdfHeader resource={resource} zoomLevel={zoomLevel} onZoomChange={setZoomLevel} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} isInfoOpen={isInfoOpen} onToggleInfo={() => setIsInfoOpen((open) => !open)} onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
      <Document
        file={resource.fileUrl}
        onLoadSuccess={({ numPages }) => { setPageCount(numPages); setPdfError(false); }}
        onLoadError={(error) => { console.error('PDF.js failed to load document', error); setPdfError(true); }}
        loading={<div className="flex-1 bg-slate-200/70 p-4 sm:p-8"><div className="max-w-3xl mx-auto aspect-[1/1.414] bg-white rounded-sm shadow-md animate-pulse" /></div>}
        error={<div className="flex-1 bg-slate-200/70 p-12 text-center text-sm text-slate-600">Unable to load this PDF.<br />Please try again.</div>}
        className="flex-1 flex flex-col min-h-0"
      >
      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && <button type="button" aria-label="Close page thumbnails" onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 z-20 bg-slate-900/20 lg:hidden" />}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-slate-200 bg-slate-50 transition-transform duration-200 lg:relative lg:translate-x-0`}>
          <div className="px-4 py-3 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pages</div>
          <div ref={thumbnailViewportRef} className="h-[calc(100%-42px)] overflow-y-auto p-3 space-y-3">
            {pageNumbers(pageCount).map((page) => <Thumbnail key={page} pageNumber={page} active={currentPage === page} rootRef={thumbnailViewportRef} onSelect={scrollToPage} />)}
          </div>
        </aside>
        <div ref={viewportRef} id="pdf-scroll-viewport" className="flex-1 overflow-auto bg-slate-200/70 p-4 sm:p-8">
          {!pdfError && pageNumbers(pageCount).map((page) => <PageShell key={page} pageNumber={page} width={pageWidth * zoomLevel} renderPage={renderedPages.has(page)} register={registerPage} />)}
        </div>
        <PdfInfoPanel resource={resource} subject={subject} folder={folder} folderHierarchy={folderHierarchy} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      </div>
      </Document>
      <footer id="pdf-page-toolbar" className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2 flex items-center justify-between gap-4 z-20 shrink-0">
        <div className="text-xs text-slate-500 font-medium hidden sm:block">Scroll to read the document</div>
        <div className="flex items-center gap-2 mx-auto sm:mx-0"><div className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"><span>Page</span><button type="button" onClick={() => scrollToPage(currentPage)} className="font-semibold text-slate-900 hover:text-blue-600" aria-label="Scroll to current page">{currentPage}</button><span className="text-slate-400">/ {pageCount}</span></div></div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">Zoom: {Math.round(zoomLevel * 100)}%</div>
      </footer>
    </div>
  );
};
