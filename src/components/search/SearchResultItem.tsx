import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Folder, FileText, ChevronRight } from 'lucide-react';
import { SearchResult } from '../../types/search';

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onSelect,
}) => {
  const getIconAndStyle = () => {
    switch (result.type) {
      case 'subject':
        return {
          icon: BookOpen,
          bg: 'bg-blue-50 text-blue-600',
          label: 'Subject',
          labelStyle: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'folder':
        return {
          icon: Folder,
          bg: 'bg-amber-50 text-amber-600',
          label: 'Folder',
          labelStyle: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'resource':
      default:
        return {
          icon: FileText,
          bg: 'bg-rose-50 text-rose-600',
          label: 'PDF File',
          labelStyle: 'bg-rose-50 text-rose-700 border-rose-200',
        };
    }
  };

  const { icon: Icon, bg, label, labelStyle } = getIconAndStyle();

  return (
    <Link
      to={result.path}
      onClick={onSelect}
      id={`search-result-${result.type}-${result.id}`}
      className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors min-h-[52px]"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-sans font-medium text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {result.title}
            </h4>
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 ${labelStyle}`}>
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-0.5">
            {result.breadcrumbs && result.breadcrumbs.length > 0 ? (
              <span className="truncate">{result.breadcrumbs.join(' / ')}</span>
            ) : (
              <span className="truncate">{result.subtitle}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3 text-xs text-slate-400">
        {result.meta && (
          <span className="hidden sm:inline font-normal">{result.meta}</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};
