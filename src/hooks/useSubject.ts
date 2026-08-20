import { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';
import { contentService } from '../services/contentService';

export function useSubject(subjectId?: string) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!subjectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const subjData = await contentService.getSubject(subjectId);
      if (!subjData) {
        setError('Subject not found.');
        setSubject(null);
        setRootFolders([]);
        return;
      }
      setSubject(subjData);
      const folders = await contentService.getFolders(subjectId, null);
      setRootFolders(folders);
    } catch (err) {
      console.error(err);
      setError('Failed to load subject folders.');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { subject, rootFolders, isLoading, error, refetch: loadData };
}
