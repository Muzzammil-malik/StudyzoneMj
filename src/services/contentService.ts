import { supabase, RESOURCE_BUCKET } from '../lib/supabase';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';
import { Resource } from '../types/resource';
import { Semester } from '../types/semester';
import { Category } from '../types/category';
import { SearchResult } from '../types/search';
import { FeedbackItem } from '../types/feedback';
import { AdminActivity, AdminSettings, DashboardStats } from '../types/admin';

type Row = Record<string, any>;
const fail = (error: { message: string } | null): never => { throw new Error(error?.message || 'Supabase request failed.'); };
const stamp = (value?: string | null) => value || new Date().toISOString();

class ContentService {
  private async rows(table: string, query?: (builder: any) => any) { const builder = supabase.from(table); const request = query ? query(builder) : builder.select('*'); const { data, error } = await request; if (error) fail(error); return (data || []) as Row[]; }
  private async count(table: string, filters: Row) { let query: any = supabase.from(table).select('id', { count: 'exact', head: true }); Object.entries(filters).forEach(([key, value]) => { query = value === null ? query.is(key, null) : query.eq(key, value); }); const { count, error } = await query; if (error) fail(error); return count || 0; }
  private mapSemester(row: Row): Semester { return { id: row.id, name: row.name, displayOrder: row.display_order, active: row.active, createdAt: stamp(row.created_at) }; }
  private mapCategory(row: Row): Category { return { id: row.id, name: row.name, description: row.description || '', displayOrder: row.display_order, active: row.active, iconName: row.icon_name || undefined, createdAt: stamp(row.created_at) }; }
  private mapSubject(row: Row, resourceCount = 0, folderCount = 0): Subject { return { id: row.id, name: row.name, code: row.code, semesterId: row.semester_id, semester: row.semester?.name, description: row.description || '', department: row.department || '', credits: row.credits || undefined, displayOrder: row.display_order, active: row.active, iconName: row.icon_name || undefined, colorTone: row.color_tone || 'blue', resourceCount, folderCount, createdAt: stamp(row.created_at) }; }
  private mapFolder(row: Row, itemCount?: number): Folder { return { id: row.id, subjectId: row.subject_id, parentFolderId: row.parent_folder_id, name: row.name, description: row.description || '', displayOrder: row.display_order, itemCount, createdAt: stamp(row.created_at) }; }
  private async mapResource(row: Row): Promise<Resource> { const { data, error } = await supabase.storage.from(RESOURCE_BUCKET).createSignedUrl(row.file_path, 3600); if (error) fail(error); return { id: row.id, name: row.file_name || row.title, title: row.title, description: row.description || '', subjectId: row.subject_id, folderId: row.folder_id, categoryId: row.category_id, category: row.category?.name, semesterId: row.semester_id, semester: row.semester?.name, fileUrl: data.signedUrl, fileSize: row.file_size || undefined, mimeType: row.mime_type, pageCount: row.page_count || undefined, authorOrProfessor: row.author_or_professor || undefined, academicYear: row.academic_year || undefined, tags: row.tags || [], status: row.status, createdAt: stamp(row.created_at), downloadsCount: row.downloads_count }; }
  private async resourceRows(query: (builder: any) => any = (builder) => builder) { const { data, error } = await query(supabase.from('resources').select('*, category:resource_categories(name), semester:semesters(name)')); if (error) fail(error); return (data || []) as Row[]; }
  private async activity(action: string, entityType: AdminActivity['entityType'], entityName: string) { const { data: { user } } = await supabase.auth.getUser(); if (user) await supabase.from('admin_activities').insert({ actor_id: user.id, action, entity_type: entityType, entity_name: entityName }); }

  async getSemesters() { return (await this.rows('semesters', (q) => q.select('*').eq('active', true).order('display_order'))).map((r) => this.mapSemester(r)); }
  async getAllSemesters() { return (await this.rows('semesters', (q) => q.select('*').order('display_order'))).map((r) => this.mapSemester(r)); }
  async createSemester(data: Omit<Semester, 'id' | 'createdAt'>) { const { data: row, error } = await supabase.from('semesters').insert({ name: data.name, display_order: data.displayOrder, active: data.active }).select().single(); if (error) fail(error); await this.activity('Created semester', 'semester', row.name); return this.mapSemester(row); }
  async updateSemester(id: string, data: Partial<Semester>) { const { data: row, error } = await supabase.from('semesters').update({ name: data.name, display_order: data.displayOrder, active: data.active }).eq('id', id).select().single(); if (error) fail(error); return this.mapSemester(row); }
  async deleteSemester(id: string) { const { error } = await supabase.from('semesters').delete().eq('id', id); if (error) fail(error); }
  async reorderSemesters(ids: string[]) { await Promise.all(ids.map((id, index) => this.updateSemester(id, { displayOrder: index + 1 }))); }

  async getCategories() { return (await this.rows('resource_categories', (q) => q.select('*').eq('active', true).order('display_order'))).map((r) => this.mapCategory(r)); }
  async getAllCategories() { return (await this.rows('resource_categories', (q) => q.select('*').order('display_order'))).map((r) => this.mapCategory(r)); }
  async createCategory(data: Omit<Category, 'id' | 'createdAt'>) { const { data: row, error } = await supabase.from('resource_categories').insert({ name: data.name, description: data.description, display_order: data.displayOrder, active: data.active, icon_name: data.iconName }).select().single(); if (error) fail(error); return this.mapCategory(row); }
  async updateCategory(id: string, data: Partial<Category>) { const { data: row, error } = await supabase.from('resource_categories').update({ name: data.name, description: data.description, display_order: data.displayOrder, active: data.active, icon_name: data.iconName }).eq('id', id).select().single(); if (error) fail(error); return this.mapCategory(row); }
  async deleteCategory(id: string) { const { error } = await supabase.from('resource_categories').delete().eq('id', id); if (error) fail(error); }
  async reorderCategories(ids: string[]) { await Promise.all(ids.map((id, index) => this.updateCategory(id, { displayOrder: index + 1 }))); }

  private async subjectRows(includeInactive = false) { let query: any = supabase.from('subjects').select('*, semester:semesters(name)'); if (!includeInactive) query = query.eq('active', true); const { data, error } = await query.order('display_order'); if (error) fail(error); return (data || []) as Row[]; }
  async getSubjects(semesterId?: string) { let rows = await this.subjectRows(); if (semesterId && semesterId !== 'All Semesters') rows = rows.filter((r) => r.semester_id === semesterId || r.semester?.name === semesterId); return Promise.all(rows.map(async (r) => this.mapSubject(r, await this.count('resources', { subject_id: r.id, status: 'published' }), await this.count('folders', { subject_id: r.id, parent_folder_id: null })))); }
  async getAllSubjects() { const rows = await this.subjectRows(true); return Promise.all(rows.map(async (r) => this.mapSubject(r, await this.count('resources', { subject_id: r.id }), await this.count('folders', { subject_id: r.id, parent_folder_id: null })))); }
  async getSubject(id: string) { const { data, error } = await supabase.from('subjects').select('*, semester:semesters(name)').eq('id', id); if (error) fail(error); const row = data?.[0] as Row | undefined; return row ? this.mapSubject(row, await this.count('resources', { subject_id: id, status: 'published' }), await this.count('folders', { subject_id: id, parent_folder_id: null })) : null; }
  async createSubject(data: Omit<Subject, 'id' | 'createdAt'>) { const { data: row, error } = await supabase.from('subjects').insert({ name: data.name, code: data.code || 'BS-101', semester_id: data.semesterId, description: data.description, department: data.department, credits: data.credits, display_order: data.displayOrder, active: data.active, icon_name: data.iconName, color_tone: data.colorTone }).select('*, semester:semesters(name)').single(); if (error) fail(error); return this.mapSubject(row); }
  async updateSubject(id: string, data: Partial<Subject>) { const { data: row, error } = await supabase.from('subjects').update({ name: data.name, code: data.code, semester_id: data.semesterId, description: data.description, department: data.department, credits: data.credits, display_order: data.displayOrder, active: data.active, icon_name: data.iconName, color_tone: data.colorTone }).eq('id', id).select('*, semester:semesters(name)').single(); if (error) fail(error); return this.mapSubject(row); }
  async deleteSubject(id: string) { const { error } = await supabase.from('subjects').delete().eq('id', id); if (error) fail(error); }

  async getFolders(subjectId: string, parentFolderId: string | null = null) { const rows = await this.rows('folders', (q) => { const builder = q.select('*').eq('subject_id', subjectId); return (parentFolderId === null ? builder.is('parent_folder_id', null) : builder.eq('parent_folder_id', parentFolderId)).order('display_order'); }); return Promise.all(rows.map(async (r) => this.mapFolder(r, await this.count('folders', { parent_folder_id: r.id }) + await this.count('resources', { folder_id: r.id, status: 'published' })))); }
  async getAllFolders(subjectId?: string) { return (await this.rows('folders', (q) => subjectId ? q.select('*').eq('subject_id', subjectId).order('display_order') : q.select('*').order('display_order'))).map((r) => this.mapFolder(r)); }
  async getFolder(id: string) { const rows = await this.rows('folders', (q) => q.select('*').eq('id', id)); const row = rows[0]; return row ? this.mapFolder(row, await this.count('folders', { parent_folder_id: id }) + await this.count('resources', { folder_id: id, status: 'published' })) : null; }
  async getFolderHierarchy(id: string) { const all = await this.getAllFolders(); const result: Folder[] = []; let current: string | null | undefined = id; while (current) { const folder = all.find((f) => f.id === current); if (!folder) break; result.unshift(folder); current = folder.parentFolderId; } return result; }
  async createFolder(data: Omit<Folder, 'id' | 'createdAt'>) { const { data: row, error } = await supabase.from('folders').insert({ subject_id: data.subjectId, parent_folder_id: data.parentFolderId || null, name: data.name, description: data.description, display_order: data.displayOrder }).select().single(); if (error) fail(error); return this.mapFolder(row); }
  async importFolders(sourceSubjectId: string, targetSubjectId: string, sourceFolderIds: string[], targetParentFolderId: string | null = null) {
    const [sourceFolders, targetFolders] = await Promise.all([
      this.getAllFolders(sourceSubjectId),
      this.getAllFolders(targetSubjectId),
    ]);
    const sourceByParent = new Map<string, Folder[]>();
    sourceFolders.forEach((folder) => {
      const key = folder.parentFolderId || 'root';
      sourceByParent.set(key, [...(sourceByParent.get(key) || []), folder]);
    });
    const createdIds: string[] = [];
    const imported: Folder[] = [];
    const skipped: Folder[] = [];
    const targetNamesByParent = new Map<string, Set<string>>();
    targetFolders.forEach((folder) => {
      const key = folder.parentFolderId || 'root';
      const names = targetNamesByParent.get(key) || new Set<string>();
      names.add(folder.name.trim().toLowerCase());
      targetNamesByParent.set(key, names);
    });
    const nextDisplayOrder = new Map<string, number>();
    targetFolders.forEach((folder) => {
      const key = folder.parentFolderId || 'root';
      nextDisplayOrder.set(key, Math.max(nextDisplayOrder.get(key) || 0, folder.displayOrder || 0));
    });

    const copyTree = async (sourceFolder: Folder, parentFolderId: string | null) => {
      const parentKey = parentFolderId || 'root';
      const names = targetNamesByParent.get(parentKey) || new Set<string>();
      const normalizedName = sourceFolder.name.trim().toLowerCase();
      const existingFolder = targetFolders.find((folder) =>
        (folder.parentFolderId || null) === parentFolderId && folder.name.trim().toLowerCase() === normalizedName
      );
      if (existingFolder) {
        skipped.push(sourceFolder);
        const children = sourceByParent.get(sourceFolder.id) || [];
        for (const child of children) await copyTree(child, existingFolder.id);
        return;
      }

      const displayOrder = (nextDisplayOrder.get(parentKey) || 0) + 1;
      nextDisplayOrder.set(parentKey, displayOrder);
      const created = await this.createFolder({
        subjectId: targetSubjectId,
        parentFolderId,
        name: sourceFolder.name,
        description: sourceFolder.description || '',
        displayOrder,
      });
      createdIds.push(created.id);
      imported.push(created);
      names.add(normalizedName);
      targetNamesByParent.set(parentKey, names);

      const children = sourceByParent.get(sourceFolder.id) || [];
      for (const child of children) await copyTree(child, created.id);
    };

    try {
      const selectedFolders = sourceFolderIds
        .map((id) => sourceFolders.find((folder) => folder.id === id))
        .filter((folder): folder is Folder => !!folder);
      for (const sourceFolder of selectedFolders) await copyTree(sourceFolder, targetParentFolderId);
      return { imported, skipped };
    } catch (error) {
      for (const id of [...createdIds].reverse()) {
        try { await this.deleteFolder(id); } catch { /* Preserve the original import error. */ }
      }
      throw error;
    }
  }
  async updateFolder(id: string, data: Partial<Folder>) { const { data: row, error } = await supabase.from('folders').update({ subject_id: data.subjectId, parent_folder_id: data.parentFolderId, name: data.name, description: data.description, display_order: data.displayOrder }).eq('id', id).select().single(); if (error) fail(error); return this.mapFolder(row); }
  async deleteFolder(id: string) { const { error } = await supabase.from('folders').delete().eq('id', id); if (error) fail(error); }

  async getResources(folderId: string, includeDrafts = false) { const rows = await this.resourceRows((q) => q.eq('folder_id', folderId).order('created_at', { ascending: false })); return Promise.all(rows.filter((r) => includeDrafts || r.status === 'published').map((r) => this.mapResource(r))); }
  async getAllResources(filters?: { subjectId?: string; categoryId?: string; semesterId?: string; status?: 'draft' | 'published'; search?: string }) { const rows = await this.resourceRows((q) => { let b = q.order('created_at', { ascending: false }); if (filters?.subjectId) b = b.eq('subject_id', filters.subjectId); if (filters?.categoryId) b = b.eq('category_id', filters.categoryId); if (filters?.semesterId && filters.semesterId !== 'All Semesters') b = b.eq('semester_id', filters.semesterId); if (filters?.status) b = b.eq('status', filters.status); if (filters?.search) b = b.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`); return b; }); return Promise.all(rows.map((r) => this.mapResource(r))); }
  async getResource(id: string) { const rows = await this.resourceRows((q) => q.eq('id', id)); return rows[0] ? this.mapResource(rows[0]) : null; }
  async createResource(data: Omit<Resource, 'id' | 'createdAt'>) { const { data: row, error } = await supabase.from('resources').insert({ title: data.title || data.name, description: data.description, subject_id: data.subjectId, folder_id: data.folderId, category_id: data.categoryId, semester_id: data.semesterId, file_path: data.fileUrl, file_name: data.name, file_size: data.fileSize, mime_type: data.mimeType || 'application/pdf', page_count: data.pageCount, author_or_professor: data.authorOrProfessor, academic_year: data.academicYear, tags: data.tags || [], status: data.status || 'draft' }).select('*, category:resource_categories(name), semester:semesters(name)').single(); if (error) fail(error); return this.mapResource(row); }
  async updateResource(id: string, data: Partial<Resource>) { const update: Row = {}; if (data.name || data.title) { update.title = data.title || data.name; update.file_name = data.name || data.title; } if (data.description !== undefined) update.description = data.description; if (data.subjectId) update.subject_id = data.subjectId; if (data.folderId) update.folder_id = data.folderId; if (data.categoryId) update.category_id = data.categoryId; if (data.semesterId) update.semester_id = data.semesterId; if (data.fileSize !== undefined) update.file_size = data.fileSize; if (data.pageCount !== undefined) update.page_count = data.pageCount; if (data.authorOrProfessor !== undefined) update.author_or_professor = data.authorOrProfessor; if (data.academicYear !== undefined) update.academic_year = data.academicYear; if (data.tags) update.tags = data.tags; if (data.status) update.status = data.status; const { data: row, error } = await supabase.from('resources').update(update).eq('id', id).select('*, category:resource_categories(name), semester:semesters(name)').single(); if (error) fail(error); return this.mapResource(row); }
  async deleteResource(id: string) { const rows = await this.rows('resources', (q) => q.select('*').eq('id', id)); const path = rows[0]?.file_path; const { error } = await supabase.from('resources').delete().eq('id', id); if (error) fail(error); if (path) await supabase.storage.from(RESOURCE_BUCKET).remove([path]); }
  async uploadResource(file: File, metadata: any) { if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Only PDF files are allowed.'); if (file.size > 50 * 1024 * 1024) throw new Error('PDF must be smaller than 50 MB.'); const id = crypto.randomUUID(); const path = `resources/${metadata.semesterId}/${metadata.subjectId}/${metadata.folderId}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`; const { error } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: false }); if (error) fail(error); try { return await this.createResource({ ...metadata, id, name: file.name, title: metadata.title || file.name, fileUrl: path, fileSize: file.size, mimeType: 'application/pdf' } as any); } catch (error) { await supabase.storage.from(RESOURCE_BUCKET).remove([path]); throw error; } }
  async replaceResourceFile(resourceId: string, file: File) { if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Only PDF files are allowed.'); if (file.size > 50 * 1024 * 1024) throw new Error('PDF must be smaller than 50 MB.'); const rows = await this.rows('resources', (q) => q.select('*').eq('id', resourceId)); const resource = rows[0]; if (!resource) throw new Error('Resource not found.'); const path = `resources/${resource.semester_id}/${resource.subject_id}/${resource.folder_id}/${resourceId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`; const { error: uploadError } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: false }); if (uploadError) fail(uploadError); try { const { error } = await supabase.from('resources').update({ file_path: path, file_name: file.name, file_size: file.size, mime_type: 'application/pdf' }).eq('id', resourceId); if (error) fail(error); if (resource.file_path && resource.file_path !== path) await supabase.storage.from(RESOURCE_BUCKET).remove([resource.file_path]); return this.getResource(resourceId); } catch (error) { await supabase.storage.from(RESOURCE_BUCKET).remove([path]); throw error; } }
  async getResourcesByCategory(categoryId: string, semesterFilter?: string, subjectFilter?: string) { return this.getAllResources({ categoryId: categoryId === 'all' || categoryId === 'All Resources' ? undefined : categoryId, semesterId: semesterFilter === 'All Semesters' ? undefined : semesterFilter, subjectId: subjectFilter === 'all' ? undefined : subjectFilter, status: 'published' }); }
  async getRecentResources(limit = 6) { return (await this.getAllResources({ status: 'published' })).slice(0, limit); }
  async getPopularResources(limit = 4) { return (await this.getAllResources({ status: 'published' })).sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0)).slice(0, limit); }
  async searchAcademicContent(query: string) { const q = query.trim(); if (!q) return []; const [subjects, folders, resources] = await Promise.all([this.rows('subjects', (b) => b.select('*').eq('active', true).or(`name.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%`)), this.rows('folders', (b) => b.select('*').ilike('name', `%${q}%`)), this.getAllResources({ status: 'published', search: q })]); const result: SearchResult[] = []; subjects.forEach((s) => result.push({ type: 'subject', id: s.id, title: s.name, subtitle: `${s.code} • Subject`, detail: s.description, path: `/subject/${s.id}`, breadcrumbs: ['Subjects', s.name], meta: 'Subject', rawItem: this.mapSubject(s) })); folders.forEach((f) => result.push({ type: 'folder', id: f.id, title: f.name, subtitle: 'Academic Folder', detail: f.description, path: `/subject/${f.subject_id}/folder/${f.id}`, breadcrumbs: [f.name], meta: 'Folder', rawItem: this.mapFolder(f) })); resources.forEach((r) => result.push({ type: 'resource', id: r.id, title: r.name, subtitle: `${r.category || 'Resource'} • PDF`, detail: r.description, path: `/resource/${r.id}`, breadcrumbs: [r.name], meta: r.pageCount ? `${r.pageCount} pages` : 'PDF Document', rawItem: r })); return result; }
  async getFeedbackList() { return (await this.rows('feedback', (q) => q.select('*').order('created_at', { ascending: false }))).map((r) => ({ id: r.id, name: r.name, email: r.email || '', type: r.type, subjectRequested: r.subject_requested || undefined, rating: r.rating || undefined, message: r.message, status: r.status, createdAt: stamp(r.created_at) } as FeedbackItem)); }
  async submitFeedback(data: Omit<FeedbackItem, 'id' | 'status' | 'createdAt'>) { const { data: row, error } = await supabase.from('feedback').insert({ name: data.name, email: data.email || null, message: data.message, type: data.type || 'feedback', subject_requested: data.subjectRequested, rating: data.rating || null }).select().single(); if (error) fail(error); return { id: row.id, name: row.name, email: row.email || '', type: row.type, subjectRequested: row.subject_requested || undefined, rating: row.rating || undefined, message: row.message, status: row.status, createdAt: stamp(row.created_at) } as FeedbackItem; }
  async markFeedbackRead(id: string) { const { error } = await supabase.from('feedback').update({ status: 'read' }).eq('id', id); if (error) fail(error); }
  async deleteFeedback(id: string) { const { error } = await supabase.from('feedback').delete().eq('id', id); if (error) fail(error); }
  async getDashboardStats(): Promise<DashboardStats> { const [totalSubjects, totalFolders, totalResources, totalSemesters, totalCategories, totalFeedback, unreadFeedback, draftResources] = await Promise.all([this.count('subjects', {}), this.count('folders', {}), this.count('resources', {}), this.count('semesters', {}), this.count('resource_categories', {}), this.count('feedback', {}), this.count('feedback', { status: 'unread' }), this.count('resources', { status: 'draft' })]); return { totalSubjects, totalFolders, totalResources, totalSemesters, totalCategories, totalFeedback, unreadFeedback, draftResources }; }
  async getAdminActivities() { return (await this.rows('admin_activities', (q) => q.select('*').order('created_at', { ascending: false }).limit(10))).map((r) => ({ id: r.id, action: r.action, entityType: r.entity_type, entityName: r.entity_name, createdAt: stamp(r.created_at) } as AdminActivity)); }
  async getAdminSettings() { const rows = await this.rows('settings'); return rows.reduce((settings, row) => ({ ...settings, [row.key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())]: row.value }), {} as AdminSettings); }
  async updateAdminSettings(settings: Partial<AdminSettings>) { await Promise.all(Object.entries(settings).map(([key, value]) => supabase.from('settings').upsert({ key: key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), value: String(value) }))); return this.getAdminSettings(); }
}

export const contentService = new ContentService();
