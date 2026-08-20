import React from 'react';
import { AcademicDocumentContent, AcademicDocPage } from '../../services/samplePdfGenerator';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

interface PdfDocumentCanvasProps {
  content: AcademicDocumentContent;
  currentPage: number;
  zoomLevel: number;
}

export const PdfDocumentCanvas: React.FC<PdfDocumentCanvasProps> = ({
  content,
  currentPage,
  zoomLevel,
}) => {
  const page: AcademicDocPage = content.pages[currentPage - 1] || content.pages[0];

  return (
    <div
      id={`pdf-page-${currentPage}`}
      className="transition-transform duration-100 ease-out origin-top"
      style={{
        transform: `scale(${zoomLevel})`,
        width: '100%',
        maxWidth: '780px',
      }}
    >
      <div className="bg-white rounded-lg shadow-md border border-slate-200/90 p-6 sm:p-12 min-h-[960px] flex flex-col justify-between select-text text-slate-900 font-sans relative overflow-hidden">
        {/* Subtle MJCET Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <GraduationCap className="w-96 h-96 text-slate-900" />
        </div>

        <div>
          {/* Official Academic Document Header */}
          <header className="border-b-2 border-slate-900/80 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-lg">
                  MJ
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900">
                    Muffakham Jah College of Engineering & Technology
                  </h2>
                  <p className="text-[11px] text-slate-600 font-sans font-medium">
                    {content.subjectTitle} • {content.unitTitle}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Official Syllabus
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{content.academicYear}</p>
              </div>
            </div>

            {/* Document Main Heading */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h1 className="font-serif font-bold text-lg sm:text-2xl text-slate-950 leading-tight">
                {content.documentTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Prepared by: <span className="font-medium text-slate-800">{content.author}</span>
              </p>
            </div>
          </header>

          {/* Page Section Content */}
          <main className="space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 mb-3 border-b border-slate-200 pb-1">
                {page.sectionTitle}
              </h3>

              <div className="space-y-3">
                {page.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-justify text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Mathematical Formulas Block */}
            {page.keyFormulas && page.keyFormulas.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs sm:text-sm text-slate-900 shadow-2xs space-y-2">
                <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Governing Equations & Key Formulas
                </div>
                {page.keyFormulas.map((eq, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-slate-200/80 font-mono text-blue-900">
                    {eq}
                  </div>
                ))}
              </div>
            )}

            {/* Key Bullet Highlights */}
            {page.keyPoints && page.keyPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900">
                  Essential Takeaways & Exam Points:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {page.keyPoints.map((point, idx) => (
                    <li key={idx} className="leading-normal">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Worked Examination Problem Box */}
            {page.workedExample && (
              <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-2 text-xs sm:text-sm">
                <span className="font-semibold text-blue-950 block">
                  {page.workedExample.problem}
                </span>
                <div className="space-y-1 text-slate-700 pl-2 border-l-2 border-blue-400">
                  {page.workedExample.solution.map((step, idx) => (
                    <p key={idx} className="text-xs leading-relaxed">{step}</p>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Academic Footer */}
        <footer className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div>StudyZone MJCET Academic Library • Hyderabad</div>
          <div className="font-mono font-medium text-slate-600">
            Page {currentPage} of {content.totalPages}
          </div>
        </footer>
      </div>
    </div>
  );
};
