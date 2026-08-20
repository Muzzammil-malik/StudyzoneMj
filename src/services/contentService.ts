import { INITIAL_SUBJECTS, INITIAL_FOLDERS, INITIAL_RESOURCES } from '../data/developmentData';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';
import { Resource } from '../types/resource';
import { Semester } from '../types/semester';
import { Category } from '../types/category';
import { SearchResult } from '../types/search';
import { FeedbackItem } from '../types/feedback';
import { AdminActivity, AdminSettings, DashboardStats } from '../types/admin';

const STORAGE_KEYS = {
  SUBJECTS: 'studyzone_mjcet_subjects_v2',
  FOLDERS: 'studyzone_mjcet_folders_v2',
  RESOURCES: 'studyzone_mjcet_resources_v2',
  SEMESTERS: 'studyzone_mjcet_semesters_v2',
  CATEGORIES: 'studyzone_mjcet_categories_v2',
  FEEDBACK: 'studyzone_mjcet_feedback_v2',
  ACTIVITIES: 'studyzone_mjcet_activities_v2',
  SETTINGS: 'studyzone_mjcet_settings_v2',
};

const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', name: 'Semester 1', displayOrder: 1, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-2', name: 'Semester 2', displayOrder: 2, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-3', name: 'Semester 3', displayOrder: 3, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-4', name: 'Semester 4', displayOrder: 4, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-5', name: 'Semester 5', displayOrder: 5, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-6', name: 'Semester 6', displayOrder: 6, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-7', name: 'Semester 7', displayOrder: 7, active: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'sem-8', name: 'Semester 8', displayOrder: 8, active: true, createdAt: '2024-09-01T00:00:00Z' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-notes', name: 'Notes', description: 'Comprehensive lecture notes, handwritten summaries, and module slides.', displayOrder: 1, active: true, iconName: 'BookOpen', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-pyq', name: 'PYQs (Previous Years)', description: 'Previous university semester examinations and internal question papers.', displayOrder: 2, active: true, iconName: 'Archive', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-qb', name: 'Question Banks', description: 'Faculty-compiled question banks and solved exam questions.', displayOrder: 3, active: true, iconName: 'HelpCircle', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-lab-manuals', name: 'Lab Manuals', description: 'Official experiment manuals and procedural guidelines.', displayOrder: 4, active: true, iconName: 'FlaskConical', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-lab-records', name: 'Lab Records', description: 'Sample verified record sheets and observation calculations.', displayOrder: 5, active: true, iconName: 'FileText', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-assignments', name: 'Assignments', description: 'Department assignment prompts, problem sets, and tutorial sheets.', displayOrder: 6, active: true, iconName: 'FileCode2', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'cat-syllabus', name: 'Syllabus', description: 'Official AICTE & Autonomous university curriculum outlines and course outcomes.', displayOrder: 7, active: true, iconName: 'ListTree', createdAt: '2024-09-01T00:00:00Z' },
];

const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    name: 'Syed Rayyan',
    email: '160424733054@mjcollege.ac.in',
    type: 'material_request',
    subjectRequested: 'Artificial Intelligence & Machine Learning',
    message: 'Could you please upload the Unit 3 Deep Learning notes and previous year midterm papers for AI?',
    status: 'unread',
    createdAt: '2025-02-18T14:32:00Z',
  },
  {
    id: 'fb-2',
    name: 'Ayesha Fatima',
    email: '160424733012@mjcollege.ac.in',
    type: 'feedback',
    message: 'The website is super fast! Can you also add Semester 6 Elective subjects soon?',
    status: 'read',
    createdAt: '2025-02-17T10:15:00Z',
  },
];

const INITIAL_ACTIVITIES: AdminActivity[] = [
  { id: 'act-1', action: 'Uploaded resource', entityType: 'resource', entityName: 'Unit 1 — DC Circuits Notes.pdf', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', action: 'Created folder', entityType: 'folder', entityName: 'Midterm PYQs 2024', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'act-3', action: 'Updated category', entityType: 'category', entityName: 'Notes', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
];

const INITIAL_SETTINGS: AdminSettings = {
  websiteName: 'StudyZone MJCET',
  footerText: 'An independent, student-first digital library crafted for Muffakham Jah College of Engineering & Technology.',
  contactEmail: '160425733134@mjcollege.ac.in',
  contactPhone: '+91 9849931637',
  linkedInUrl: 'https://www.linkedin.com/in/md-muzzammil-malik-737056364',
  version: '2.0.0 (Phase 2 CMS)',
};

/**
 * ContentService acts as the primary data interface.
 * In Phase 1 & 2, it provides full reactive CRUD capabilities with client persistence.
 * In Phase 3, this file will be swapped for Supabase Client queries without touching any UI components.
 */
class ContentService {
  private subjects: Subject[] = [];
  private folders: Folder[] = [];
  private resources: Resource[] = [];
  private semesters: Semester[] = [];
  private categories: Category[] = [];
  private feedback: FeedbackItem[] = [];
  private activities: AdminActivity[] = [];
  private settings: AdminSettings = { ...INITIAL_SETTINGS };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedSemesters = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
      this.semesters = storedSemesters ? JSON.parse(storedSemesters) : [...INITIAL_SEMESTERS];

      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = storedCategories ? JSON.parse(storedCategories) : [...INITIAL_CATEGORIES];

      const storedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (storedSubjects) {
        this.subjects = JSON.parse(storedSubjects);
      } else {
        this.subjects = INITIAL_SUBJECTS.map((s) => ({
          ...s,
          active: true,
          displayOrder: 1,
          semesterId: this.getSemesterIdByName(s.semester || 'Semester 1'),
        }));
      }

      const storedFolders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      this.folders = storedFolders ? JSON.parse(storedFolders) : [...INITIAL_FOLDERS];

      const storedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (storedResources) {
        this.resources = JSON.parse(storedResources);
      } else {
        this.resources = INITIAL_RESOURCES.map((r) => {
          const categoryId = this.inferCategoryIdFromResource(r);
          const subj = this.subjects.find((s) => s.id === r.subjectId);
          return {
            ...r,
            title: r.name,
            categoryId: categoryId,
            category: this.getCategoryNameById(categoryId),
            semesterId: subj?.semesterId || 'sem-1',
            semester: subj?.semester || 'Semester 1',
            status: 'published',
          };
        });
      }

      const storedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      this.feedback = storedFeedback ? JSON.parse(storedFeedback) : [...INITIAL_FEEDBACK];

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      this.activities = storedActivities ? JSON.parse(storedActivities) : [...INITIAL_ACTIVITIES];

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      }
    } catch {
      // Fallback
      this.semesters = [...INITIAL_SEMESTERS];
      this.categories = [...INITIAL_CATEGORIES];
      this.subjects = [...INITIAL_SUBJECTS];
      this.folders = [...INITIAL_FOLDERS];
      this.resources = [...INITIAL_RESOURCES];
      this.feedback = [...INITIAL_FEEDBACK];
      this.activities = [...INITIAL_ACTIVITIES];
      this.settings = { ...INITIAL_SETTINGS };
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(this.semesters));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(this.subjects));
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(this.folders));
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(this.resources));
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(this.feedback));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch {
      // Storage quota or SSR fallback
    }
  }

  private inferCategoryIdFromResource(r: Resource): string {
    const nameLower = (r.name || '').toLowerCase();
    const tagLower = (r.tags || []).join(' ').toLowerCase();

    if (nameLower.includes('pyq') || nameLower.includes('question paper') || tagLower.includes('pyq')) {
      return 'cat-pyq';
    }
    if (nameLower.includes('question bank') || nameLower.includes('important question') || tagLower.includes('qb')) {
      return 'cat-qb';
    }
    if (nameLower.includes('lab record') || nameLower.includes('observation record')) {
      return 'cat-lab-records';
    }
    if (nameLower.includes('lab manual') || nameLower.includes('experiment manual') || tagLower.includes('lab')) {
      return 'cat-lab-manuals';
    }
    if (nameLower.includes('assignment') || nameLower.includes('tutorial') || tagLower.includes('assignment')) {
      return 'cat-assignments';
    }
    if (nameLower.includes('syllabus') || nameLower.includes('curriculum')) {
      return 'cat-syllabus';
    }
    return 'cat-notes';
  }

  private getSemesterIdByName(name: string): string {
    const found = this.semesters.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return found ? found.id : 'sem-1';
  }

  private getCategoryNameById(id?: string): string {
    if (!id) return 'Notes';
    const found = this.categories.find((c) => c.id === id);
    return found ? found.name : 'Notes';
  }

  private logActivity(action: string, entityType: AdminActivity['entityType'], entityName: string) {
    const newAct: AdminActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      entityType,
      entityName,
      createdAt: new Date().toISOString(),
    };
    this.activities.unshift(newAct);
    if (this.activities.length > 50) this.activities.pop();
    this.saveToStorage();
  }

  private async simulateNetwork(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  // ==========================================
  // SEMESTER OPERATIONS
  // ==========================================
  async getSemesters(): Promise<Semester[]> {
    await this.simulateNetwork();
    return this.semesters
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getAllSemesters(): Promise<Semester[]> {
    await this.simulateNetwork();
    return [...this.semesters].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async createSemester(data: Omit<Semester, 'id' | 'createdAt'>): Promise<Semester> {
    await this.simulateNetwork();
    const newSemester: Semester = {
      id: `sem-${Date.now()}`,
      name: data.name,
      displayOrder: data.displayOrder || this.semesters.length + 1,
      active: data.active !== false,
      createdAt: new Date().toISOString(),
    };
    this.semesters.push(newSemester);
    this.logActivity('Created semester', 'semester', newSemester.name);
    this.saveToStorage();
    return newSemester;
  }

  async updateSemester(id: string, data: Partial<Semester>): Promise<Semester> {
    await this.simulateNetwork();
    const index = this.semesters.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Semester not found');
    const oldName = this.semesters[index].name;

    this.semesters[index] = {
      ...this.semesters[index],
      ...data,
    };

    // If name changed, update matching subjects
    if (data.name && data.name !== oldName) {
      this.subjects.forEach((subj) => {
        if (subj.semesterId === id || subj.semester === oldName) {
          subj.semester = data.name;
        }
      });
    }

    this.logActivity('Updated semester', 'semester', this.semesters[index].name);
    this.saveToStorage();
    return this.semesters[index];
  }

  async deleteSemester(id: string): Promise<void> {
    await this.simulateNetwork();
    const semester = this.semesters.find((s) => s.id === id);
    if (!semester) return;

    // Check if any subject is assigned
    const assignedSubjects = this.subjects.filter((s) => s.semesterId === id || s.semester === semester.name);
    if (assignedSubjects.length > 0) {
      throw new Error(`This semester contains ${assignedSubjects.length} subjects. Please reassign them first.`);
    }

    this.semesters = this.semesters.filter((s) => s.id !== id);
    this.logActivity('Deleted semester', 'semester', semester.name);
    this.saveToStorage();
  }

  async reorderSemesters(semesterIds: string[]): Promise<void> {
    await this.simulateNetwork();
    semesterIds.forEach((id, idx) => {
      const found = this.semesters.find((s) => s.id === id);
      if (found) found.displayOrder = idx + 1;
    });
    this.logActivity('Reordered semesters', 'semester', `${semesterIds.length} items`);
    this.saveToStorage();
  }

  // ==========================================
  // CATEGORY OPERATIONS
  // ==========================================
  async getCategories(): Promise<Category[]> {
    await this.simulateNetwork();
    return this.categories
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getAllCategories(): Promise<Category[]> {
    await this.simulateNetwork();
    return [...this.categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    await this.simulateNetwork();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      displayOrder: data.displayOrder || this.categories.length + 1,
      active: data.active !== false,
      iconName: data.iconName || 'BookOpen',
      createdAt: new Date().toISOString(),
    };
    this.categories.push(newCategory);
    this.logActivity('Created category', 'category', newCategory.name);
    this.saveToStorage();
    return newCategory;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    await this.simulateNetwork();
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    const oldName = this.categories[index].name;

    this.categories[index] = {
      ...this.categories[index],
      ...data,
    };

    // If name changed, update resources category alias
    if (data.name && data.name !== oldName) {
      this.resources.forEach((r) => {
        if (r.categoryId === id) {
          r.category = data.name;
        }
      });
    }

    this.logActivity('Updated category', 'category', this.categories[index].name);
    this.saveToStorage();
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    await this.simulateNetwork();
    const category = this.categories.find((c) => c.id === id);
    if (!category) return;

    const assignedResources = this.resources.filter((r) => r.categoryId === id);
    if (assignedResources.length > 0) {
      throw new Error(`This category contains ${assignedResources.length} resources. Please reassign them before deleting.`);
    }

    this.categories = this.categories.filter((c) => c.id !== id);
    this.logActivity('Deleted category', 'category', category.name);
    this.saveToStorage();
  }

  async reorderCategories(categoryIds: string[]): Promise<void> {
    await this.simulateNetwork();
    categoryIds.forEach((id, idx) => {
      const found = this.categories.find((c) => c.id === id);
      if (found) found.displayOrder = idx + 1;
    });
    this.logActivity('Reordered categories', 'category', `${categoryIds.length} items`);
    this.saveToStorage();
  }

  // ==========================================
  // SUBJECT OPERATIONS
  // ==========================================
  async getSubjects(semesterId?: string): Promise<Subject[]> {
    await this.simulateNetwork();
    let list = this.subjects.filter((s) => s.active !== false);

    if (semesterId && semesterId !== 'All Semesters') {
      list = list.filter((s) => s.semesterId === semesterId || s.semester === semesterId);
    }

    return list
      .map((s) => ({
        ...s,
        resourceCount: this.resources.filter((r) => r.subjectId === s.id && r.status !== 'draft').length,
        folderCount: this.folders.filter((f) => f.subjectId === s.id && !f.parentFolderId).length,
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getAllSubjects(): Promise<Subject[]> {
    await this.simulateNetwork();
    return this.subjects.map((s) => ({
      ...s,
      resourceCount: this.resources.filter((r) => r.subjectId === s.id).length,
      folderCount: this.folders.filter((f) => f.subjectId === s.id && !f.parentFolderId).length,
    }));
  }

  async getSubject(id: string): Promise<Subject | null> {
    await this.simulateNetwork();
    const subject = this.subjects.find((s) => s.id === id);
    if (!subject) return null;
    return {
      ...subject,
      resourceCount: this.resources.filter((r) => r.subjectId === subject.id && r.status !== 'draft').length,
      folderCount: this.folders.filter((f) => f.subjectId === subject.id && !f.parentFolderId).length,
    };
  }

  async createSubject(data: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    await this.simulateNetwork();
    const sem = this.semesters.find((s) => s.id === data.semesterId) || this.semesters.find((s) => s.name === data.semester);
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: data.name,
      code: data.code || 'BS-101',
      department: data.department || 'Academic Department',
      description: data.description || '',
      semesterId: sem?.id || 'sem-1',
      semester: sem?.name || data.semester || 'Semester 1',
      credits: data.credits || 3,
      displayOrder: data.displayOrder || this.subjects.length + 1,
      active: data.active !== false,
      colorTone: data.colorTone || 'blue',
      iconName: data.iconName || 'BookOpen',
      createdAt: new Date().toISOString(),
    };
    this.subjects.push(newSubject);
    this.logActivity('Created subject', 'subject', newSubject.name);
    this.saveToStorage();
    return newSubject;
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    await this.simulateNetwork();
    const index = this.subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found');

    let semesterName = data.semester || this.subjects[index].semester;
    if (data.semesterId) {
      const sem = this.semesters.find((s) => s.id === data.semesterId);
      if (sem) semesterName = sem.name;
    }

    this.subjects[index] = {
      ...this.subjects[index],
      ...data,
      semester: semesterName,
    };

    this.logActivity('Updated subject', 'subject', this.subjects[index].name);
    this.saveToStorage();
    return this.subjects[index];
  }

  async deleteSubject(id: string): Promise<void> {
    await this.simulateNetwork();
    const subject = this.subjects.find((s) => s.id === id);
    if (!subject) return;

    // Delete associated folders and resources
    this.subjects = this.subjects.filter((s) => s.id !== id);
    this.folders = this.folders.filter((f) => f.subjectId !== id);
    this.resources = this.resources.filter((r) => r.subjectId !== id);

    this.logActivity('Deleted subject and associated content', 'subject', subject.name);
    this.saveToStorage();
  }

  // ==========================================
  // FOLDER OPERATIONS
  // ==========================================
  async getFolders(subjectId: string, parentFolderId: string | null = null): Promise<Folder[]> {
    await this.simulateNetwork();
    const filtered = this.folders.filter((f) => {
      if (f.subjectId !== subjectId) return false;
      if (parentFolderId === null) return !f.parentFolderId;
      return f.parentFolderId === parentFolderId;
    });

    return filtered.map((f) => {
      const subfolderCount = this.folders.filter((sub) => sub.parentFolderId === f.id).length;
      const fileCount = this.resources.filter((r) => r.folderId === f.id && r.status !== 'draft').length;
      return {
        ...f,
        itemCount: subfolderCount + fileCount,
      };
    });
  }

  async getAllFolders(subjectId?: string): Promise<Folder[]> {
    await this.simulateNetwork();
    if (!subjectId) return [...this.folders];
    return this.folders.filter((f) => f.subjectId === subjectId);
  }

  async getFolder(folderId: string): Promise<Folder | null> {
    await this.simulateNetwork();
    const folder = this.folders.find((f) => f.id === folderId);
    if (!folder) return null;

    const subfolderCount = this.folders.filter((sub) => sub.parentFolderId === folder.id).length;
    const fileCount = this.resources.filter((r) => r.folderId === folder.id).length;
    return {
      ...folder,
      itemCount: subfolderCount + fileCount,
    };
  }

  async getFolderHierarchy(folderId: string): Promise<Folder[]> {
    await this.simulateNetwork();
    const chain: Folder[] = [];
    let currentId: string | null | undefined = folderId;

    while (currentId) {
      const folder = this.folders.find((f) => f.id === currentId);
      if (!folder) break;
      chain.unshift(folder);
      currentId = folder.parentFolderId;
    }

    return chain;
  }

  async createFolder(data: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    await this.simulateNetwork();
    const newFolder: Folder = {
      id: `fld-${Date.now()}`,
      subjectId: data.subjectId,
      parentFolderId: data.parentFolderId || null,
      name: data.name,
      description: data.description || '',
      displayOrder: data.displayOrder || 1,
      createdAt: new Date().toISOString(),
    };
    this.folders.push(newFolder);
    this.logActivity('Created folder', 'folder', newFolder.name);
    this.saveToStorage();
    return newFolder;
  }

  async updateFolder(id: string, data: Partial<Folder>): Promise<Folder> {
    await this.simulateNetwork();
    const index = this.folders.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Folder not found');

    this.folders[index] = {
      ...this.folders[index],
      ...data,
    };

    this.logActivity('Updated folder', 'folder', this.folders[index].name);
    this.saveToStorage();
    return this.folders[index];
  }

  async deleteFolder(id: string): Promise<void> {
    await this.simulateNetwork();
    const folder = this.folders.find((f) => f.id === id);
    if (!folder) return;

    // Collect all descendant folder IDs recursively
    const folderIdsToDelete = new Set<string>([id]);
    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      this.folders.forEach((f) => {
        if (f.parentFolderId && folderIdsToDelete.has(f.parentFolderId) && !folderIdsToDelete.has(f.id)) {
          folderIdsToDelete.add(f.id);
          addedNew = true;
        }
      });
    }

    this.folders = this.folders.filter((f) => !folderIdsToDelete.has(f.id));
    this.resources = this.resources.filter((r) => !folderIdsToDelete.has(r.folderId));

    this.logActivity('Deleted folder and contents', 'folder', folder.name);
    this.saveToStorage();
  }

  // ==========================================
  // RESOURCE OPERATIONS
  // ==========================================
  async getResources(folderId: string, includeDrafts: boolean = false): Promise<Resource[]> {
    await this.simulateNetwork();
    return this.resources.filter((r) => {
      if (r.folderId !== folderId) return false;
      if (!includeDrafts && r.status === 'draft') return false;
      return true;
    });
  }

  async getAllResources(filters?: {
    subjectId?: string;
    categoryId?: string;
    semesterId?: string;
    status?: 'draft' | 'published';
    search?: string;
  }): Promise<Resource[]> {
    await this.simulateNetwork();
    let list = [...this.resources];

    if (filters) {
      if (filters.subjectId) {
        list = list.filter((r) => r.subjectId === filters.subjectId);
      }
      if (filters.categoryId) {
        list = list.filter((r) => r.categoryId === filters.categoryId || r.category === filters.categoryId);
      }
      if (filters.semesterId && filters.semesterId !== 'All Semesters') {
        list = list.filter((r) => r.semesterId === filters.semesterId || r.semester === filters.semesterId);
      }
      if (filters.status) {
        list = list.filter((r) => r.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.authorOrProfessor?.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async getResource(id: string): Promise<Resource | null> {
    await this.simulateNetwork();
    const res = this.resources.find((r) => r.id === id);
    return res || null;
  }

  async createResource(data: Omit<Resource, 'id' | 'createdAt'>): Promise<Resource> {
    await this.simulateNetwork();
    const subj = this.subjects.find((s) => s.id === data.subjectId);
    const cat = this.categories.find((c) => c.id === data.categoryId) || this.categories.find((c) => c.name === data.category);

    const newResource: Resource = {
      id: `res-${Date.now()}`,
      name: data.name || data.title || 'Academic Document.pdf',
      title: data.name || data.title || 'Academic Document.pdf',
      description: data.description || '',
      subjectId: data.subjectId,
      folderId: data.folderId,
      categoryId: cat?.id || data.categoryId || 'cat-notes',
      category: cat?.name || data.category || 'Notes',
      semesterId: subj?.semesterId || data.semesterId || 'sem-1',
      semester: subj?.semester || data.semester || 'Semester 1',
      fileUrl: data.fileUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
      fileSize: data.fileSize || 1024 * 1024 * 2.4,
      mimeType: data.mimeType || 'application/pdf',
      pageCount: data.pageCount || 12,
      authorOrProfessor: data.authorOrProfessor || 'MJCET Faculty',
      academicYear: data.academicYear || '2024–2025',
      tags: data.tags || ['Lecture Notes', 'MJCET'],
      status: data.status || 'published',
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.resources.push(newResource);
    this.logActivity('Uploaded resource', 'resource', newResource.name);
    this.saveToStorage();
    return newResource;
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    await this.simulateNetwork();
    const index = this.resources.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    let catName = this.resources[index].category;
    if (data.categoryId) {
      const cat = this.categories.find((c) => c.id === data.categoryId);
      if (cat) catName = cat.name;
    }

    let semName = this.resources[index].semester;
    if (data.semesterId) {
      const sem = this.semesters.find((s) => s.id === data.semesterId);
      if (sem) semName = sem.name;
    }

    this.resources[index] = {
      ...this.resources[index],
      ...data,
      category: catName,
      semester: semName,
    };

    this.logActivity('Updated resource', 'resource', this.resources[index].name);
    this.saveToStorage();
    return this.resources[index];
  }

  async deleteResource(id: string): Promise<void> {
    await this.simulateNetwork();
    const res = this.resources.find((r) => r.id === id);
    if (!res) return;

    this.resources = this.resources.filter((r) => r.id !== id);
    this.logActivity('Deleted resource', 'resource', res.name);
    this.saveToStorage();
  }

  // ==========================================
  // CROSS-LIBRARY CATEGORY & SEMESTER QUERIES
  // ==========================================
  async getResourcesByCategory(categoryId: string, semesterFilter?: string, subjectFilter?: string): Promise<Resource[]> {
    await this.simulateNetwork();
    let list = this.resources.filter((r) => r.status !== 'draft');

    if (categoryId !== 'all' && categoryId !== 'All Resources') {
      list = list.filter((r) => r.categoryId === categoryId || r.category?.toLowerCase() === categoryId.toLowerCase());
    }

    if (semesterFilter && semesterFilter !== 'All Semesters') {
      list = list.filter((r) => r.semesterId === semesterFilter || r.semester === semesterFilter);
    }

    if (subjectFilter && subjectFilter !== 'all') {
      list = list.filter((r) => r.subjectId === subjectFilter);
    }

    return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async getRecentResources(limit: number = 6): Promise<Resource[]> {
    await this.simulateNetwork();
    return [...this.resources]
      .filter((r) => r.status !== 'draft')
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, limit);
  }

  async getPopularResources(limit: number = 4): Promise<Resource[]> {
    await this.simulateNetwork();
    return [...this.resources]
      .filter((r) => r.status !== 'draft')
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
      .slice(0, limit);
  }

  // ==========================================
  // SEARCH
  // ==========================================
  async searchAcademicContent(query: string): Promise<SearchResult[]> {
    await this.simulateNetwork();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: SearchResult[] = [];

    // 1. Search Subjects
    this.subjects.filter((s) => s.active !== false).forEach((subj) => {
      if (
        subj.name.toLowerCase().includes(cleanQuery) ||
        subj.code?.toLowerCase().includes(cleanQuery) ||
        subj.department?.toLowerCase().includes(cleanQuery) ||
        subj.description?.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: 'subject',
          id: subj.id,
          title: subj.name,
          subtitle: `${subj.code || ''} • ${subj.semester || 'Semester'} • ${subj.department || ''}`,
          detail: subj.description,
          path: `/subject/${subj.id}`,
          breadcrumbs: ['Subjects', subj.name],
          meta: `${this.resources.filter((r) => r.subjectId === subj.id && r.status !== 'draft').length} files`,
          rawItem: subj,
        });
      }
    });

    // 2. Search Folders
    this.folders.forEach((fld) => {
      const subject = this.subjects.find((s) => s.id === fld.subjectId);
      if (
        fld.name.toLowerCase().includes(cleanQuery) ||
        fld.description?.toLowerCase().includes(cleanQuery)
      ) {
        const parentChain: string[] = [];
        if (subject) parentChain.push(subject.name);

        let currParent = fld.parentFolderId;
        const middleFolders: string[] = [];
        while (currParent) {
          const p = this.folders.find((x) => x.id === currParent);
          if (p) {
            middleFolders.unshift(p.name);
            currParent = p.parentFolderId;
          } else {
            break;
          }
        }
        parentChain.push(...middleFolders);
        parentChain.push(fld.name);

        results.push({
          type: 'folder',
          id: fld.id,
          title: fld.name,
          subtitle: subject ? `${subject.name} • Folder` : 'Academic Folder',
          detail: fld.description,
          path: `/subject/${fld.subjectId}/folder/${fld.id}`,
          breadcrumbs: parentChain,
          meta: `${this.resources.filter((r) => r.folderId === fld.id && r.status !== 'draft').length} direct files`,
          rawItem: fld,
        });
      }
    });

    // 3. Search PDF Resources (Published only)
    this.resources.filter((r) => r.status !== 'draft').forEach((res) => {
      const subject = this.subjects.find((s) => s.id === res.subjectId);
      const folder = this.folders.find((f) => f.id === res.folderId);
      const tagMatch = res.tags?.some((t) => t.toLowerCase().includes(cleanQuery));

      if (
        res.name.toLowerCase().includes(cleanQuery) ||
        res.description?.toLowerCase().includes(cleanQuery) ||
        res.authorOrProfessor?.toLowerCase().includes(cleanQuery) ||
        tagMatch
      ) {
        results.push({
          type: 'resource',
          id: res.id,
          title: res.name,
          subtitle: `${subject?.name || 'Subject'} • ${folder?.name || 'Folder'} • ${res.category || 'Notes'}`,
          detail: res.description,
          path: `/resource/${res.id}`,
          breadcrumbs: [
            subject?.name || 'Subject',
            folder?.name || 'Folder',
            res.name,
          ],
          meta: res.pageCount ? `${res.pageCount} pages` : 'PDF Document',
          rawItem: res,
        });
      }
    });

    return results;
  }

  // ==========================================
  // FEEDBACK
  // ==========================================
  async getFeedbackList(): Promise<FeedbackItem[]> {
    await this.simulateNetwork();
    return [...this.feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async submitFeedback(data: Omit<FeedbackItem, 'id' | 'status' | 'createdAt'>): Promise<FeedbackItem> {
    await this.simulateNetwork();
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      name: data.name,
      email: data.email,
      type: data.type || 'feedback',
      message: data.message,
      subjectRequested: data.subjectRequested,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    this.feedback.unshift(newItem);
    this.logActivity('Received feedback', 'feedback', `${newItem.name} (${newItem.type})`);
    this.saveToStorage();
    return newItem;
  }

  async markFeedbackRead(id: string): Promise<void> {
    await this.simulateNetwork();
    const item = this.feedback.find((f) => f.id === id);
    if (item) {
      item.status = 'read';
      this.saveToStorage();
    }
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.simulateNetwork();
    this.feedback = this.feedback.filter((f) => f.id !== id);
    this.saveToStorage();
  }

  // ==========================================
  // ADMIN DASHBOARD & SETTINGS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    await this.simulateNetwork();
    return {
      totalSubjects: this.subjects.length,
      totalFolders: this.folders.length,
      totalResources: this.resources.length,
      totalSemesters: this.semesters.length,
      totalCategories: this.categories.length,
      totalFeedback: this.feedback.length,
      unreadFeedback: this.feedback.filter((f) => f.status === 'unread').length,
      draftResources: this.resources.filter((r) => r.status === 'draft').length,
    };
  }

  async getAdminActivities(): Promise<AdminActivity[]> {
    await this.simulateNetwork();
    return [...this.activities].slice(0, 10);
  }

  async getAdminSettings(): Promise<AdminSettings> {
    await this.simulateNetwork();
    return { ...this.settings };
  }

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    await this.simulateNetwork();
    this.settings = {
      ...this.settings,
      ...settings,
    };
    this.saveToStorage();
    return { ...this.settings };
  }
}

export const contentService = new ContentService();
