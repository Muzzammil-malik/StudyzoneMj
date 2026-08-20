export interface AdminActivity {
  id: string;
  action: string;
  entityType: 'subject' | 'semester' | 'category' | 'folder' | 'resource' | 'feedback';
  entityName: string;
  createdAt: string;
}

export interface AdminSettings {
  websiteName: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  linkedInUrl: string;
  version: string;
}

export interface DashboardStats {
  totalSubjects: number;
  totalFolders: number;
  totalResources: number;
  totalSemesters: number;
  totalCategories: number;
  totalFeedback: number;
  unreadFeedback: number;
  draftResources: number;
}
