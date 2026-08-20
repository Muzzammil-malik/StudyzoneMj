import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { FolderPage } from './pages/FolderPage';
import { ResourcePage } from './pages/ResourcePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin CMS
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminSemestersPage } from './pages/admin/AdminSemestersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminFoldersPage } from './pages/admin/AdminFoldersPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student Application Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="subject/:subjectId" element={<SubjectPage />} />
          <Route path="subject/:subjectId/folder/:folderId" element={<FolderPage />} />
          <Route path="resource/:resourceId" element={<ResourcePage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin CMS Backoffice Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="semesters" element={<AdminSemestersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="folders" element={<AdminFoldersPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
