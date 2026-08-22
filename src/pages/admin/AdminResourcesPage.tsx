import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileUp,
  X,
  UploadCloud,
  CheckCircle2,
  Download,
  BookOpen,
  Layers,
  Folder as FolderIcon,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Resource } from '../../types/resource';
import { Subject } from '../../types/subject';
import { Folder } from '../../types/folder';
import { useCategories } from '../../hooks/useCategories';
import { useSemesters } from '../../hooks/useSemesters';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { ResourcePreviewModal } from '../../components/admin/ResourcePreviewModal';

export const AdminResourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useAdmin();
  const { categories } = useCategories();
  const { semesters } = useSemesters();

  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'published' | 'draft'>('All');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
    folderId: '',
    categoryId: '',
    semesterId: '',
    authorOrProfessor: 'MJCET Faculty',
    academicYear: '2024–2025',
    pageCount: 12,
    fileSizeMB: 2.5,
    tagsInput: 'Lecture Notes, MJCET',
    status: 'published' as 'published' | 'draft',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resList, subjs, flds] = await Promise.all([
        contentService.getAllResources(),
        contentService.getAllSubjects(),
        contentService.getAllFolders(),
      ]);
      setResources(resList);
      setSubjects(subjs);
      setAllFolders(flds);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load academic resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL query actions (e.g. ?action=upload&subjectId=...&folderId=...)
  useEffect(() => {
    if (searchParams.get('action') === 'upload') {
      const pSubj = searchParams.get('subjectId');
      const pFolder = searchParams.get('folderId');
      handleOpenCreate(pSubj || undefined, pFolder || undefined);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, subjects, allFolders]);

  const handleOpenCreate = (prefSubjId?: string, prefFolderId?: string) => {
    const defaultSubj = prefSubjId
      ? subjects.find((s) => s.id === prefSubjId)
      : subjects[0];
    const subjId = defaultSubj?.id || '';

    const matchingFolders = allFolders.filter((f) => f.subjectId === subjId);
    const defaultFolder = prefFolderId
      ? matchingFolders.find((f) => f.id === prefFolderId)
      : matchingFolders[0];

    setEditingResource(null);
    setSelectedFile(null);
    setFormData({
      name: '',
      description: '',
      subjectId: subjId,
      folderId: defaultFolder?.id || '',
      categoryId: categories[0]?.id || 'cat-notes',
      semesterId: defaultSubj?.semesterId || 'sem-1',
      authorOrProfessor: 'MJCET Faculty',
      academicYear: '2024–2025',
      pageCount: 16,
      fileSizeMB: 3.2,
      tagsInput: 'Lecture Notes, MJCET',
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setSelectedFile(null);
    setFormData({
      name: res.name,
      description: res.description || '',
      subjectId: res.subjectId,
      folderId: res.folderId,
      categoryId: res.categoryId || (categories.find((c) => c.name === res.category)?.id || 'cat-notes'),
      semesterId: res.semesterId || 'sem-1',
      authorOrProfessor: res.authorOrProfessor || 'MJCET Faculty',
      academicYear: res.academicYear || '2024–2025',
      pageCount: res.pageCount || 12,
      fileSizeMB: res.fileSize ? +(res.fileSize / (1024 * 1024)).toFixed(2) : 2.5,
      tagsInput: (res.tags || []).join(', '),
      status: res.status || 'published',
    });
    setIsFormOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Resource title is required.');
      return;
    }
    if (!formData.subjectId) {
      toast.error('Please assign a subject.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSubj = subjects.find((s) => s.id === formData.subjectId);
      const selectedCat = categories.find((c) => c.id === formData.categoryId);
      const selectedSem = semesters.find((s) => s.id === formData.semesterId);

      const parsedTags = formData.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        title: formData.name.trim(),
        description: formData.description.trim(),
        subjectId: formData.subjectId,
        folderId: formData.folderId || 'fld-root',
        categoryId: formData.categoryId,
        category: selectedCat?.name || 'Notes',
        semesterId: formData.semesterId || selectedSubj?.semesterId || 'sem-1',
        semester: selectedSem?.name || selectedSubj?.semester || 'Semester 1',
        authorOrProfessor: formData.authorOrProfessor.trim(),
        academicYear: formData.academicYear.trim(),
        pageCount: Number(formData.pageCount) || 10,
        fileSize: Number(formData.fileSizeMB) * 1024 * 1024,
        tags: parsedTags,
        status: formData.status,
      };

      if (!editingResource && !selectedFile) {
        throw new Error('Please choose a PDF file to upload.');
      }

      if (editingResource && selectedFile) {
        await contentService.replaceResourceFile(editingResource.id, selectedFile);
      }

      if (editingResource) {
        await contentService.updateResource(editingResource.id, payload);
        toast.success(`Updated resource "${payload.name}"`);
      } else {
        await contentService.uploadResource(selectedFile as File, {
          ...payload,
          title: payload.name,
        });
        toast.success(`Uploaded and published "${payload.name}"`);
      }

      setIsFormOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Error saving resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;
    setIsSubmitting(true);
    try {
      await contentService.deleteResource(resourceToDelete.id);
      toast.success(`Deleted resource "${resourceToDelete.name}"`);
      setResourceToDelete(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResourceStatus = async (res: Resource) => {
    const nextStatus = res.status === 'published' ? 'draft' : 'published';
    try {
      await contentService.updateResource(res.id, { status: nextStatus });
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: nextStatus } : r))
      );
      toast.info(`"${res.name}" is now ${nextStatus === 'published' ? 'Published' : 'Draft'}`);
    } catch {
      toast.error('Could not toggle status');
    }
  };

  const getSubjectName = (subjId: string) => {
    const s = subjects.find((sub) => sub.id === subjId);
    return s ? s.name : '—';
  };

  const getFolderName = (fldId: string) => {
    const f = allFolders.find((folder) => folder.id === fldId);
    return f ? f.name : 'Root Directory';
  };

  const availableFoldersForSubject = allFolders.filter(
    (f) => f.subjectId === formData.subjectId
  );

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authorOrProfessor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubj = selectedSubject === 'All' || r.subjectId === selectedSubject;
    const matchesCat = selectedCategory === 'All' || r.categoryId === selectedCategory || r.category === selectedCategory;
    const matchesSem = selectedSemester === 'All' || r.semesterId === selectedSemester || r.semester === selectedSemester;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesSubj && matchesCat && matchesSem && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Resource Library Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic PDFs, publication drafts, categories, and semester affiliations
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCreate()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by document title, professor, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading resources...
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No resources match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs">
                            {res.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {res.pageCount ? `${res.pageCount} pages` : 'PDF'} •{' '}
                            {res.authorOrProfessor || 'Faculty'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {getSubjectName(res.subjectId)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
                        {res.category || 'Notes'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {res.semester || 'Semester 1'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleResourceStatus(res)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          res.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        {res.status === 'published' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Published
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewResource(res)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setResourceToDelete(res)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Resource"
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

      {/* Upload / Edit Resource Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileUp className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingResource ? 'Edit Resource' : 'Upload Academic Resource'}
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

            <form onSubmit={handleSaveResource} className="p-6 space-y-4 overflow-y-auto flex-1">
              {!editingResource && (
                <label className="block p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-2 hover:border-blue-400 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Select a PDF from your file manager'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Standard syllabus, lecture slides, question banks (Max 50MB)
                    </p>
                  </div>
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                </label>
              )}
              {editingResource && (
                <label className="block p-3 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Replace PDF (optional)</span>
                  <input type="file" accept="application/pdf,.pdf" className="block w-full mt-2 text-xs" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                  {selectedFile && <span className="block text-[11px] text-slate-500 mt-1">Selected: {selectedFile.name}</span>}
                </label>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 — Digital Signal Processing Filter Design.pdf"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const nextSubjId = e.target.value;
                      const nextSubj = subjects.find((s) => s.id === nextSubjId);
                      const matchingFlds = allFolders.filter((f) => f.subjectId === nextSubjId);
                      setFormData({
                        ...formData,
                        subjectId: nextSubjId,
                        semesterId: nextSubj?.semesterId || formData.semesterId,
                        folderId: matchingFlds[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Folder
                  </label>
                  <select
                    value={formData.folderId}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Root / Direct</option>
                    {availableFoldersForSubject.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semesterId}
                    onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author / Professor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ahmed / Dept of CSE"
                    value={formData.authorOrProfessor}
                    onChange={(e) => setFormData({ ...formData, authorOrProfessor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024–2025"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline of derivations, numerical problems, and solved university sets..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Notes, Unit 1, Derivations, Solved"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="published">Published (Visible to students)</option>
                    <option value="draft">Draft (Hidden from students)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Page Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
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
                  {isSubmitting ? 'Saving...' : editingResource ? 'Update' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Resource Modal */}
      {resourceToDelete && (
        <DeleteConfirmModal
          isOpen={!!resourceToDelete}
          onClose={() => setResourceToDelete(null)}
          onConfirm={handleDeleteResource}
          title="Delete Academic Resource"
          itemName={resourceToDelete.name}
          itemType="Resource"
          warningMessage="This PDF document will be permanently removed from all student library listings and bookmarks."
          isDeleting={isSubmitting}
        />
      )}

      {/* Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          resource={previewResource}
          subjectName={getSubjectName(previewResource.subjectId)}
          folderName={getFolderName(previewResource.folderId)}
        />
      )}
    </div>
  );
};
