import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  Trash2,
  Eye,
  X,
  BookOpen,
  Send,
  Calendar,
  Star,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { FeedbackItem } from '../../types/feedback';
import { useAdmin } from '../../layouts/AdminLayout';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export const AdminFeedbackPage: React.FC = () => {
  const { toast, refreshStats } = useAdmin();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'unread' | 'read'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'material_request' | 'correction' | 'feedback'>('All');

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await contentService.getFeedbackList();
      setFeedbackList(data);
      await refreshStats();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleOpenItem = async (item: FeedbackItem) => {
    setSelectedItem(item);
    if (item.status === 'unread') {
      await contentService.markFeedbackRead(item.id);
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'read' } : f))
      );
      await refreshStats();
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await contentService.deleteFeedback(itemToDelete.id);
      toast.success('Feedback message deleted.');
      setItemToDelete(null);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      await loadFeedback();
    } catch (err: any) {
      toast.error('Could not delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredList = feedbackList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subjectRequested && item.subjectRequested.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Student Feedback & Material Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Incoming suggestions, course material requests, and syllabus correction reports
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number email, or message keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Read & Unread</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="material_request">Material Request</option>
            <option value="correction">Correction Report</option>
            <option value="feedback">General Feedback</option>
          </select>
        </div>
      </div>

      {/* Feedback List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading feedback...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No feedback found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                      item.status === 'unread' ? 'bg-blue-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                          {item.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {item.type?.replace('_', ' ') || 'Feedback'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.rating ? (
                        <span className="inline-flex items-center gap-1 text-amber-500 font-semibold" aria-label={`${item.rating} out of 5 stars`}>
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="text-slate-700">{item.rating}/5</span>
                        </span>
                      ) : <span className="text-slate-400">Not rated</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm truncate">
                      {item.message}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'unread' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          New
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Read
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenItem(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
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

      {/* View Feedback Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-lg leading-tight">
                    {selectedItem.type === 'material_request' ? 'Material Request' : 'Student Feedback'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Sender Name</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{selectedItem.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Email</span>
                  <a
                    href={`mailto:${selectedItem.email}`}
                    className="font-mono text-blue-600 hover:underline block mt-0.5 truncate"
                  >
                    {selectedItem.email}
                  </a>
                </div>
              </div>

              {selectedItem.subjectRequested && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    Subject Requested:
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedItem.subjectRequested}
                  </p>
                </div>
              )}

              {selectedItem.rating && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold mb-1">StudyZone Rating:</span>
                  <div className="inline-flex items-center gap-1 text-amber-500" aria-label={`${selectedItem.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`w-4 h-4 ${value <= selectedItem.rating! ? 'fill-amber-400' : 'fill-transparent'}`} />)}
                    <span className="ml-1 text-xs font-semibold text-slate-700">{selectedItem.rating}/5</span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold mb-1">
                  Message Content:
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedItem.message}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`mailto:${selectedItem.email}?subject=Regarding StudyZone MJCET request`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Feedback Confirmation */}
      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Feedback"
          itemName={`${itemToDelete.name}'s message`}
          itemType="Feedback"
          warningMessage="This message will be permanently removed."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
