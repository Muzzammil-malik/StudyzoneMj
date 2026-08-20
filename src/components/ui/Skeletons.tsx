import React from 'react';

export const SubjectSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs animate-pulse">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg bg-slate-200/70 shrink-0" />
      <div className="w-16 h-5 rounded-full bg-slate-100" />
    </div>
    <div className="h-5 bg-slate-200/80 rounded-md w-4/5 mb-2" />
    <div className="h-3.5 bg-slate-100 rounded-md w-full mb-1" />
    <div className="h-3.5 bg-slate-100 rounded-md w-2/3 mb-4" />
    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
      <div className="h-4 bg-slate-100 rounded w-24" />
      <div className="w-4 h-4 bg-slate-200 rounded" />
    </div>
  </div>
);

export const FolderSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      <div className="w-10 h-10 rounded-lg bg-blue-50/80 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-4 bg-slate-200/80 rounded w-3/4 mb-1.5" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
    <div className="w-4 h-4 bg-slate-200/60 rounded" />
  </div>
);

export const FileSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      <div className="w-10 h-10 rounded-lg bg-rose-50/80 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-4 bg-slate-200/80 rounded w-4/5 mb-1.5" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-slate-100" />
      <div className="w-8 h-8 rounded-md bg-slate-100" />
    </div>
  </div>
);

export const SubjectListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SubjectSkeleton key={i} />
    ))}
  </div>
);

export const FolderListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <FolderSkeleton key={i} />
    ))}
  </div>
);

export const ResourceListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <FileSkeleton key={i} />
    ))}
  </div>
);
