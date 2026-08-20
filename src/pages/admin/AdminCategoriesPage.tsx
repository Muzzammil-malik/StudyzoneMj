import React, { useState, useEffect } from 'react';
import {
  Plus,
  Layers,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  BookOpen,
  Archive,
  HelpCircle,
  FlaskConical,
  FileText,
  FileCode2,
  ListTree,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';
import { contentService } from '../../services/contentService';
import { Resource } from '../../types/resource';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export const AdminCategoriesPage: React.FC = () => {
  const { toast } = useAdmin();
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useCategories(true);

  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'BookOpen',
    displayOrder: 1,
    active: true,
  });

  const loadResources = async () => {
    try {
      const res = await contentService.getAllResources();
      setAllResources(res);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const getResourceCount = (cat: Category) => {
    return allResources.filter(
      (r) => r.categoryId === cat.id || r.category === cat.name
    ).length;
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      iconName: 'BookOpen',
      displayOrder: categories.length + 1,
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      iconName: cat.iconName || 'BookOpen',
      displayOrder: cat.displayOrder || 1,
      active: cat.active !== false,
    });
    setIsFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          iconName: formData.iconName,
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
        toast.success(`Updated category: "${formData.name.trim()}"`);
      } else {
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          iconName: formData.iconName,
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
        toast.success(`Created category: "${formData.name.trim()}"`);
      }
      setIsFormOpen(false);
      await loadResources();
    } catch (err: any) {
      toast.error(err?.message || 'Error saving category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success(`Deleted category "${categoryToDelete.name}"`);
      setCategoryToDelete(null);
      await loadResources();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const ids = list.map((c) => c.id);
    await reorderCategories(ids);
    toast.info('Category display order updated.');
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { active: !cat.active });
      toast.info(`"${cat.name}" is now ${!cat.active ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to update category state');
    }
  };

  const renderIcon = (name?: string) => {
    switch (name) {
      case 'Archive':
        return <Archive className="w-4 h-4" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'FileCode2':
        return <FileCode2 className="w-4 h-4" />;
      case 'ListTree':
        return <ListTree className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Category Taxonomy Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure student resource classification pills (Notes, PYQs, Question Banks, Lab Manuals, etc.)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center w-16">Order</th>
                <th className="py-3.5 px-4">Category Name & Icon</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Tagged Files</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No categories configured yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const fileCount = getResourceCount(cat);
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-slate-700 w-4 text-center">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            {renderIcon(cat.iconName)}
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {fileCount} {fileCount === 1 ? 'file' : 'files'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            cat.active !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          {cat.active !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active Pill
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question Banks or Handwritten Notes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Previous years university semester examination papers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="BookOpen">BookOpen (Notes)</option>
                    <option value="Archive">Archive (PYQs)</option>
                    <option value="HelpCircle">HelpCircle (Question Banks)</option>
                    <option value="FlaskConical">FlaskConical (Labs)</option>
                    <option value="FileText">FileText (Records)</option>
                    <option value="FileCode2">FileCode2 (Assignments)</option>
                    <option value="ListTree">ListTree (Syllabus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-800 font-medium">
                    Active (Show in student category selector pills)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <DeleteConfirmModal
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          itemName={categoryToDelete.name}
          itemType="Category"
          associatedCounts={[
            {
              label: 'Resources tagged with this category',
              count: getResourceCount(categoryToDelete),
            },
          ]}
          warningMessage="Please reassign all resources in this category before deleting."
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};
