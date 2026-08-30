import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  onRenderSuccess: (pageNumber: number) => void;
}

const MIN_DESKTOP_ZOOM = 0.6;
const MOBILE_MIN_ZOOM = 1;
const DESKTOP_MAX_ZOOM = 1.8;
const MOBILE_MAX_ZOOM = 2.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const touchDistance = (touches: TouchList) => {
  const [first, second] = [touches[0], touches[1]];
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
};

const PageShell = React.memo(({ pageNumber, width, renderPage, register, onRenderSuccess }: PageShellProps) => (
  <div
    ref={(element) => register(pageNumber, element)}
    data-page={pageNumber}
    className="flex min-w-full shrink-0 justify-center scroll-mt-4"
    style={{ width }}
  >
    {renderPage ? (
      <Page
        pageNumber={pageNumber}
        width={width}
        devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
        renderAnnotationLayer
        renderTextLayer
        onRenderSuccess={() => onRenderSuccess(pageNumber)}
        className="shrink-0 bg-white shadow-md"
        loading={<div style={{ width }} className="aspect-[1/1.414] bg-white shadow-md animate-pulse" />}
      />
    ) : (
      <div style={{ width }} className="shrink-0 aspect-[1/1.414] bg-white shadow-md" aria-hidden="true" />
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
  const pageContentRef = useRef<HTMLDivElement>(null);
  const thumbnailViewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const currentPageRef = useRef(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomLevelRef = useRef(zoomLevel);
  const [pageCount, setPageCount] = useState(resource.pageCount || 1);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(() => new Set([1, 2, 3]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const minZoom = isMobileViewport ? MOBILE_MIN_ZOOM : MIN_DESKTOP_ZOOM;
  const maxZoom = isMobileViewport ? MOBILE_MAX_ZOOM : DESKTOP_MAX_ZOOM;

  const updateZoom = useCallback((nextZoom: number) => {
    setZoomLevel((currentZoom) => {
      const zoom = clamp(nextZoom, minZoom, maxZoom);
      return Math.abs(zoom - currentZoom) < 0.005 ? currentZoom : zoom;
    });
  }, [maxZoom, minZoom]);

  const removeZoomPreview = useCallback((pageNumber: number) => {
    const page = viewportRef.current?.querySelector<HTMLElement>(`.react-pdf__Page[data-page-number="${pageNumber}"]`);
    page?.querySelector('.pdf-zoom-preview')?.remove();
  }, []);

  const snapshotVisiblePages = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const viewportBounds = viewport.getBoundingClientRect();
    viewport.querySelectorAll<HTMLCanvasElement>('.react-pdf__Page__canvas').forEach((canvas) => {
      const page = canvas.closest('.react-pdf__Page') as HTMLElement | null;
      const pageBounds = page?.getBoundingClientRect();
      if (!page || !pageBounds || pageBounds.bottom <= viewportBounds.top || pageBounds.top >= viewportBounds.bottom) return;

      page.querySelector('.pdf-zoom-preview')?.remove();
      const preview = document.createElement('canvas');
      const context = preview.getContext('2d');
      if (!context || !canvas.width || !canvas.height) return;

      preview.width = canvas.width;
      preview.height = canvas.height;
      context.drawImage(canvas, 0, 0);
      preview.className = 'pdf-zoom-preview';
      preview.setAttribute('aria-hidden', 'true');
      Object.assign(preview.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '10',
      });
      page.append(preview);
    });
  }, []);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const registerPage = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    pageRefs.current[pageNumber] = element;
  }, []);

  useLayoutEffect(() => {
    if (!isDocumentReady) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame: number | null = null;
    let lastWidth = 0;
    const updateWidth = () => {
      const styles = window.getComputedStyle(viewport);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const contentWidth = viewport.clientWidth - horizontalPadding;
      if (contentWidth <= 0) return;
      const availableWidth = Math.floor(contentWidth);

      if (Math.abs(availableWidth - lastWidth) < 1) return;
      lastWidth = availableWidth;

      setPageWidth((currentWidth) => {
        const nextWidth = Math.min(860, availableWidth);
        return currentWidth === nextWidth ? currentWidth : nextWidth;
      });
      setIsMobileViewport(viewport.clientWidth < 768);
    };

    updateWidth();
    frame = window.requestAnimationFrame(updateWidth);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isDocumentReady]);

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
  }, [pageCount, pageWidth]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        updateZoom(zoomLevelRef.current + 0.15);
      } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        updateZoom(zoomLevelRef.current - 0.15);
      } else if (!event.ctrlKey && !event.metaKey && (event.key === '+' || event.key === '=')) {
        updateZoom(zoomLevelRef.current + 0.15);
      } else if (!event.ctrlKey && !event.metaKey && event.key === '-') {
        updateZoom(zoomLevelRef.current - 0.15);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateZoom]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const pageContent = pageContentRef.current;
    if (!viewport || !pageContent) return;

    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let previewZoom = 1;
    let focalContentX = 0;
    let focalContentY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let animationFrame: number | null = null;
    let pendingZoom: number | null = null;

    const flushZoom = () => {
      animationFrame = null;
      if (pendingZoom === null || !pinchStartDistance) return;
      previewZoom = pendingZoom;
      const previewScale = previewZoom / pinchStartZoom;
      pageContent.style.transform = `scale(${previewScale})`;
      viewport.scrollLeft = startScrollLeft + ((previewScale - 1) * focalContentX);
      viewport.scrollTop = startScrollTop + ((previewScale - 1) * focalContentY);
      pendingZoom = null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      pinchStartDistance = touchDistance(event.touches);
      pinchStartZoom = zoomLevelRef.current;
      previewZoom = pinchStartZoom;
      const midpointX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const midpointY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      const contentBounds = pageContent.getBoundingClientRect();
      focalContentX = midpointX - contentBounds.left;
      focalContentY = midpointY - contentBounds.top;
      startScrollLeft = viewport.scrollLeft;
      startScrollTop = viewport.scrollTop;
      pageContent.style.willChange = 'transform';
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      event.preventDefault();
      pendingZoom = clamp(pinchStartZoom * (touchDistance(event.touches) / pinchStartDistance), minZoom, maxZoom);
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(flushZoom);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length >= 2 || !pinchStartDistance) return;
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        flushZoom();
      }

      const finalZoom = previewZoom;
      const finalScale = finalZoom / pinchStartZoom;
      pinchStartDistance = 0;
      pageContent.style.transform = '';
      pageContent.style.willChange = '';

      if (Math.abs(finalZoom - zoomLevelRef.current) < 0.005) return;
      snapshotVisiblePages();
      updateZoom(finalZoom);
      window.requestAnimationFrame(() => {
        viewport.scrollLeft = startScrollLeft + ((finalScale - 1) * focalContentX);
        viewport.scrollTop = startScrollTop + ((finalScale - 1) * focalContentY);
      });
    };

    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
      viewport.removeEventListener('touchcancel', handleTouchEnd);
      pageContent.style.transform = '';
      pageContent.style.willChange = '';
    };
  }, [isDocumentReady, maxZoom, minZoom, pageWidth, snapshotVisiblePages, updateZoom]);

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
    setIsDocumentReady(false);
    setPageWidth(null);
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
    <div ref={viewerRootRef} id="academic-pdf-viewer-root" className="flex min-w-0 flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
      <PdfHeader resource={resource} zoomLevel={zoomLevel} minZoom={minZoom} maxZoom={maxZoom} onZoomChange={updateZoom} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} isInfoOpen={isInfoOpen} onToggleInfo={() => setIsInfoOpen((open) => !open)} onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
      <Document
        file={resource.fileUrl}
        onLoadSuccess={({ numPages }) => { setPageCount(numPages); setIsDocumentReady(true); setPdfError(false); }}
        onLoadError={(error) => { console.error('PDF.js failed to load document', error); setIsDocumentReady(false); setPdfError(true); }}
        loading={<div className="flex-1 bg-slate-200/70 p-4 sm:p-8"><div className="max-w-3xl mx-auto aspect-[1/1.414] bg-white rounded-sm shadow-md animate-pulse" /></div>}
        error={<div className="flex-1 bg-slate-200/70 p-12 text-center text-sm text-slate-600">Unable to load this PDF.<br />Please try again.</div>}
        className="flex-1 flex min-w-0 flex-col min-h-0"
      >
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {isSidebarOpen && <button type="button" aria-label="Close page thumbnails" onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 z-20 bg-slate-900/20 lg:hidden" />}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-slate-200 bg-slate-50 transition-transform duration-200 lg:relative lg:translate-x-0`}>
          <div className="px-4 py-3 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pages</div>
          <div ref={thumbnailViewportRef} className="h-[calc(100%-42px)] overflow-y-auto p-3 space-y-3">
            {pageNumbers(pageCount).map((page) => <Thumbnail key={page} pageNumber={page} active={currentPage === page} rootRef={thumbnailViewportRef} onSelect={scrollToPage} />)}
          </div>
        </aside>
        <div ref={viewportRef} id="pdf-scroll-viewport" className="flex-1 min-w-0 overflow-auto overscroll-contain bg-slate-200/70 p-4 sm:p-8" style={{ touchAction: 'pan-x pan-y' }}>
          {pageWidth !== null && (
            <div ref={pageContentRef} className="relative min-w-full origin-top-left" style={{ width: pageWidth * zoomLevel }}>
              {!pdfError && pageNumbers(pageCount).map((page) => <PageShell key={page} pageNumber={page} width={pageWidth * zoomLevel} renderPage={renderedPages.has(page)} register={registerPage} onRenderSuccess={removeZoomPreview} />)}
            </div>
          )}
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
