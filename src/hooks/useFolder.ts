import { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';
import { Resource } from '../types/resource';
import { contentService } from '../services/contentService';

export function useFolder(subjectId?: string, folderId?: string) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderHierarchy, setFolderHierarchy] = useState<Folder[]>([]);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFolderData = useCallback(async () => {
    if (!subjectId || !folderId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [subjData, fldData, hierarchy, childFolders, files] = await Promise.all([
        contentService.getSubject(subjectId),
        contentService.getFolder(folderId),
        contentService.getFolderHierarchy(folderId),
        contentService.getFolders(subjectId, folderId),
        contentService.getResources(folderId),
      ]);

      if (!subjData || !fldData) {
        setError('Folder or subject not found.');
        return;
      }

      setSubject(subjData);
      setCurrentFolder(fldData);
      setFolderHierarchy(hierarchy);
      setSubfolders(childFolders);
      setResources(files);
    } catch (err) {
      console.error(err);
      setError('Unable to load folder contents.');
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, folderId]);

  useEffect(() => {
    loadFolderData();
  }, [loadFolderData]);

  return {
    subject,
    currentFolder,
    folderHierarchy,
    subfolders,
    resources,
    isLoading,
    error,
    refetch: loadFolderData,
  };
}
