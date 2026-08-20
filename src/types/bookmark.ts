import { Resource } from './resource';
import { Subject } from './subject';
import { Folder } from './folder';

export interface Bookmark {
  id: string;
  resourceId: string;
  savedAt: string;
}

export interface EnrichedBookmark {
  bookmark: Bookmark;
  resource: Resource;
  subject?: Subject;
  folder?: Folder;
}

export interface RecentItem {
  resourceId: string;
  viewedAt: string;
}

export interface EnrichedRecentItem {
  recent: RecentItem;
  resource: Resource;
  subject?: Subject;
  folder?: Folder;
}
