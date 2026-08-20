import React from 'react';
import { Menu, Plus, Bell, Shield, Search, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminTopbarProps {
  onToggleMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onToggleMobileSidebar,
  title,
  subtitle,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && (
            <h1 className="font-serif font-bold text-slate-900 text-lg sm:text-xl leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {actions}

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
            MJ
          </div>
          <span className="text-slate-800 font-medium hidden md:inline">
            Admin
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      </div>
    </header>
  );
};
