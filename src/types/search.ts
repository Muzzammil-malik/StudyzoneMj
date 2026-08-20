import { Subject } from './subject';
import { Folder } from './folder';
import { Resource } from './resource';

export type SearchResultType = 'subject' | 'folder' | 'resource';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  path: string; // URL path to navigate
  breadcrumbs: string[];
  meta?: string;
  rawItem: Subject | Folder | Resource;
}
