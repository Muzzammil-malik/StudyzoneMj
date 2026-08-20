import { useState, useEffect, useCallback } from 'react';
import { Resource } from '../types/resource';
import { contentService } from '../services/contentService';

export function useCategoryResources(
  categoryId: string,
  semesterFilter?: string,
  subjectFilter?: string
) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contentService.getResourcesByCategory(
        categoryId,
        semesterFilter,
        subjectFilter
      );
      setResources(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load category resources.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, semesterFilter, subjectFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, isLoading, error, refetch: fetchResources };
}
