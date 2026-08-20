import React, { useEffect, useRef } from 'react';
import { Search, X, BookOpen, Folder, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { SearchResult, SearchResultType } from '../../types/search';
import { SearchResultItem } from './SearchResultItem';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchResult[];
  allResultsCount: number;
  activeFilter: 'all' | SearchResultType;
  onFilterChange: (f: 'all' | SearchResultType) => void;
  isSearching: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  results,
  allResultsCount,
  activeFilter,
  onFilterChange,
  isSearching,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 sm:pt-16 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Global Academic Search"
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search subjects, folders and resources..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-base outline-none font-sans"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search text"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Results {query && `(${allResultsCount})`}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('subject')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'subject'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Subjects</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('folder')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'folder'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Folder className="w-3 h-3" />
            <span>Folders</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('resource')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'resource'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>PDF Files</span>
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 min-h-[220px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Searching MJCET academic resources...</p>
            </div>
          ) : query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600 mb-1">Quick Search</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Type any subject name (e.g. "Physics", "PPS", "DSA"), folder topic (e.g. "Unit 1", "PYQs"), or document keywords.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                {['Physics Notes', 'DSA BST Rotations', 'PPS Lab Record', 'BEE Theorems', 'PYQs 2024'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onQueryChange(tag)}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-md transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-700 mb-1">No resources found</p>
              <p className="text-xs text-slate-400">
                No matching academic materials found for "{query}". Try checking for spelling or searching for a course code.
              </p>
            </div>
          ) : (
            results.map((result) => (
              <SearchResultItem
                key={`${result.type}-${result.id}`}
                result={result}
                onSelect={onClose}
              />
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-500">
                /
              </kbd>
              <span>Focus search</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-500">
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="text-blue-600 font-medium hidden sm:block">
            StudyZone MJCET
          </div>
        </div>
      </div>
    </div>
  );
};
