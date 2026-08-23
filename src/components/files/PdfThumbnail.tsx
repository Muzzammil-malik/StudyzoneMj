import React, { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfThumbnailProps {
  fileUrl: string;
  fileName: string;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ fileUrl, fileName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentRef = useRef<Awaited<ReturnType<typeof pdfjs.getDocument>['promise']> | null>(null);
  const renderedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || renderedRef.current) return;

    let cancelled = false;
    const renderPreview = async () => {
      try {
        const loadingTask = pdfjs.getDocument({ url: fileUrl, withCredentials: false });
        const pdf = await loadingTask.promise;
        documentRef.current = pdf;
        const page = await pdf.getPage(1);
        if (cancelled || !canvasRef.current || !containerRef.current) return;

        const availableWidth = Math.max(1, containerRef.current.clientWidth);
        const availableHeight = Math.max(1, containerRef.current.clientHeight);
        const baseViewport = page.getViewport({ scale: 1 });
        const coverScale = Math.max(
          availableWidth / baseViewport.width,
          availableHeight / baseViewport.height,
        );
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: coverScale * outputScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable.');

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${Math.floor(baseViewport.width * coverScale)}px`;
        canvas.style.height = `${Math.floor(baseViewport.height * coverScale)}px`;
        await page.render({ canvasContext: context, viewport }).promise;
        if (!cancelled) {
          renderedRef.current = true;
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Unable to render PDF thumbnail for ${fileName}`, error);
          setStatus('error');
        }
      }
    };

    renderPreview();
    return () => {
      cancelled = true;
      documentRef.current?.destroy();
      documentRef.current = null;
    };
  }, [fileName, fileUrl, isVisible]);

  return (
    <div ref={containerRef} className="relative w-full h-[190px] sm:h-[210px] lg:h-[225px] overflow-hidden bg-slate-100">
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-slate-200/80" aria-label="Loading PDF preview" />
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-2 text-rose-500" role="img" aria-label={`PDF preview unavailable for ${fileName}`}>
          <FileText className="w-10 h-10" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">PDF</span>
        </div>
      )}
      <canvas ref={canvasRef} className={`absolute left-1/2 top-0 -translate-x-1/2 block max-w-none ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} aria-label={`First page preview of ${fileName}`} />
    </div>
  );
};
