import { useState, useEffect, useCallback } from 'react';
import { EnrichedRecentItem } from '../types/bookmark';
import { recentService } from '../services/recentService';

export function useRecents(limit: number = 8) {
  const [recents, setRecents] = useState<EnrichedRecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecents = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await recentService.getEnrichedRecentItems(limit);
      setRecents(list);
    } catch (e) {
      console.error('Error loading recents', e);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecents();

    const handleUpdate = () => {
      fetchRecents();
    };

    window.addEventListener('studyzone:recents-changed', handleUpdate);
    return () => {
      window.removeEventListener('studyzone:recents-changed', handleUpdate);
    };
  }, [fetchRecents]);

  const clearRecents = async () => {
    await recentService.clearRecentViews();
  };

  return { recents, isLoading, clearRecents, refetch: fetchRecents };
}
