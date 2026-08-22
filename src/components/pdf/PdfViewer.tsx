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
  renderedWidth: number;
  scale: number;
  renderPage: boolean;
  register: (pageNumber: number, element: HTMLDivElement | null) => void;
}

const PageShell = React.memo(({ pageNumber, renderedWidth, scale, renderPage, register }: PageShellProps) => (
  <div
    ref={(element) => register(pageNumber, element)}
    data-page={pageNumber}
    className="flex justify-center scroll-mt-4"
    style={{ width: renderedWidth, minWidth: renderedWidth }}
  >
    {renderPage ? (
      <Page
        pageNumber={pageNumber}
        scale={scale}
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
const MAX_ZOOM = 2.4;

export const PdfViewer: React.FC<PdfViewerProps> = ({ resource, subject, folder, folderHierarchy = [] }) => {
  const viewerRootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const thumbnailViewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const currentPageRef = useRef(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minZoom, setMinZoom] = useState(0.6);
  const [pageCount, setPageCount] = useState(resource.pageCount || 1);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [originalPageWidth, setOriginalPageWidth] = useState(0);
  const [fitScale, setFitScale] = useState(1);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(() => new Set([1, 2, 3]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const zoomLevelRef = useRef(zoomLevel);
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; zoom: number; midpointX: number; midpointY: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const autoFitRef = useRef(true);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const registerPage = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    pageRefs.current[pageNumber] = element;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateWidth = () => {
      const styles = window.getComputedStyle(viewport);
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      setAvailableWidth(Math.max(1, viewport.clientWidth - horizontalPadding - 2));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!originalPageWidth || !availableWidth) return;
    const isCompactViewport = window.matchMedia('(max-width: 1023px)').matches;
    const nextFitScale = availableWidth / originalPageWidth;
    const nextMinZoom = isCompactViewport ? 1 : 0.6;
    setFitScale(nextFitScale);
    setMinZoom(nextMinZoom);
    if (isCompactViewport && autoFitRef.current) {
      setZoomLevel(1);
    } else {
      setZoomLevel((zoom) => Math.max(nextMinZoom, Math.min(MAX_ZOOM, zoom)));
    }
  }, [availableWidth, originalPageWidth]);

  const handleZoomChange = (newZoom: number) => {
    autoFitRef.current = false;
    setZoomLevel(Math.min(MAX_ZOOM, Math.max(minZoom, newZoom)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (touchPointsRef.current.size === 2) {
      const points = [...touchPointsRef.current.values()];
      pinchStartRef.current = {
        distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
        zoom: zoomLevelRef.current,
        midpointX: (points[0].x + points[1].x) / 2,
        midpointY: (points[0].y + points[1].y) / 2,
      };
      panStartRef.current = null;
    } else {
      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: event.currentTarget.scrollLeft,
        scrollTop: event.currentTarget.scrollTop,
      };
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || !touchPointsRef.current.has(event.pointerId)) return;
    touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touchPointsRef.current.size === 1 && panStartRef.current) {
      const start = panStartRef.current;
      const viewport = event.currentTarget;
      viewport.scrollLeft = start.scrollLeft - (event.clientX - start.x);
      viewport.scrollTop = start.scrollTop - (event.clientY - start.y);
      return;
    }
    if (touchPointsRef.current.size !== 2 || !pinchStartRef.current) return;

    event.preventDefault();
    const points = [...touchPointsRef.current.values()];
    const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    if (pinchStartRef.current.distance <= 0) return;

    const nextZoom = Math.min(MAX_ZOOM, Math.max(minZoom, pinchStartRef.current.zoom * distance / pinchStartRef.current.distance));
    const viewport = event.currentTarget;
    const rect = viewport.getBoundingClientRect();
    const focalX = pinchStartRef.current.midpointX - rect.left + viewport.scrollLeft;
    const focalY = pinchStartRef.current.midpointY - rect.top + viewport.scrollTop;
    const scaleRatio = nextZoom / pinchStartRef.current.zoom;
    const midpointX = pinchStartRef.current.midpointX;
    const midpointY = pinchStartRef.current.midpointY;
    autoFitRef.current = false;
    setZoomLevel(nextZoom);
    requestAnimationFrame(() => {
      viewport.scrollLeft = focalX * scaleRatio - midpointX + rect.left;
      viewport.scrollTop = focalY * scaleRatio - midpointY + rect.top;
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    touchPointsRef.current.delete(event.pointerId);
    if (touchPointsRef.current.size < 2) pinchStartRef.current = null;
    if (touchPointsRef.current.size === 0) panStartRef.current = null;
  };

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
        handleZoomChange(zoomLevelRef.current + 0.15);
      } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        handleZoomChange(zoomLevelRef.current - 0.15);
      } else if (!event.ctrlKey && !event.metaKey && (event.key === '+' || event.key === '=')) {
        handleZoomChange(zoomLevelRef.current + 0.15);
      } else if (!event.ctrlKey && !event.metaKey && event.key === '-') {
        handleZoomChange(zoomLevelRef.current - 0.15);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minZoom]);

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
    setOriginalPageWidth(0);
    setFitScale(1);
    setZoomLevel(1);
    setMinZoom(0.6);
    autoFitRef.current = true;
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
        <PdfHeader resource={resource} zoomLevel={zoomLevel} minZoom={minZoom} maxZoom={MAX_ZOOM} onZoomChange={handleZoomChange} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} isInfoOpen={isInfoOpen} onToggleInfo={() => setIsInfoOpen((open) => !open)} onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
      <Document
        file={resource.fileUrl}
        onLoadSuccess={async (pdf) => {
          setPageCount(pdf.numPages);
          const firstPage = await pdf.getPage(1);
          setOriginalPageWidth(firstPage.getViewport({ scale: 1 }).width);
          setPdfError(false);
        }}
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
        <div ref={viewportRef} id="pdf-scroll-viewport" className="flex-1 min-w-0 w-full max-w-full overflow-auto overscroll-contain bg-slate-200/70 p-4 sm:p-8" style={{ touchAction: 'none' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
          {!pdfError && originalPageWidth > 0 && pageNumbers(pageCount).map((page) => {
            const renderScale = fitScale * zoomLevel;
            const renderedWidth = Math.floor(originalPageWidth * renderScale);
            return <PageShell key={page} pageNumber={page} renderedWidth={renderedWidth} scale={renderScale} renderPage={renderedPages.has(page)} register={registerPage} />;
          })}
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
