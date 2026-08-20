export interface Folder {
  id: string;
  subjectId: string;
  parentFolderId?: string | null;
  name: string;
  description?: string;
  displayOrder?: number;
  itemCount?: number;
  createdAt?: string;
}

export interface FolderPathItem {
  id: string;
  name: string;
}
