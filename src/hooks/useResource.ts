import { useState, useEffect, useCallback } from 'react';
import { Resource } from '../types/resource';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';
import { contentService } from '../services/contentService';
import { recentService } from '../services/recentService';

export function useResource(resourceId?: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [folderHierarchy, setFolderHierarchy] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResourceData = useCallback(async () => {
    if (!resourceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await contentService.getResource(resourceId);
      if (!res) {
        setError('Academic document not found.');
        setResource(null);
        return;
      }
      setResource(res);

      const [subj, fld, hierarchy] = await Promise.all([
        contentService.getSubject(res.subjectId),
        contentService.getFolder(res.folderId),
        contentService.getFolderHierarchy(res.folderId),
      ]);

      setSubject(subj);
      setFolder(fld);
      setFolderHierarchy(hierarchy);

      // Track into recents automatically
      recentService.trackRecentView(res.id);
    } catch (err) {
      console.error(err);
      setError('Unable to load document.');
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadResourceData();
  }, [loadResourceData]);

  return {
    resource,
    subject,
    folder,
    folderHierarchy,
    isLoading,
    error,
    refetch: loadResourceData,
  };
}
