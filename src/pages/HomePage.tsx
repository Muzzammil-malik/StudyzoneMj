import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  FileText,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FlaskConical,
  FileCode2,
  ListTree,
  Archive,
  GraduationCap,
} from 'lucide-react';
import { useSubjects } from '../hooks/useSubjects';
import { useRecents } from '../hooks/useRecents';
import { useCategories } from '../hooks/useCategories';
import { useSemesters } from '../hooks/useSemesters';
import { SubjectCard } from '../components/subjects/SubjectCard';
import { SubjectListSkeleton } from '../components/ui/Skeletons';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryResourcesView } from '../components/home/CategoryResourcesView';

interface OutletContextType {
  openSearch: (initialQuery?: string) => void;
}

export const HomePage: React.FC = () => {
  const { openSearch } = useOutletContext<OutletContextType>();
  const { subjects, isLoading, error, refetch } = useSubjects();
  const { recents } = useRecents(4);
  const { categories } = useCategories();
  const { semesters: dynamicSemesters } = useSemesters();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Resources');
  const [selectedSemester, setSelectedSemester] = useState<string>('All Semesters');

  // Map icon strings to Lucide components
  const getCategoryIcon = (name?: string, iconName?: string) => {
    if (name === 'All Resources') return Sparkles;
    switch (iconName) {
      case 'Archive':
        return Archive;
      case 'HelpCircle':
        return HelpCircle;
      case 'FlaskConical':
        return FlaskConical;
      case 'FileText':
        return FileText;
      case 'FileCode2':
        return FileCode2;
      case 'ListTree':
        return ListTree;
      default:
        return BookOpen;
    }
  };

  // Build category list with "All Resources" prepended
  const allCategoryPills = [
    { id: 'all', name: 'All Resources', iconName: 'Sparkles' },
    ...categories,
  ];

  const row1Categories = allCategoryPills.slice(0, 5);
  const row2Categories = allCategoryPills.slice(5);

  const semesterOptions = [
    'All Semesters',
    ...(dynamicSemesters.length > 0
      ? dynamicSemesters.map((s) => s.name)
      : ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']),
  ];

  // Filter subjects by semester
  const filteredSubjects =
    selectedSemester === 'All Semesters'
      ? subjects
      : subjects.filter(
          (s) => s.semester === selectedSemester || s.semesterId === selectedSemester
        );

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const getCategorySearchQuery = (categoryName: string): string => {
    if (categoryName === 'All Resources') return '';
    return categoryName;
  };

  const selectedCategoryObj = categories.find((c) => c.name === selectedCategory);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14 sm:space-y-20 w-full">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (MATCHING REFERENCE IMAGE) */}
      {/* ============================================================ */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-2 sm:pt-6">
        {/* Top Pill Badge with Blue Bullet Dot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] sm:text-xs font-semibold tracking-wider uppercase border border-blue-100 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
          <span>All resources As per the latest Autonomus R-25 Syllabus</span>
        </div>

        {/* Hero Title in Elegant EB Garamond Serif */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-[76px] font-bold tracking-tight text-[#0F172A] leading-[1.05]">
          StudyZone
        </h1>

        {/* Subtitle / Description */}
      
        <p className="font-poppins text-slate-600 text-sm sm:text-base md:text-[17px] max-w-2xl mx-auto leading-relaxed">
          Your digital academic library for MJCET. Access lecture notes, previous year question papers, lab manuals, and syllabus instantly.
        </p>
       
        {/* Main Search Bar (Primary Interaction) */}
        <div className="pt-2 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() =>
              openSearch(
                selectedCategory !== 'All Resources'
                  ? getCategorySearchQuery(selectedCategory)
                  : ''
              )
            }
            id="home-primary-search-button"
            className="w-full flex items-center justify-between gap-3 p-1.5 sm:p-2 pl-4 sm:pl-5 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-blue-400 rounded-full shadow-sm hover:shadow-md text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Search className="w-5 h-5 text-[#2563EB] group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-xs sm:text-sm text-slate-400 font-normal truncate">
                {selectedCategory !== 'All Resources'
                  ? `Search ${selectedCategory} in library...`
                  : 'Search notes, assignments, PYQs, lab manuals...'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <kbd className="hidden sm:inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-mono font-medium text-slate-400 bg-slate-100/90 border border-slate-200/70 rounded-md">
                Press /
              </kbd>
              <span className="inline-flex items-center px-4 sm:px-5 py-2 bg-[#1E60F2] text-white text-xs sm:text-sm font-medium rounded-full shadow-2xs group-hover:bg-blue-700 transition-colors">
                Search
              </span>
            </div>
          </button>
        </div>

        {/* ============================================================ */}
        {/* RESOURCE CATEGORY PILLS (DYNAMICALLY ADAPTING TO CMS) */}
        {/* ============================================================ */}
        <div className="pt-3 space-y-2.5 max-w-3xl mx-auto">
          {/* Row 1 */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {row1Categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const IconComponent = getCategoryIcon(cat.name, cat.iconName);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer select-none shadow-2xs ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <IconComponent
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2 */}
          {row2Categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
              {row2Categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const IconComponent = getCategoryIcon(cat.name, cat.iconName);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer select-none shadow-2xs ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SEMESTER FILTER PILL SEGMENTED CONTROL */}
        {/* ============================================================ */}
        <div className="pt-3 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/90 rounded-full border border-slate-300/80 max-w-full overflow-x-auto no-scrollbar shadow-2xs">
            {semesterOptions.slice(0, 5).map((sem) => {
              const isSelected = selectedSemester === sem;
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sem}
                </button>
              );
            })}

            {/* Extended semesters dropdown/selector if more than 5 */}
            {semesterOptions.length > 5 && (
              <div className="hidden md:inline-flex items-center gap-1">
                {semesterOptions.slice(5).map((sem) => {
                  const isSelected = selectedSemester === sem;
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sem}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DYNAMIC CONTENT: CATEGORY VIEW vs SUBJECTS CURRICULUM */}
      {/* ============================================================ */}
      {selectedCategory !== 'All Resources' ? (
        <section id="category-explorer-section">
          <CategoryResourcesView
            categoryName={selectedCategory}
            categoryId={selectedCategoryObj?.id || ''}
            selectedSemester={selectedSemester}
            onClearCategory={() => setSelectedCategory('All Resources')}
            subjects={subjects}
          />
        </section>
      ) : (
        <section id="subjects-section" className="space-y-6">
          <div className="space-y-2 pb-2 border-b border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Curriculum Subjects
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select a subject to explore lecture notes, question banks, PYQs, and lab materials.
                </p>
              </div>

              <div className="text-xs font-medium text-slate-500 shrink-0">
                Showing {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
              </div>
            </div>
          </div>

          {/* Content Body: Grid of Subjects */}
          {isLoading ? (
            <SubjectListSkeleton count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : filteredSubjects.length === 0 ? (
            <EmptyState
              title="No subjects in this semester"
              description="No subjects are registered under the selected semester filter."
              actionLabel="View All Semesters"
              onAction={() => setSelectedSemester('All Semesters')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredSubjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. RECENTLY VIEWED (Contextual) */}
      {/* ============================================================ */}
      {recents.length > 0 && selectedCategory === 'All Resources' && (
        <section id="recently-viewed-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recently Viewed</span>
            </h2>
            <Link
              to="/bookmarks"
              className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Saved bookmarks →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recents.map((item) => (
              <Link
                key={item.recent.resourceId}
                to={`/resource/${item.resource.id}`}
                className="group p-3.5 bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                    {item.resource.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.subject?.name || 'MJCET Resource'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
