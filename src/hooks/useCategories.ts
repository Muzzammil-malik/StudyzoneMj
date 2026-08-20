import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types/category';
import { contentService } from '../services/contentService';

export function useCategories(includeInactive: boolean = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = includeInactive
        ? await contentService.getAllCategories()
        : await contentService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    const res = await contentService.createCategory(data);
    await fetchCategories();
    return res;
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const res = await contentService.updateCategory(id, data);
    await fetchCategories();
    return res;
  };

  const deleteCategory = async (id: string) => {
    await contentService.deleteCategory(id);
    await fetchCategories();
  };

  const reorderCategories = async (categoryIds: string[]) => {
    await contentService.reorderCategories(categoryIds);
    await fetchCategories();
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
