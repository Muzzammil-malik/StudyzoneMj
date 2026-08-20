export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  type?: 'material_request' | 'correction' | 'feedback' | 'other';
  message: string;
  subjectRequested?: string;
  status: 'unread' | 'read';
  createdAt: string;
}
