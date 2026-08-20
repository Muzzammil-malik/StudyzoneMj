import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { Subject } from '../../types/subject';

interface SubjectCardProps {
  subject: Subject;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  return (
    <Link
      to={`/subject/${subject.id}`}
      id={`subject-card-${subject.id}`}
      className="group relative bg-white border border-slate-200/85 hover:border-blue-500/80 rounded-xl p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div>
        {/* Top Meta Tags */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {subject.code && (
              <span className="text-[11px] font-mono font-medium text-slate-600 px-2 py-0.5 bg-slate-100/90 border border-slate-200/60 rounded">
                {subject.code}
              </span>
            )}
            {subject.semester && (
              <span className="text-[11px] font-medium text-blue-700 px-2 py-0.5 bg-blue-50/80 border border-blue-100/80 rounded">
                {subject.semester}
              </span>
            )}
          </div>

          {subject.department && (
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:inline-block">
              {subject.department.split(' ')[0]}
            </span>
          )}
        </div>

        {/* Subject Title */}
        <h3 className="font-serif text-xl sm:text-[22px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">
          {subject.name}
        </h3>

        {/* Subject Description */}
        {subject.description && (
          <p className="text-xs sm:text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-5">
            {subject.description}
          </p>
        )}
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            {subject.resourceCount || 0} {subject.resourceCount === 1 ? 'Resource' : 'Resources'}
          </span>
          {subject.folderCount && subject.folderCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">{subject.folderCount} Modules</span>
            </>
          )}
        </div>

        <div className="flex items-center text-blue-600 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </Link>
  );
};
