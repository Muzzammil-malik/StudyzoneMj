import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSemesters } from '../../hooks/useSemesters';
import { useSubjects } from '../../hooks/useSubjects';
import { Semester } from '../../types/semester';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export const AdminSemestersPage: React.FC = () => {
  const { toast } = useAdmin();
  const {
    semesters,
    isLoading,
    createSemester,
    updateSemester,
    deleteSemester,
    reorderSemesters,
  } = useSemesters(true);
  const { subjects, refetch: refetchSubjects } = useSubjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    displayOrder: 1,
    active: true,
  });

  const getSubjectCountForSemester = (semester: Semester) => {
    return subjects.filter(
      (s) => s.semesterId === semester.id || s.semester === semester.name
    ).length;
  };

  const handleOpenCreate = () => {
    setEditingSemester(null);
    setFormData({
      name: `Semester ${semesters.length + 1}`,
      displayOrder: semesters.length + 1,
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      displayOrder: semester.displayOrder || 1,
      active: semester.active !== false,
    });
    setIsFormOpen(true);
  };

  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Semester name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, {
          name: formData.name.trim(),
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
        toast.success(`Updated semester: "${formData.name.trim()}"`);
      } else {
        await createSemester({
          name: formData.name.trim(),
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
        toast.success(`Created semester: "${formData.name.trim()}"`);
      }
      setIsFormOpen(false);
      await refetchSubjects();
    } catch (err: any) {
      toast.error(err?.message || 'Error saving semester.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!semesterToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteSemester(semesterToDelete.id);
      toast.success(`Deleted semester "${semesterToDelete.name}"`);
      setSemesterToDelete(null);
      await refetchSubjects();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete semester.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= semesters.length) return;

    const list = [...semesters];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const ids = list.map((s) => s.id);
    await reorderSemesters(ids);
    toast.info('Semester display order updated.');
  };

  const handleToggleActive = async (sem: Semester) => {
    try {
      await updateSemester(sem.id, { active: !sem.active });
      toast.info(`"${sem.name}" is now ${!sem.active ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to toggle semester state');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Semester Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic semester cycles, display sequence, and student catalog visibility
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Semester</span>
        </button>
      </div>

      {/* Semesters List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center w-16">Order</th>
                <th className="py-3.5 px-4">Semester Name</th>
                <th className="py-3.5 px-4 text-center">Assigned Subjects</th>
                <th className="py-3.5 px-4 text-center">Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading semesters...
                  </td>
                </tr>
              ) : semesters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No semesters configured yet.
                  </td>
                </tr>
              ) : (
                semesters.map((sem, idx) => {
                  const subjectCount = getSubjectCountForSemester(sem);
                  return (
                    <tr key={sem.id} className="hover:bg-slate-50/60 transition-colors">
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
                            disabled={idx === semesters.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span>{sem.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(sem)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            sem.active !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          {sem.active !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active in Filters
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
                            onClick={() => handleOpenEdit(sem)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Semester"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSemesterToDelete(sem)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Semester"
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

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingSemester ? 'Edit Semester' : 'Add Semester'}
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

            <form onSubmit={handleSaveSemester} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester 1 or Year 1 Sem 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Sequence Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
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
                    Active (Show in student navigation and semester filter tabs)
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
                  {isSubmitting ? 'Saving...' : editingSemester ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Semester Modal */}
      {semesterToDelete && (
        <DeleteConfirmModal
          isOpen={!!semesterToDelete}
          onClose={() => setSemesterToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Semester"
          itemName={semesterToDelete.name}
          itemType="Semester"
          associatedCounts={[
            {
              label: 'Assigned courses/subjects',
              count: getSubjectCountForSemester(semesterToDelete),
            },
          ]}
          warningMessage="If subjects are assigned to this semester, please reassign them to another semester before deleting."
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};
