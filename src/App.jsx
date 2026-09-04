import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './components/admin/DashboardPage';
import EditBlogsPage from './components/admin/EditBlogsPage';
import CreateBlogPage from './components/admin/CreateBlogPage';
import PreviewPage from './components/admin/PreviewPage';
import TrashPage from './components/admin/TrashPage';
import DraftsPage from './components/admin/DraftsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/blogs" element={<EditBlogsPage />} />
          <Route path="/create" element={<CreateBlogPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/trash" element={<TrashPage />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}