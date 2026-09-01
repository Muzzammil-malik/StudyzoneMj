import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FolderTree,
  Folder as FolderIcon,
  FolderPlus,
  FileUp,
  FileText,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ArrowLeft,
  X,
  Eye,
  Layers,
  Calendar,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Folder } from '../../types/folder';
import { Subject } from '../../types/subject';
import { Resource } from '../../types/resource';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { ResourcePreviewModal } from '../../components/admin/ResourcePreviewModal';

export const AdminFoldersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useAdmin();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [folderFormData, setFolderFormData] = useState({
    name: '',
    description: '',
  });

  // 1. Initial Load Subjects
  useEffect(() => {
    const init = async () => {
      try {
        const subjs = await contentService.getAllSubjects();
        setSubjects(subjs);

        const paramSubjId = searchParams.get('subjectId');
        const defaultSubj = subjs.find((s) => s.id === paramSubjId) || subjs[0];

        if (defaultSubj) {
          setSelectedSubjectId(defaultSubj.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [searchParams]);

  // 2. Load Folders & Resources when subject or folder changes
  const loadFolderContents = async () => {
    if (!selectedSubjectId) return;
    setIsLoading(true);
    try {
      const [flds, resList, hierarchy] = await Promise.all([
        contentService.getFolders(selectedSubjectId, currentFolderId),
        currentFolderId
          ? contentService.getResources(currentFolderId, true)
          : Promise.resolve([]),
        currentFolderId ? contentService.getFolderHierarchy(currentFolderId) : Promise.resolve([]),
      ]);
      setFolders(flds);
      setResources(resList);
      setBreadcrumbs(hierarchy);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load folder contents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolderContents();
  }, [selectedSubjectId, currentFolderId]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setFolderFormData({
      name: '',
      description: '',
    });
    setIsFolderFormOpen(true);
  };

  const handleOpenEditFolder = (fld: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(fld);
    setFolderFormData({
      name: fld.name,
      description: fld.description || '',
    });
    setIsFolderFormOpen(true);
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderFormData.name.trim()) {
      toast.error('Folder name is required.');
      return;
    }
    if (!selectedSubjectId) {
      toast.error('Please select a subject.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFolder) {
        await contentService.updateFolder(editingFolder.id, {
          name: folderFormData.name.trim(),
          description: folderFormData.description.trim(),
        });
        toast.success(`Updated folder "${folderFormData.name.trim()}"`);
      } else {
        await contentService.createFolder({
          subjectId: selectedSubjectId,
          parentFolderId: currentFolderId,
          name: folderFormData.name.trim(),
          description: folderFormData.description.trim(),
        });
        toast.success(`Created folder "${folderFormData.name.trim()}"`);
      }
      setIsFolderFormOpen(false);
      await loadFolderContents();
    } catch (err: any) {
      toast.error(err?.message || 'Error saving folder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsSubmitting(true);
    try {
      await contentService.deleteFolder(folderToDelete.id);
      toast.success(`Deleted folder "${folderToDelete.name}"`);
      setFolderToDelete(null);
      await loadFolderContents();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete folder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Folder Directory Tree
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize nested folder structures and direct academic PDF attachments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">
              Subject:
            </span>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setCurrentFolderId(null);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[200px]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || s.semester})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateFolder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{currentFolderId ? 'New Subfolder' : 'New Folder'}</span>
          </button>

          {currentFolderId && (
            <Link
              to={`/admin/resources?action=upload&subjectId=${selectedSubjectId}&folderId=${currentFolderId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload PDF here</span>
            </Link>
          )}
        </div>
      </div>

      {/* Breadcrumb Path Navigator */}
      <div className="bg-white px-5 py-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={`flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
            currentFolderId === null
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{currentSubject?.name || 'Subject Root'}</span>
        </button>

        {breadcrumbs.map((b, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={b.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentFolderId(b.id)}
                className={`truncate max-w-[180px] font-medium cursor-pointer transition-colors ${
                  isLast ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {b.name}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="space-y-6">
        {/* Folders Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Folders ({folders.length})
            </h3>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200/80">
              Loading folders...
            </p>
          ) : folders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
              <FolderIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                No subfolders in this location.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateFolder}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                + Create one now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {folders.map((fld) => (
                <div
                  key={fld.id}
                  onClick={() => setCurrentFolderId(fld.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FolderIcon className="w-5 h-5 fill-amber-500/20" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditFolder(fld, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                        title="Rename / Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToDelete(fld);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {fld.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {fld.description || 'Academic folder'}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{fld.itemCount || 0} items</span>
                      <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Open →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources in Current Folder */}
        {currentFolderId && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PDF Documents in this folder ({resources.length})
              </h3>
              <Link
                to={`/admin/resources?action=upload&subjectId=${selectedSubjectId}&folderId=${currentFolderId}`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Upload Resource
              </Link>
            </div>

            {resources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">
                  No direct files inside this folder yet.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Pages / Size</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5 font-semibold text-slate-900">
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="truncate max-w-sm">{res.name}</span>
                        </td>
                        <td className="py-3 px-4 text-blue-600 font-medium">
                          {res.category || 'Notes'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {res.pageCount ? `${res.pageCount} pages` : 'PDF'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              res.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {res.status || 'published'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setPreviewResource(res)}
                            className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Folder Modal */}
      {isFolderFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingFolder ? 'Edit Folder' : currentFolderId ? 'Add Subfolder' : 'Add Root Folder'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFolderFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 — Transformers & Solved PYQs"
                  value={folderFormData.name}
                  onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of modules or experiment sheets included..."
                  value={folderFormData.description}
                  onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderFormOpen(false)}
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
                  {isSubmitting ? 'Saving...' : editingFolder ? 'Update' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {folderToDelete && (
        <DeleteConfirmModal
          isOpen={!!folderToDelete}
          onClose={() => setFolderToDelete(null)}
          onConfirm={handleDeleteFolder}
          title="Delete Folder"
          itemName={folderToDelete.name}
          itemType="Folder"
          associatedCounts={[
            {
              label: 'Total files / subfolders inside',
              count: folderToDelete.itemCount || 0,
            },
          ]}
          warningMessage="Deleting this folder will recursively remove all nested subfolders and PDF files."
          isDeleting={isSubmitting}
        />
      )}

      {/* Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          resource={previewResource}
          subjectName={currentSubject?.name}
        />
      )}
    </div>
  );
};
