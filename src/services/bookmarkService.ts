import { Bookmark, EnrichedBookmark } from '../types/bookmark';
import { contentService } from './contentService';

const STORAGE_KEY = 'studyzone_mjcet_bookmarks_v1';

/**
 * BookmarkService abstracts bookmark storage.
 * Phase 1 uses localStorage with a clean async interface.
 * Phase 3 will swap this to Supabase user_bookmarks table.
 */
class BookmarkService {
  private getLocalBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setLocalBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Unable to persist bookmark to localStorage', e);
    }
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return this.getLocalBookmarks();
  }

  async getEnrichedBookmarks(): Promise<EnrichedBookmark[]> {
    const rawBookmarks = this.getLocalBookmarks();
    const enrichedList: EnrichedBookmark[] = [];

    for (const b of rawBookmarks) {
      const resource = await contentService.getResource(b.resourceId);
      if (resource) {
        const subject = await contentService.getSubject(resource.subjectId);
        const folder = await contentService.getFolder(resource.folderId);
        enrichedList.push({
          bookmark: b,
          resource,
          subject: subject || undefined,
          folder: folder || undefined,
        });
      }
    }

    return enrichedList;
  }

  async isBookmarked(resourceId: string): Promise<boolean> {
    const list = this.getLocalBookmarks();
    return list.some((b) => b.resourceId === resourceId);
  }

  async bookmarkResource(resourceId: string): Promise<Bookmark> {
    const list = this.getLocalBookmarks();
    const existing = list.find((b) => b.resourceId === resourceId);
    if (existing) return existing;

    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      resourceId,
      savedAt: new Date().toISOString(),
    };

    list.unshift(newBookmark);
    this.setLocalBookmarks(list);
    window.dispatchEvent(new CustomEvent('studyzone:bookmarks-changed'));
    return newBookmark;
  }

  async removeBookmark(resourceId: string): Promise<void> {
    const list = this.getLocalBookmarks();
    const filtered = list.filter((b) => b.resourceId !== resourceId);
    this.setLocalBookmarks(filtered);
    window.dispatchEvent(new CustomEvent('studyzone:bookmarks-changed'));
  }

  async toggleBookmark(resourceId: string): Promise<boolean> {
    const currentlyBookmarked = await this.isBookmarked(resourceId);
    if (currentlyBookmarked) {
      await this.removeBookmark(resourceId);
      return false;
    } else {
      await this.bookmarkResource(resourceId);
      return true;
    }
  }
}

export const bookmarkService = new BookmarkService();
