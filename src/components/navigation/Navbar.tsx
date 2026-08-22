import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, MessageSquare } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { FeedbackModal } from './FeedbackModal';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const { bookmarks } = useBookmarks();
  const isBookmarksActive = location.pathname === '/bookmarks';
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <header
        id="main-navbar"
        className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Left: Brand & Logo */}
          <Link
            to="/"
            id="navbar-brand-link"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -ml-1 transition-opacity hover:opacity-95 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs shrink-0">
              <img src="./assets/SZ.png" alt="StudyZone logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 leading-none">
                  StudyZone
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/70">
                  MJCET
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                Academic Library
              </span>
            </div>
          </Link>

          {/* Center: Global Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-auto">
            <button
              type="button"
              onClick={onOpenSearch}
              id="navbar-center-search"
              aria-label="Search notes, assignments, PYQs, lab manuals... (Press / to search)"
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                <span className="font-normal truncate text-slate-500">
                  Search notes, assignments, PYQs, lab manuals...
                </span>
              </div>
              <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded">
                /
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Mobile Search Trigger Icon */}
            <button
              type="button"
              onClick={onOpenSearch}
              id="navbar-mobile-search-trigger"
              aria-label="Search resources"
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Bookmarks Link */}
            <Link
              to="/bookmarks"
              id="navbar-bookmarks-link"
              aria-label={`View bookmarked resources (${bookmarks.length} saved)`}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isBookmarksActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarksActive ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span
                  id="navbar-bookmarks-count"
                  className="min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {bookmarks.length > 99 ? '99+' : bookmarks.length}
                </span>
              )}
            </Link>

            {/* Feedback Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              id="navbar-feedback-btn"
              aria-label="Send feedback or request materials"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Feedback</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};
