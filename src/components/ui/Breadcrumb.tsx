import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbSegment {
  name: string;
  url: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbSegment[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  const previousItem = items.length > 1 ? items[items.length - 2] : null;
  const currentItem = items[items.length - 1];

  return (
    <nav
      id="academic-breadcrumbs"
      aria-label="Breadcrumb"
      className={`text-sm select-none ${className}`}
    >
      {/* Mobile view: Minimal back link with current item */}
      <div className="flex sm:hidden items-center gap-2 text-slate-600">
        {previousItem ? (
          <Link
            to={previousItem.url}
            id="mobile-breadcrumb-back-link"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 -ml-2 rounded-md hover:bg-slate-200/60 active:bg-slate-200 text-slate-700 font-medium transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>{previousItem.name}</span>
          </Link>
        ) : (
          <Link
            to="/"
            id="mobile-breadcrumb-home-link"
            className="inline-flex items-center gap-1 px-2.5 py-1 -ml-2 rounded-md hover:bg-slate-200/60 text-slate-700 font-medium text-xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Home</span>
          </Link>
        )}
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900 truncate text-xs">
          {currentItem.name}
        </span>
      </div>

      {/* Desktop view: Complete hierarchical chain */}
      <ol className="hidden sm:flex flex-wrap items-center gap-1.5 text-slate-500 font-normal">
        <li>
          <Link
            to="/"
            id="breadcrumb-root-home"
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.url + index} className="inline-flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span
                  className="font-semibold text-slate-900 px-2 py-1 truncate max-w-xs md:max-w-md"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  id={`breadcrumb-step-${index}`}
                  className="px-2 py-1 rounded hover:text-blue-600 hover:bg-blue-50/50 transition-colors truncate max-w-[200px]"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
