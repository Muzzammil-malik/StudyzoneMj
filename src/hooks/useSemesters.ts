import { useState, useEffect, useCallback } from 'react';
import { Semester } from '../types/semester';
import { contentService } from '../services/contentService';

export function useSemesters(includeInactive: boolean = false) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = includeInactive
        ? await contentService.getAllSemesters()
        : await contentService.getSemesters();
      setSemesters(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load semesters.');
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const createSemester = async (data: Omit<Semester, 'id' | 'createdAt'>) => {
    const res = await contentService.createSemester(data);
    await fetchSemesters();
    return res;
  };

  const updateSemester = async (id: string, data: Partial<Semester>) => {
    const res = await contentService.updateSemester(id, data);
    await fetchSemesters();
    return res;
  };

  const deleteSemester = async (id: string) => {
    await contentService.deleteSemester(id);
    await fetchSemesters();
  };

  const reorderSemesters = async (semesterIds: string[]) => {
    await contentService.reorderSemesters(semesterIds);
    await fetchSemesters();
  };

  return {
    semesters,
    isLoading,
    error,
    refetch: fetchSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    reorderSemesters,
  };
}
