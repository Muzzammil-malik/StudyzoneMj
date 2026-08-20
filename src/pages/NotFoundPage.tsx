import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
        <GraduationCap className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
          404 Error
        </span>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The academic subject, folder, or resource you are looking for does not exist or has been relocated.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          id="btn-404-home"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Academic Library</span>
        </Link>
      </div>
    </div>
  );
};
