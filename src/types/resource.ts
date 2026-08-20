export interface Resource {
  id: string;
  name: string; // File name or title
  title?: string; // Optional display title alias
  description?: string;
  subjectId: string;
  folderId: string;
  categoryId?: string;
  category?: string; // category name alias
  semesterId?: string;
  semester?: string;
  fileUrl: string;
  fileSize?: number; // Size in bytes
  mimeType?: string;
  pageCount?: number;
  authorOrProfessor?: string;
  academicYear?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  displayOrder?: number;
  createdAt?: string;
  downloadsCount?: number;
}
