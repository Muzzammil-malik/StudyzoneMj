import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CloudDownload,
  FileText,
  LoaderCircle,
  RefreshCw,
  X,
  User,
  Calendar,
  GraduationCap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Category } from '../../types/category';
import { Folder } from '../../types/folder';
import { Subject } from '../../types/subject';
import { Semester } from '../../types/semester';
import { supabase } from '../../lib/supabase';
import {
  DriveScanFile,
  DriveScanResult,
  parseDriveFolderId,
  scanDriveFolder,
} from '../../services/googleDriveImportService';
import { contentService } from '../../services/contentService';

interface DriveImportModalProps {
  subjects: Subject[];
  folders: Folder[];
  categories: Category[];
  semesters?: Semester[];
  onClose: () => void;
  onImportComplete?: () => void;
}

interface PreviewFile extends DriveScanFile {
  selected: boolean;
  categoryId: string;
  folderId: string;
  semesterId: string;
  authorOrProfessor: string;
  academicYear: string;
  importStatus?: 'idle' | 'success' | 'skipped' | 'failed';
  errorMessage?: string;
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const matchingCategory = (name: string, categories: Category[]) => {
  const target = normalize(name);
  const aliases: Record<string, string> = {
    pyq: 'pyqs previous years',
    pyqs: 'pyqs previous years',
    'previous year papers': 'pyqs previous years',
    'previous years': 'pyqs previous years',
    notes: 'lecture notes',
    'lecture notes': 'lecture notes',
    syllabus: 'syllabus copy',
    'syllabus copy': 'syllabus copy',
    lab: 'lab manuals',
    'lab manuals': 'lab manuals',
  };
  const normalizedTarget = aliases[target] || target;
  return categories.find((category) => normalize(category.name) === normalizedTarget);
};

const errorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  if (code === 'INVALID_FOLDER_ID') return 'The folder ID was rejected. Check the Google Drive folder URL.';
  if (code === 'FOLDER_UNAVAILABLE') return 'Folder could not be found. Make sure the Apps Script owner can access it.';
  if (code === 'UNAUTHENTICATED') return 'Your StudyZone session is missing or expired. Please sign in again.';
  if (code === 'FORBIDDEN') return 'Only StudyZone administrators can scan Drive folders.';
  if (code === 'AUTHORIZATION_CHECK_FAILED') return 'StudyZone could not verify your admin profile. Check the Apps Script Supabase settings and profile access.';
  if (code === 'SCANNER_NOT_CONFIGURED') return 'The Apps Script scanner is missing its Supabase project settings.';
  if (code === 'SCANNER_CONNECTION_FAILED') return 'Could not load the Apps Script web app. Check its deployment URL and access settings.';
  if (code === 'SCANNER_TIMEOUT') return 'Google Drive scanner did not respond. Check the Apps Script deployment.';
  if (code === 'SCAN_LIMIT_EXCEEDED') return (error as Error).message;
  return (error as Error)?.message || 'Could not connect to the Drive scanner.';
};

export const DriveImportModal: React.FC<DriveImportModalProps> = ({
  subjects,
  folders,
  categories,
  semesters: initialSemesters,
  onClose,
  onImportComplete,
}) => {
  const [folderUrl, setFolderUrl] = useState('');
  const [scan, setScan] = useState<DriveScanResult | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [semestersList, setSemestersList] = useState<Semester[]>(initialSemesters || []);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Import feedback banner state
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    skipped: number;
    failed: number;
  } | null>(null);

  // Bulk edit values
  const [bulkSemesterId, setBulkSemesterId] = useState('');
  const [bulkAcademicYear, setBulkAcademicYear] = useState('2024–2025');
  const [bulkAuthor, setBulkAuthor] = useState('');

  // Fetch semesters dynamically if not provided
  useEffect(() => {
    if (!initialSemesters || initialSemesters.length === 0) {
      contentService.getSemesters()
        .then((data) => setSemestersList(data))
        .catch((err) => console.error('Failed to load semesters', err));
    } else {
      setSemestersList(initialSemesters);
    }
  }, [initialSemesters]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  const foldersForSubject = useMemo(
    () => folders.filter((folder) => folder.subjectId === selectedSubjectId),
    [folders, selectedSubjectId],
  );

  // Map folder hierarchy for display in dropdowns
  const folderPathMap = useMemo(() => {
    const map = new Map<string, string>();
    const idToFolder = new Map<string, Folder>();
    foldersForSubject.forEach((f) => idToFolder.set(f.id, f));
    const getPath = (f: Folder): string => {
      if (f.parentFolderId && idToFolder.has(f.parentFolderId)) {
        const parent = idToFolder.get(f.parentFolderId);
        if (parent) {
          return `${getPath(parent)} › ${f.name}`;
        }
      }
      return f.name;
    };
    foldersForSubject.forEach((f) => map.set(f.id, getPath(f)));
    return map;
  }, [foldersForSubject]);

  const selectedFiles = useMemo(
    () => previewFiles.filter((file) => file.selected),
    [previewFiles],
  );

  const selectedCount = selectedFiles.length;

  // Validation: at least one file selected, and all selected files have subject, folder, category, and semester
  const invalidFiles = useMemo(() => {
    if (!selectedSubjectId) return selectedFiles;
    return selectedFiles.filter((file) => !file.categoryId || !file.folderId || !file.semesterId);
  }, [selectedFiles, selectedSubjectId]);

  const canImport = Boolean(
    selectedSubjectId &&
    selectedCount > 0 &&
    invalidFiles.length === 0 &&
    !isImporting &&
    !isScanning,
  );

  const mapFiles = (files: DriveScanFile[], subjectId: string): PreviewFile[] => {
    const subject = subjects.find((s) => s.id === subjectId);
    const defaultSemesterId = subject?.semesterId || (semestersList[0]?.id ?? '');

    return files.map((file) => {
      const folder = folders.find(
        (item) => item.subjectId === subjectId && normalize(item.name) === normalize(file.parentFolderName),
      );
      const category = matchingCategory(file.parentFolderName, categories);
      return {
        ...file,
        selected: true,
        categoryId: category?.id || '',
        folderId: folder?.id || '',
        semesterId: defaultSemesterId,
        authorOrProfessor: '',
        academicYear: '2024–2025',
        importStatus: 'idle',
      };
    });
  };

  const handleScan = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setImportSummary(null);
    setScan(null);
    setPreviewFiles([]);

    const folderId = parseDriveFolderId(folderUrl);
    if (!folderId) {
      setError('Please enter a valid Google Drive folder URL or Folder ID.');
      return;
    }

    const scannerUrl = import.meta.env.VITE_DRIVE_SCANNER_URL;
    if (!scannerUrl) {
      setError('Configure VITE_DRIVE_SCANNER_URL with the deployed Apps Script web-app URL, then restart Vite.');
      return;
    }

    setIsScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw Object.assign(new Error('Your StudyZone session is missing or expired. Please sign in again.'), {
          code: 'UNAUTHENTICATED',
        });
      }

      const result = await scanDriveFolder(scannerUrl, folderId, session.access_token);
      const matchedSubject = subjects.find((subject) => normalize(subject.name) === normalize(result.rootFolder.name));
      const subjectId = matchedSubject?.id || '';
      setScan(result);
      setSelectedSubjectId(subjectId);
      if (matchedSubject?.semesterId) {
        setBulkSemesterId(matchedSubject.semesterId);
      }
      setPreviewFiles(mapFiles(result.files, subjectId));
    } catch (scanError) {
      setError(errorMessage(scanError));
    } finally {
      setIsScanning(false);
    }
  };

  const updateSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = subjects.find((s) => s.id === subjectId);
    const defaultSemester = subject?.semesterId || bulkSemesterId || (semestersList[0]?.id ?? '');

    setPreviewFiles((current) =>
      current.map((file) => {
        const folder = folders.find(
          (item) => item.subjectId === subjectId && normalize(item.name) === normalize(file.parentFolderName),
        );
        return {
          ...file,
          folderId: folder?.id || '',
          semesterId: file.semesterId || defaultSemester,
        };
      }),
    );
  };

  const updateFile = (fileId: string, updates: Partial<PreviewFile>) => {
    setPreviewFiles((current) =>
      current.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setPreviewFiles((current) => current.map((f) => ({ ...f, selected: checked })));
  };

  // Bulk apply helpers
  const applyBulkSemester = () => {
    if (!bulkSemesterId) return;
    setPreviewFiles((current) =>
      current.map((f) => (f.selected ? { ...f, semesterId: bulkSemesterId } : f)),
    );
  };

  const applyBulkAcademicYear = () => {
    if (!bulkAcademicYear.trim()) return;
    setPreviewFiles((current) =>
      current.map((f) => (f.selected ? { ...f, academicYear: bulkAcademicYear.trim() } : f)),
    );
  };

  const applyBulkAuthor = () => {
    setPreviewFiles((current) =>
      current.map((f) => (f.selected ? { ...f, authorOrProfessor: bulkAuthor.trim() } : f)),
    );
  };

  // Handle Import Selected
  const handleImportSelected = async () => {
    if (!canImport) return;
    setError('');
    setImportSummary(null);
    setIsImporting(true);

    try {
      const itemsToImport = selectedFiles.map((file) => ({
        title: file.name.replace(/\.pdf$/i, ''),
        description: '',
        subjectId: selectedSubjectId,
        folderId: file.folderId,
        categoryId: file.categoryId,
        semesterId: file.semesterId,
        driveFileId: file.id,
        fileName: file.name,
        authorOrProfessor: file.authorOrProfessor.trim() || null,
        academicYear: file.academicYear.trim() || null,
        tags: [file.parentFolderName].filter(Boolean),
      }));

      const result = await contentService.importDriveResources(itemsToImport);

      const successfulIds = new Set(result.imported.map((r) => r.driveFileId || r.fileUrl.replace('drive/', '')));
      const skippedIds = new Set(result.skipped.map((s) => s.id));
      const failedMap = new Map(result.failed.map((f) => [f.id, f.error]));

      // Update row statuses
      setPreviewFiles((current) =>
        current.map((file) => {
          if (successfulIds.has(file.id)) {
            return { ...file, selected: false, importStatus: 'success', errorMessage: undefined };
          }
          if (skippedIds.has(file.id)) {
            return { ...file, selected: false, importStatus: 'skipped', errorMessage: 'Already imported' };
          }
          if (failedMap.has(file.id)) {
            return { ...file, selected: true, importStatus: 'failed', errorMessage: failedMap.get(file.id) };
          }
          return file;
        }),
      );

      setImportSummary({
        imported: result.imported.length,
        skipped: result.skipped.length,
        failed: result.failed.length,
      });

      // Refresh admin resource listing
      if (onImportComplete && (result.imported.length > 0 || result.skipped.length > 0)) {
        onImportComplete();
      }
    } catch (importError) {
      console.error('Import failed', importError);
      setError((importError as Error).message || 'Failed to complete import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-2 sm:p-4 backdrop-blur-sm" role="presentation">
      <section
        className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-import-title"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CloudDownload className="h-5 w-5" />
            </span>
            <div>
              <h2 id="drive-import-title" className="font-serif text-lg font-bold text-slate-900">
                Import from Google Drive
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Scan folder metadata, customize per-resource professor, academic year, and semester, and import into StudyZone catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Close Drive importer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Scan Form */}
          <form onSubmit={handleScan} className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="drive-folder-url">Google Drive folder URL or ID</label>
            <input
              id="drive-folder-url"
              type="text"
              value={folderUrl}
              onChange={(event) => setFolderUrl(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/... or Folder ID"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              autoComplete="url"
              disabled={isScanning || isImporting}
            />
            <button
              type="submit"
              disabled={isScanning || isImporting || !folderUrl.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isScanning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
              {isScanning ? 'Scanning Google Drive...' : 'Scan Folder'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Import Summary Feedback Banner */}
          {importSummary && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                importSummary.failed > 0
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {importSummary.failed > 0 ? (
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                )}
                <span>
                  {importSummary.imported > 0
                    ? `Successfully imported ${importSummary.imported} resource${importSummary.imported === 1 ? '' : 's'}.`
                    : 'Import operation completed.'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {importSummary.imported > 0 && (
                  <span className="font-medium text-emerald-800">
                    ✓ {importSummary.imported} imported
                  </span>
                )}
                {importSummary.skipped > 0 && (
                  <span className="font-medium text-blue-700">
                    ℹ {importSummary.skipped} skipped (already in catalog)
                  </span>
                )}
                {importSummary.failed > 0 && (
                  <span className="font-medium text-rose-700">
                    ✕ {importSummary.failed} failed (check row errors below and retry)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Validation Guidance */}
          {scan && scan.totalFiles > 0 && selectedCount > 0 && invalidFiles.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                {!selectedSubjectId
                  ? 'Please select a destination StudyZone Subject to proceed.'
                  : `${invalidFiles.length} selected file${invalidFiles.length === 1 ? '' : 's'} still need a Folder, Category, or Semester.`}
              </span>
            </div>
          )}

          {/* Scanned Files Section */}
          {scan && (
            <div className="space-y-4">
              {/* Scan Overview & Subject Target */}
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Root folder</p>
                  <h3 className="mt-0.5 text-base font-bold text-slate-900">{scan.rootFolder.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Found {scan.totalFiles} PDF {scan.totalFiles === 1 ? 'file' : 'files'} in {scan.totalFolders} folders
                  </p>
                </div>
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="select-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-subject"
                    value={selectedSubjectId}
                    onChange={(event) => updateSubject(event.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Choose StudyZone Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code || 'No Code'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk Edit Controls Bar */}
              {scan.totalFiles > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Bulk Edit Selected Resources ({selectedCount} selected)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {/* Bulk Semester */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={bulkSemesterId}
                        onChange={(e) => setBulkSemesterId(e.target.value)}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
                        title="Select bulk semester"
                      >
                        <option value="">-- Bulk Semester --</option>
                        {semestersList.map((sem) => (
                          <option key={sem.id} value={sem.id}>{sem.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={applyBulkSemester}
                        disabled={!bulkSemesterId || selectedCount === 0}
                        className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Bulk Academic Year */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Academic Year (e.g. 2024–2025)"
                        value={bulkAcademicYear}
                        onChange={(e) => setBulkAcademicYear(e.target.value)}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={applyBulkAcademicYear}
                        disabled={!bulkAcademicYear.trim() || selectedCount === 0}
                        className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Bulk Author */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Author / Professor"
                        value={bulkAuthor}
                        onChange={(e) => setBulkAuthor(e.target.value)}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={applyBulkAuthor}
                        disabled={selectedCount === 0}
                        className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Files Table / Empty State */}
              {scan.totalFiles === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
                  <FileText className="h-7 w-7 text-slate-400" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">No PDF files were found in this folder.</h3>
                  <p className="mt-1 text-xs text-slate-500">The scanner only lists PDF files and does not download contents.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                  <table className="w-full min-w-[1100px] text-left text-xs">
                    <thead className="bg-slate-100/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="w-10 px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={previewFiles.length > 0 && previewFiles.every((f) => f.selected)}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                            aria-label="Select all files"
                            className="h-4 w-4 rounded accent-blue-700 cursor-pointer"
                          />
                        </th>
                        <th className="w-72 px-3 py-3">PDF Title & Path</th>
                        <th className="w-44 px-3 py-3">Category *</th>
                        <th className="w-48 px-3 py-3">Destination Folder *</th>
                        <th className="w-36 px-3 py-3">Semester *</th>
                        <th className="w-32 px-3 py-3">Academic Year</th>
                        <th className="w-36 px-3 py-3">Author / Professor</th>
                        <th className="w-24 px-3 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewFiles.map((file) => {
                        const isRowComplete = Boolean(selectedSubjectId && file.categoryId && file.folderId && file.semesterId);
                        return (
                          <tr
                            key={file.id}
                            className={`align-top transition-colors ${
                              file.selected ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={file.selected}
                                onChange={(event) => updateFile(file.id, { selected: event.target.checked })}
                                aria-label={`Select ${file.name}`}
                                className="h-4 w-4 rounded accent-blue-700 cursor-pointer"
                              />
                            </td>

                            {/* Title & Drive Path */}
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-900 leading-snug">{file.name}</p>
                              <p className="mt-0.5 break-all text-[11px] text-slate-500 font-mono leading-tight">
                                {file.relativePath}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400">ID: {file.id.slice(0, 12)}…</span>
                                <a
                                  href={`https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-medium text-blue-600 hover:underline"
                                >
                                  Open in Drive ↗
                                </a>
                              </div>
                              {file.errorMessage && (
                                <p className="mt-1 text-[11px] font-medium text-rose-600">
                                  ⚠ {file.errorMessage}
                                </p>
                              )}
                            </td>

                            {/* Category Select */}
                            <td className="px-3 py-3">
                              <select
                                value={file.categoryId}
                                onChange={(event) => updateFile(file.id, { categoryId: event.target.value })}
                                className={`w-full rounded-md border px-2 py-1.5 text-xs font-normal ${
                                  !file.categoryId ? 'border-amber-300 bg-amber-50/40 text-amber-900' : 'border-slate-300 bg-white text-slate-800'
                                }`}
                              >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                              </select>
                              <p className="mt-1 text-[10px] text-slate-500 truncate" title={`Detected: ${file.parentFolderName}`}>
                                Tag: {file.parentFolderName}
                              </p>
                            </td>

                            {/* Folder Select */}
                            <td className="px-3 py-3">
                              <select
                                value={file.folderId}
                                onChange={(event) => updateFile(file.id, { folderId: event.target.value })}
                                disabled={!selectedSubjectId}
                                className={`w-full rounded-md border px-2 py-1.5 text-xs font-normal ${
                                  !file.folderId ? 'border-amber-300 bg-amber-50/40 text-amber-900' : 'border-slate-300 bg-white text-slate-800'
                                } disabled:bg-slate-100 disabled:text-slate-400`}
                              >
                                <option value="">Select Destination Folder</option>
                                {foldersForSubject.map((folder) => (
                                  <option key={folder.id} value={folder.id}>
                                    {folderPathMap.get(folder.id) || folder.name}
                                  </option>
                                ))}
                              </select>
                              {!file.folderId && selectedSubjectId && (
                                <p className="mt-1 text-[10px] font-medium text-amber-700">Folder match required</p>
                              )}
                            </td>

                            {/* Semester Select */}
                            <td className="px-3 py-3">
                              <select
                                value={file.semesterId}
                                onChange={(event) => updateFile(file.id, { semesterId: event.target.value })}
                                className={`w-full rounded-md border px-2 py-1.5 text-xs font-normal ${
                                  !file.semesterId ? 'border-amber-300 bg-amber-50/40 text-amber-900' : 'border-slate-300 bg-white text-slate-800'
                                }`}
                              >
                                <option value="">Select Semester</option>
                                {semestersList.map((sem) => (
                                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* Academic Year Input */}
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={file.academicYear}
                                onChange={(event) => updateFile(file.id, { academicYear: event.target.value })}
                                placeholder="2024–2025"
                                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            {/* Author / Professor Input */}
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={file.authorOrProfessor}
                                onChange={(event) => updateFile(file.id, { authorOrProfessor: event.target.value })}
                                placeholder="e.g. Prof. Name"
                                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            {/* Status Badge */}
                            <td className="px-3 py-3 text-center">
                              {file.importStatus === 'success' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <Check className="h-3 w-3" /> Imported
                                </span>
                              ) : file.importStatus === 'skipped' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                  Skipped
                                </span>
                              ) : file.importStatus === 'failed' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  Failed
                                </span>
                              ) : isRowComplete ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                  Incomplete
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Counts and Action Button */}
        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-xs text-slate-600">
            {scan ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">{selectedCount}</span> of {previewFiles.length} selected.
                {invalidFiles.length > 0 && selectedCount > 0 && (
                  <span className="text-amber-700 font-medium">({invalidFiles.length} need completion)</span>
                )}
                {importSummary && (
                  <span className="text-slate-500">
                    • Last run: {importSummary.imported} added, {importSummary.skipped} skipped
                  </span>
                )}
              </span>
            ) : (
              'Scanning reads Drive file metadata only; PDFs stay in your Google Drive.'
            )}
          </div>
          <div className="flex items-center justify-end gap-2.5">
            {scan && (
              <button
                type="button"
                onClick={() => {
                  setScan(null);
                  setPreviewFiles([]);
                  setError('');
                  setImportSummary(null);
                }}
                disabled={isImporting}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Scan Another Folder
              </button>
            )}
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={!canImport || isImporting}
              title={
                !canImport
                  ? 'Select at least one resource and ensure Subject, Folder, Category, and Semester are mapped.'
                  : 'Import selected resources into StudyZone catalog'
              }
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-all ${
                canImport && !isImporting
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isImporting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Importing Resources...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Import Selected ({selectedCount})</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};