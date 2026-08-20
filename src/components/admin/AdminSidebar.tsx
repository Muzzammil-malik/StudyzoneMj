import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  FileText,
  Calendar,
  Layers,
  MessageSquare,
  Settings,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  unreadFeedbackCount?: number;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  unreadFeedbackCount = 0,
  onCloseMobile,
}) => {
  const navItemsContent = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Folders', path: '/admin/folders', icon: FolderTree },
    { label: 'Resources', path: '/admin/resources', icon: FileText },
  ];

  const navItemsOrg = [
    { label: 'Semesters', path: '/admin/semesters', icon: Calendar },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
  ];

  const navItemsGeneral = [
    {
      label: 'Feedback',
      path: '/admin/feedback',
      icon: MessageSquare,
      badge: unreadFeedbackCount > 0 ? unreadFeedbackCount : undefined,
    },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const renderNavLink = (item: {
    label: string;
    path: string;
    icon: React.FC<{ className?: string }>;
    end?: boolean;
    badge?: number;
  }) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={onCloseMobile}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`
        }
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 shrink-0" />
          <span>{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between select-none">
      {/* Brand Top */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Link
          to="/admin"
          className="flex items-center gap-2.5 group"
          onClick={onCloseMobile}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-slate-900 text-lg leading-tight">
                StudyZone
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Content Management System
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Content Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Content
          </p>
          <div className="space-y-0.5 mt-1">
            {navItemsContent.map(renderNavLink)}
          </div>
        </div>

        {/* Organization Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Organization
          </p>
          <div className="space-y-0.5 mt-1">
            {navItemsOrg.map(renderNavLink)}
          </div>
        </div>

        {/* General Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            General
          </p>
          <div className="space-y-0.5 mt-1">
            {navItemsGeneral.map(renderNavLink)}
          </div>
        </div>
      </div>

      {/* Bottom Switch to Student Library */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <Link
          to="/"
          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 hover:border-blue-400 text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>View Student Portal</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
        </Link>
      </div>
    </aside>
  );
};
