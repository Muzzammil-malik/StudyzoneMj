import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { FeedbackModal } from '../components/navigation/FeedbackModal';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { ToastProvider } from '../components/ui/Toast';
import { AmbientBackground } from '../components/ui/AmbientBackground';

export const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isPdfViewerPage = location.pathname.startsWith('/resource/');

  const {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    results,
    allResultsCount,
    isSearching,
    isModalOpen,
    openSearch,
    closeSearch,
  } = useGlobalSearch();

  const handleSelectSubject = (subjectIdOrSlug: string) => {
    navigate(`/subject/${subjectIdOrSlug}`);
  };

  return (
    <ToastProvider>
      <div className="relative min-h-screen flex flex-col bg-transparent text-[#0F172A] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        <Navbar onOpenSearch={() => openSearch()} />

        <main className="flex-1 flex flex-col relative z-10">
          <Outlet context={{ openSearch }} />
        </main>

        {!isPdfViewerPage && (
          <Footer
            onSelectSubject={handleSelectSubject}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
          />
        )}

        <GlobalSearchModal
          isOpen={isModalOpen}
          onClose={closeSearch}
          query={query}
          onQueryChange={setQuery}
          results={results}
          allResultsCount={allResultsCount}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          isSearching={isSearching}
        />

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      </div>
    </ToastProvider>
  );
};
