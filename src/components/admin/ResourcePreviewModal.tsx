import React from 'react';
import { X, FileText, Download, ExternalLink, ShieldCheck, Calendar, BookOpen, Layers } from 'lucide-react';
import { Resource } from '../../types/resource';

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  subjectName?: string;
  folderName?: string;
  categoryName?: string;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  isOpen,
  onClose,
  resource,
  subjectName,
  folderName,
  categoryName,
}) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    resource.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {resource.status || 'Published'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {resource.fileSize ? `${(resource.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}
                </span>
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-lg truncate leading-tight mt-0.5">
                {resource.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Subject</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {subjectName || 'Academic Subject'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Category</span>
              <span className="font-semibold text-blue-600 truncate block mt-0.5">
                {categoryName || resource.category || 'Notes'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Semester</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {resource.semester || 'Semester 1'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Folder Path</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {folderName || 'Root'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Author / Faculty</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {resource.authorOrProfessor || 'MJCET Faculty'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Page Count</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {resource.pageCount ? `${resource.pageCount} Pages` : 'Document'}
              </span>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Document Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                {resource.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tags & Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer Mockup / Document Frame */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-slate-200 flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
            <FileText className="w-10 h-10 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-300">
                Standard Verified Academic PDF
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 max-w-sm truncate">
                {resource.fileUrl}
              </p>
            </div>
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-mono">
            ID: {resource.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
