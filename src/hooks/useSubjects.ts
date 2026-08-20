import { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types/subject';
import { contentService } from '../services/contentService';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contentService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load subjects at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, isLoading, error, refetch: fetchSubjects };
}
