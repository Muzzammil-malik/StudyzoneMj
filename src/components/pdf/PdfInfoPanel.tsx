import React from 'react';
import { Subject } from '../../types/subject';
import { Folder } from '../../types/folder';
import { Resource } from '../../types/resource';
import { formatBytes } from '../files/FileCard';
import { FileText, Calendar, User, BookOpen, Folder as FolderIcon, Tag, Download, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface PdfInfoPanelProps {
  resource: Resource;
  subject?: Subject | null;
  folder?: Folder | null;
  folderHierarchy?: Folder[];
  isOpen: boolean;
  onClose: () => void;
}

export const PdfInfoPanel: React.FC<PdfInfoPanelProps> = ({
  resource,
  subject,
  folder,
  folderHierarchy = [],
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      id="pdf-info-sidebar"
      className="w-full sm:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto shrink-0 flex flex-col justify-between shadow-lg sm:shadow-none animate-in slide-in-from-right-4 duration-150 z-10"
      aria-label="Document Metadata"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Document Details</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 sm:hidden"
          >
            Close
          </button>
        </div>

        {/* Academic Hierarchy Context */}
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Subject
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{subject?.name || 'MJCET Subject'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Location Path
            </span>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                <FolderIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{folder?.name || 'Root Folder'}</span>
              </div>
              {folderHierarchy.length > 1 && (
                <p className="text-[11px] text-slate-400 truncate">
                  {folderHierarchy.map((f) => f.name).join(' › ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resource Meta Grid */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between py-1 text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500">
              <FileText className="w-3.5 h-3.5" /> File Size
            </span>
            <span className="font-semibold text-slate-800">{formatBytes(resource.fileSize)}</span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5" /> Academic Year
            </span>
            <span className="font-semibold text-slate-800">{resource.academicYear || '2024–2025'}</span>
          </div>

          {resource.authorOrProfessor && (
            <div className="flex items-center justify-between py-1 text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <User className="w-3.5 h-3.5" /> Contributor
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                {resource.authorOrProfessor}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Download className="w-3.5 h-3.5" /> Total Downloads
            </span>
            <span className="font-semibold text-slate-800">{resource.downloadsCount || 120}</span>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="neutral" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Verification banner */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Verified academic syllabus material for MJCET examinations.
          </p>
        </div>
      </div>
    </aside>
  );
};
