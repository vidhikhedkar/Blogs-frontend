import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet, } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./components/admin/DashboardPage";
import EditBlogsPage from "./components/admin/EditBlogsPage";
import CreateBlogPage from "./components/admin/CreateBlogPage";
import PreviewPage from "./components/admin/PreviewPage";
import TrashPage from "./components/admin/TrashPage";
import DraftsPage from "./components/admin/DraftsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetails from "./components/blogs/BlogDetails";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOtp from "./components/auth/VerifyOtp";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";


const BlogLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};


// ADMIN LAYOUT
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
        <Route element={<BlogLayout />}>
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:id" element={<BlogDetails />}
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminRouteLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/edit-blogs" element={<EditBlogsPage />} />
            <Route path="/create-blogs" element={<CreateBlogPage />} />
            <Route path="/preview-blogs" element={<PreviewPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/trash" element={<TrashPage />} />
          </Route>
        </Route>


        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/blogs" replace />} />
        <Route path="*" element={<Navigate to="/blogs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}