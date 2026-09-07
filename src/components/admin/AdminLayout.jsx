import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiPlusCircle, FiEye, FiTrash2, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const hasEditId = searchParams.get('edit');
    const hasPreviewId = searchParams.get('id');

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: FiGrid, hide: false, passState: true },
        { label: 'Create Blog', path: '/create-blogs', icon: FiPlusCircle, hide: false, passState: true },
        {
            label: 'Edit Blogs',
            path: hasEditId ? `/edit-blogs?edit=${hasEditId}` : '/edit-blogs',
            icon: FiFileText,
            hide: !hasEditId,
            badge: 'Active',
            badgeColor: 'bg-amber-100 text-amber-700',
            passState: true
        },
        {
            label: 'Preview',
            path: hasPreviewId ? `/preview-blogs?id=${hasPreviewId}` : '/preview-blogs',
            icon: FiEye,
            hide: !hasPreviewId,
            badge: 'Active',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            passState: false
        },
        { label: 'Draft', path: '/drafts', icon: FiFileText, badgeColor: 'bg-indigo-50 text-indigo-600', hide: false, passState: true },
        { label: 'Trash', path: '/trash', icon: FiTrash2, badgeColor: 'bg-rose-50 text-rose-600', hide: false, passState: true },
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FD] text-slate-700 font-sans antialiased overflow-hidden">
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                <FiGrid size={18} />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-800 leading-none">Blog Admin</h1>
                                <span className="text-[11px] text-slate-400 font-medium">v1.0</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="px-4 py-6">
                        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Editorial Workflow
                        </p>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                if (item.hide) return null;

                                const Icon = item.icon;
                                const itemBasePath = item.path.split('?')[0];
                                const isActive = location.pathname === itemBasePath || (item.path === '/dashboard' && location.pathname === '/');

                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        state={{ fromDashboard: item.passState }}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </div>

                                        {item.badge && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                            <div className="text-left truncate">
                                <p className="text-xs font-bold text-slate-800 leading-tight truncate">Sophia Turner</p>
                                <p className="text-[11px] text-slate-400 truncate">Chief Editor</p>
                            </div>
                        </div>
                        <button type="button" className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors shrink-0 cursor-pointer">
                            <FiLogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
                        >
                            <FiMenu size={20} />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span>Blog Admin</span>
                            <span>/</span>
                            <span className="text-slate-700 font-semibold capitalize">
                                {location.pathname.replace('/', '') || 'Overview'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                        />

                        <span className="text-sm font-semibold text-slate-800">
                            vidhiii
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}