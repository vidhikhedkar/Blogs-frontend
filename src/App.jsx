import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './components/admin/DashboardPage';
import EditBlogsPage from './components/admin/EditBlogsPage';
import CreateBlogPage from './components/admin/CreateBlogPage';
import PreviewPage from './components/admin/PreviewPage';
import TrashPage from './components/admin/TrashPage';
import DraftsPage from './components/admin/DraftsPage';
import BlogPage from './pages/BlogPage';
import BlogDetails from './components/blogs/Blogdetails';

// Wrapper component to render AdminLayout for child routes
const AdminRouteLayout = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Without Admin Layout) */}
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/blogs/:id" element={<BlogDetails />} />

        {/* Admin Routes (Wrapped in Admin Layout) */}
        <Route element={<AdminRouteLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/edit-blogs" element={<EditBlogsPage />} />
          <Route path="/create-blogs" element={<CreateBlogPage />} />
          <Route path="/preview-blogs" element={<PreviewPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}