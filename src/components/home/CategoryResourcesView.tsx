import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Folder as FolderIcon,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Resource } from '../../types/resource';
import { Subject } from '../../types/subject';
import { contentService } from '../../services/contentService';
import { useIsBookmarked } from '../../hooks/useBookmarks';

interface CategoryResourcesViewProps {
  categoryName: string;
  categoryId: string;
  selectedSemester: string;
  onClearCategory: () => void;
  subjects: Subject[];
}

const ResourceRow: React.FC<{
  resource: Resource;
  subjectName: string;
}> = ({ resource, subjectName }) => {
  const { isBookmarked, toggle } = useIsBookmarked(resource.id);

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <Link
            to={`/resource/${resource.id}`}
            className="font-serif font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1 block"
          >
            {resource.name}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-800 font-semibold">{subjectName}</span>
            <span>•</span>
            <span className="text-blue-600">{resource.semester || 'Semester'}</span>
            <span>•</span>
            <span>{resource.authorOrProfessor || 'MJCET Faculty'}</span>
            {resource.pageCount && (
              <>
                <span>•</span>
                <span className="font-mono text-slate-400">{resource.pageCount} pages</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={toggle}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>

        <a
          href={resource.fileUrl}
          download={resource.name}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download</span>
        </a>

        <Link
          to={`/resource/${resource.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <span>Preview</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export const CategoryResourcesView: React.FC<CategoryResourcesViewProps> = ({
  categoryName,
  categoryId,
  selectedSemester,
  onClearCategory,
  subjects,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const data = await contentService.getResourcesByCategory(
          categoryName === 'All Resources' ? 'all' : categoryId || categoryName,
          selectedSemester,
          selectedSubjectId
        );
        setResources(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [categoryName, categoryId, selectedSemester, selectedSubjectId]);

  const filteredResources = resources.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.authorOrProfessor?.toLowerCase().includes(q)
    );
  });

  const getSubjectName = (subjId: string) => {
    const s = subjects.find((sub) => sub.id === subjId);
    return s ? s.name : 'Academic Course';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Header */}
      <div className="space-y-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={onClearCategory}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{categoryName}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {categoryName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse all {categoryName} available across StudyZone MJCET library.
            </p>
          </div>

          <button
            type="button"
            onClick={onClearCategory}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Subjects Grid</span>
          </button>
        </div>
      </div>

      {/* Sub-Filters toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Filter ${categoryName} by title or keyword...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Rows List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            Loading {categoryName}...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-serif font-bold text-slate-800">
              No materials found in {categoryName}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no published documents for this category under the current semester or subject filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectId('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset search & subject filter
            </button>
          </div>
        ) : (
          filteredResources.map((res) => (
            <ResourceRow
              key={res.id}
              resource={res}
              subjectName={getSubjectName(res.subjectId)}
            />
          ))
        )}
      </div>
    </div>
  );
};
