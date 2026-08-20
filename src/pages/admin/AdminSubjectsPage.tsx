import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  Edit2,
  Trash2,
  FolderTree,
  FileText,
  CheckCircle2,
  XCircle,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Subject } from '../../types/subject';
import { useSemesters } from '../../hooks/useSemesters';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export const AdminSubjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useAdmin();
  const { semesters } = useSemesters(true);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Computer Science & Engineering',
    semesterId: '',
    description: '',
    credits: 3,
    colorTone: 'blue' as 'blue' | 'indigo' | 'emerald' | 'amber' | 'slate' | 'violet',
    active: true,
  });

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await contentService.getAllSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subjects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      department: 'Computer Science & Engineering',
      semesterId: semesters[0]?.id || 'sem-1',
      description: '',
      credits: 3,
      colorTone: 'blue',
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      department: subject.department || 'Computer Science & Engineering',
      semesterId: subject.semesterId || (semesters.find((s) => s.name === subject.semester)?.id || 'sem-1'),
      description: subject.description || '',
      credits: subject.credits || 3,
      colorTone: subject.colorTone || 'blue',
      active: subject.active !== false,
    });
    setIsFormOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subject title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const semObj = semesters.find((s) => s.id === formData.semesterId);
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || 'BS-101',
        department: formData.department,
        semesterId: formData.semesterId,
        semester: semObj?.name || 'Semester 1',
        description: formData.description.trim(),
        credits: Number(formData.credits) || 3,
        colorTone: formData.colorTone,
        active: formData.active,
      };

      if (editingSubject) {
        await contentService.updateSubject(editingSubject.id, payload);
        toast.success(`Updated subject: "${payload.name}"`);
      } else {
        await contentService.createSubject(payload);
        toast.success(`Created new subject: "${payload.name}"`);
      }

      setIsFormOpen(false);
      await loadSubjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error saving subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    setIsSubmitting(true);
    try {
      await contentService.deleteSubject(subjectToDelete.id);
      toast.success(`Deleted subject: "${subjectToDelete.name}"`);
      setSubjectToDelete(null);
      await loadSubjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to delete subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubjectStatus = async (subject: Subject) => {
    try {
      const updated = await contentService.updateSubject(subject.id, {
        active: !subject.active,
      });
      setSubjects((prev) => prev.map((s) => (s.id === subject.id ? { ...s, active: updated.active } : s)));
      toast.info(`Subject "${subject.name}" is now ${updated.active ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Could not update status');
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem =
      selectedSemester === 'All' ||
      s.semesterId === selectedSemester ||
      s.semester === selectedSemester;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Subject Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure academic courses, departmental syllabus codes, and folder hierarchies
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects by title, code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Subject Name & Code</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Folders</th>
                <th className="py-3.5 px-4 text-center">Resources</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No subjects found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-serif text-sm shrink-0">
                          {subj.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {subj.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {subj.code || 'BS-101'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {subj.semester || 'Semester 1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {subj.department || 'CSE'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {subj.folderCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-blue-600">
                      {subj.resourceCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSubjectStatus(subj)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          subj.active !== false
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {subj.active !== false ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/folders?subjectId=${subj.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Manage Folders"
                        >
                          <FolderTree className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(subj)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubjectToDelete(subj)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Subject Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PC-CS601"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formData.semesterId}
                    onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Syllabus Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed outline of modules, laboratory prerequisites, and core outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Color Accent
                  </label>
                  <select
                    value={formData.colorTone}
                    onChange={(e) => setFormData({ ...formData, colorTone: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="blue">Blue</option>
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="violet">Violet</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-800 font-medium">
                      Publish Subject to Students
                    </span>
                  </label>
                </div>
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
                  {isSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation */}
      {subjectToDelete && (
        <DeleteConfirmModal
          isOpen={!!subjectToDelete}
          onClose={() => setSubjectToDelete(null)}
          onConfirm={handleDeleteSubject}
          title="Delete Academic Subject"
          itemName={subjectToDelete.name}
          itemType="Subject"
          associatedCounts={[
            { label: 'Associated folders', count: subjectToDelete.folderCount || 0 },
            { label: 'Academic resources / PDFs', count: subjectToDelete.resourceCount || 0 },
          ]}
          warningMessage="Deleting this subject will permanently remove all internal folders and associated academic files from the student portal."
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};
