export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  iconName?: string;
}
