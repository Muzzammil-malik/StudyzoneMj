export interface Subject {
  id: string;
  name: string;
  code?: string;
  department?: string;
  description?: string;
  semesterId?: string;
  semester?: string;
  credits?: number;
  displayOrder?: number;
  active?: boolean;
  resourceCount?: number;
  folderCount?: number;
  iconName?: string;
  colorTone?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'slate' | 'violet';
  createdAt?: string;
}
