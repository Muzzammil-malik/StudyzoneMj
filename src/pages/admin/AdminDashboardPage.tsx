import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderTree,
  FileText,
  Calendar,
  Layers,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileUp,
  FolderPlus,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { DashboardStats, AdminActivity } from '../../types/admin';
import { Resource } from '../../types/resource';
import { Subject } from '../../types/subject';
import { ResourcePreviewModal } from '../../components/admin/ResourcePreviewModal';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, a, r, subj] = await Promise.all([
        contentService.getDashboardStats(),
        contentService.getAdminActivities(),
        contentService.getRecentResources(6),
        contentService.getAllSubjects(),
      ]);
      setStats(s);
      setActivities(a);
      setRecentResources(r);
      setSubjects(subj);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSubjectName = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s ? s.name : 'Subject';
  };

  const statCards = [
    {
      label: 'Total Subjects',
      value: stats?.totalSubjects ?? '—',
      icon: BookOpen,
      path: '/admin/subjects',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Total Folders',
      value: stats?.totalFolders ?? '—',
      icon: FolderTree,
      path: '/admin/folders',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Verified Resources',
      value: stats?.totalResources ?? '—',
      icon: FileText,
      path: '/admin/resources',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Active Semesters',
      value: stats?.totalSemesters ?? '—',
      icon: Calendar,
      path: '/admin/semesters',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Content Categories',
      value: stats?.totalCategories ?? '—',
      icon: Layers,
      path: '/admin/categories',
      color: 'text-violet-600 bg-violet-50 border-violet-100',
    },
    {
      label: 'Student Feedback',
      value: stats?.totalFeedback ?? '—',
      extra: stats?.unreadFeedback ? `${stats.unreadFeedback} unread` : undefined,
      icon: MessageSquare,
      path: '/admin/feedback',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>MJCET Content Management System</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Platform Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time administrative view of student subjects, folders, academic PDFs, and feedback.
          </p>
        </div>

        {/* Quick Create Dropdown / Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/resources?action=upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Resource</span>
          </Link>
          <Link
            to="/admin/subjects?action=new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </Link>
          <Link
            to="/admin/folders?action=new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.path}
              className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-2xs transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </p>
                  {stat.extra && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {stat.extra}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Recent Content & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Resources */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                Recent Resource Uploads
              </h3>
              <p className="text-xs text-slate-500">
                Latest academic documents synchronized with the student portal
              </p>
            </div>
            <Link
              to="/admin/resources"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentResources.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No resources uploaded yet.
              </p>
            ) : (
              recentResources.map((res) => (
                <div
                  key={res.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {res.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="truncate">{getSubjectName(res.subjectId)}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">{res.category || 'Notes'}</span>
                        <span>•</span>
                        <span>{res.semester || 'Sem 1'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewResource(res)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Activity Stream & Quick Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Audit Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Recent actions and database state mutations
                </p>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No logged activities yet.
                </p>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800">
                        <strong className="font-semibold text-slate-900">{act.action}</strong>:{' '}
                        <span className="text-slate-600 font-mono text-[11px] truncate inline-block max-w-[200px] align-bottom">
                          {act.entityName}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(act.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>CMS Architecture Mode</span>
            </div>
            <h4 className="font-serif font-bold text-lg">
              Dynamic CMS Active
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every subject, folder, semester, category, and PDF uploaded here updates both local persistence and the student catalog instantly.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white font-medium"
              >
                <span>Preview Student Experience</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          resource={previewResource}
          subjectName={getSubjectName(previewResource.subjectId)}
        />
      )}
    </div>
  );
};
