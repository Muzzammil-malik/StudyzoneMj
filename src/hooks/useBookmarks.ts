import { useState, useEffect, useCallback } from 'react';
import { EnrichedBookmark } from '../types/bookmark';
import { bookmarkService } from '../services/bookmarkService';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<EnrichedBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookmarkService.getEnrichedBookmarks();
      setBookmarks(data);
    } catch (e) {
      console.error('Error loading bookmarks', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();

    const handleUpdate = () => {
      fetchBookmarks();
    };

    window.addEventListener('studyzone:bookmarks-changed', handleUpdate);
    return () => {
      window.removeEventListener('studyzone:bookmarks-changed', handleUpdate);
    };
  }, [fetchBookmarks]);

  return { bookmarks, isLoading, refetch: fetchBookmarks };
}

export function useIsBookmarked(resourceId?: string) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!resourceId) {
      setIsBookmarked(false);
      return;
    }
    const status = await bookmarkService.isBookmarked(resourceId);
    setIsBookmarked(status);
  }, [resourceId]);

  useEffect(() => {
    checkStatus();

    const handleUpdate = () => {
      checkStatus();
    };

    window.addEventListener('studyzone:bookmarks-changed', handleUpdate);
    return () => {
      window.removeEventListener('studyzone:bookmarks-changed', handleUpdate);
    };
  }, [checkStatus]);

  const toggle = async () => {
    if (!resourceId || isUpdating) return;
    setIsUpdating(true);
    try {
      const next = await bookmarkService.toggleBookmark(resourceId);
      setIsBookmarked(next);
      return next;
    } finally {
      setIsUpdating(false);
    }
  };

  return { isBookmarked, toggle, isUpdating };
}
