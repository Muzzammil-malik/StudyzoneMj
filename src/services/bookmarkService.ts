import { Bookmark, EnrichedBookmark } from '../types/bookmark';
import { contentService } from './contentService';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'studyzone_mjcet_bookmarks_v1';

class BookmarkService {
  private local(): Bookmark[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
  private saveLocal(value: Bookmark[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
  private notify() { window.dispatchEvent(new CustomEvent('studyzone:bookmarks-changed')); }
  private async user() { return (await supabase.auth.getUser()).data.user; }

  async getBookmarks(): Promise<Bookmark[]> {
    const user = await this.user();
    if (!user) return this.local();
    const { data, error } = await supabase.from('bookmarks').select('id, resource_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({ id: row.id, resourceId: row.resource_id, savedAt: row.created_at }));
  }

  async getEnrichedBookmarks(): Promise<EnrichedBookmark[]> {
    const bookmarks = await this.getBookmarks();
    const enriched: EnrichedBookmark[] = [];
    for (const bookmark of bookmarks) {
      const resource = await contentService.getResource(bookmark.resourceId);
      if (resource) enriched.push({ bookmark, resource, subject: await contentService.getSubject(resource.subjectId) || undefined, folder: await contentService.getFolder(resource.folderId) || undefined });
    }
    return enriched;
  }

  async isBookmarked(resourceId: string) { return (await this.getBookmarks()).some((bookmark) => bookmark.resourceId === resourceId); }

  async bookmarkResource(resourceId: string): Promise<Bookmark> {
    const user = await this.user();
    if (!user) {
      const existing = this.local().find((bookmark) => bookmark.resourceId === resourceId);
      if (existing) return existing;
      const bookmark = { id: `local-${crypto.randomUUID()}`, resourceId, savedAt: new Date().toISOString() };
      this.saveLocal([bookmark, ...this.local()]); this.notify(); return bookmark;
    }
    const { data, error } = await supabase.from('bookmarks').upsert({ user_id: user.id, resource_id: resourceId }, { onConflict: 'user_id,resource_id' }).select('id, resource_id, created_at').single();
    if (error) throw error;
    const bookmark = { id: data.id, resourceId: data.resource_id, savedAt: data.created_at };
    this.notify(); return bookmark;
  }

  async removeBookmark(resourceId: string) {
    const user = await this.user();
    if (!user) this.saveLocal(this.local().filter((bookmark) => bookmark.resourceId !== resourceId));
    else { const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('resource_id', resourceId); if (error) throw error; }
    this.notify();
  }

  async toggleBookmark(resourceId: string) { const current = await this.isBookmarked(resourceId); if (current) { await this.removeBookmark(resourceId); return false; } await this.bookmarkResource(resourceId); return true; }
}

export const bookmarkService = new BookmarkService();
