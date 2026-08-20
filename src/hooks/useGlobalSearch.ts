import { useState, useEffect, useCallback } from 'react';
import { SearchResult, SearchResultType } from '../types/search';
import { contentService } from '../services/contentService';

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SearchResultType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global '/' keyboard listener to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is already typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsModalOpen(true);
      } else if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const data = await contentService.searchAcademicContent(q);
      setResults(data);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        runSearch(query);
      } else {
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter((r) => r.type === activeFilter);

  const openSearch = (initialQuery = '') => {
    if (initialQuery) setQuery(initialQuery);
    setIsModalOpen(true);
  };

  const closeSearch = () => {
    setIsModalOpen(false);
  };

  return {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    results: filteredResults,
    allResultsCount: results.length,
    isSearching,
    isModalOpen,
    openSearch,
    closeSearch,
  };
}
