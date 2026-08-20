import { RecentItem, EnrichedRecentItem } from '../types/bookmark';
import { contentService } from './contentService';

const RECENTS_KEY = 'studyzone_mjcet_recents_v1';
const MAX_RECENTS = 20;

/**
 * RecentService tracks the student's recently opened academic resources.
 */
class RecentService {
  private getLocalRecents(): RecentItem[] {
    try {
      const data = localStorage.getItem(RECENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setLocalRecents(recents: RecentItem[]): void {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
    } catch (e) {
      console.warn('Unable to persist recents to localStorage', e);
    }
  }

  async getRecentItems(): Promise<RecentItem[]> {
    return this.getLocalRecents();
  }

  async getEnrichedRecentItems(limit: number = 8): Promise<EnrichedRecentItem[]> {
    const raw = this.getLocalRecents().slice(0, limit);
    const enrichedList: EnrichedRecentItem[] = [];

    for (const item of raw) {
      const resource = await contentService.getResource(item.resourceId);
      if (resource) {
        const subject = await contentService.getSubject(resource.subjectId);
        const folder = await contentService.getFolder(resource.folderId);
        enrichedList.push({
          recent: item,
          resource,
          subject: subject || undefined,
          folder: folder || undefined,
        });
      }
    }

    return enrichedList;
  }

  async trackRecentView(resourceId: string): Promise<void> {
    let recents = this.getLocalRecents();
    // Remove if already in list to bump to top
    recents = recents.filter((r) => r.resourceId !== resourceId);

    recents.unshift({
      resourceId,
      viewedAt: new Date().toISOString(),
    });

    if (recents.length > MAX_RECENTS) {
      recents = recents.slice(0, MAX_RECENTS);
    }

    this.setLocalRecents(recents);
    window.dispatchEvent(new CustomEvent('studyzone:recents-changed'));
  }

  async clearRecentViews(): Promise<void> {
    this.setLocalRecents([]);
    window.dispatchEvent(new CustomEvent('studyzone:recents-changed'));
  }
}

export const recentService = new RecentService();
