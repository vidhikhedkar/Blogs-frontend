
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiPlusCircle, FiEye, FiTrash2, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { logout, verifyAuth } from '../service/auth.service';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [admin, setAdmin] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const hasEditId = searchParams.get('edit');
    const hasPreviewId = searchParams.get('id');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const logoutPopupRef = useRef(null);


    useEffect(() => {
        let mounted = true;
        const getAdminDetails = async () => {
            try {
                const response = await verifyAuth();
                if (!mounted) return;
                if (response?.isAuthenticated) {
                    setAdmin(response);
                } else {
                    setAdmin(null);
                }
            } catch (error) {
                console.error(
                    'Failed to get admin details:',
                    error
                );
                if (mounted) {
                    setAdmin(null);
                }
            }
        };
        getAdminDetails();
        return () => {
            mounted = false;
        };
    }, []);


    const username =
        admin?.username ||
        'Admin';


    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error(
                'Logout failed:',
                error
            );
            sessionStorage.clear();
            navigate('/login', {
                replace: true
            });
        } finally {
            setIsLoggingOut(false);
        }
    };


    const handleLogoutClick = () => {
        if (!isLoggingOut) {
            setShowLogoutConfirm(true);
        }
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        await handleLogout();
    };



    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                logoutPopupRef.current &&
                !logoutPopupRef.current.contains(event.target)
            ) {
                setShowLogoutConfirm(false);
            }
        };
        if (showLogoutConfirm) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLogoutConfirm]);



    const navItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: FiGrid,
            hide: false,
            passState: true
        },
        {
            label: 'Create Blog',
            path: '/create-blogs',
            icon: FiPlusCircle,
            hide: false,
            passState: true
        },
        {
            label: 'Edit Blogs',
            path: hasEditId
                ? `/edit-blogs?edit=${hasEditId}`
                : '/edit-blogs',
            icon: FiFileText,
            hide: !hasEditId,
            badge: 'Active',
            badgeColor: 'bg-amber-100 text-amber-700',
            passState: true
        },

        {
            label: 'Preview',
            path: hasPreviewId
                ? `/preview-blogs?id=${hasPreviewId}`
                : '/preview-blogs',
            icon: FiEye,
            hide: !hasPreviewId,
            badge: 'Active',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            passState: false
        },

        {
            label: 'Draft',
            path: '/drafts',
            icon: FiFileText,
            badgeColor: 'bg-indigo-50 text-indigo-600',
            hide: false,
            passState: true
        },

        {
            label: 'Trash',
            path: '/trash',
            icon: FiTrash2,
            badgeColor: 'bg-rose-50 text-rose-600',
            hide: false,
            passState: true
        },

    ];


    return (
        <div className="flex h-screen bg-[#F8F9FD] text-slate-700 font-sans antialiased overflow-hidden">
            {isSidebarOpen && (
                <div
                    onClick={() =>
                        setIsSidebarOpen(false)
                    }
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200  flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                    }
                `}
            >
                <div>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                <FiGrid size={18} />
                            </div>

                            <div>
                                <h1 className="text-base font-bold text-slate-800 leading-none">
                                    Blog Admin
                                </h1>

                                {/* <span className="text-[11px] text-slate-400 font-medium">
                                    v1.0
                                </span> */}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setIsSidebarOpen(false)
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
                            aria-label="Close menu"
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
                                if (item.hide) {
                                    return null;
                                }
                                const Icon = item.icon;
                                const itemBasePath =
                                    item.path.split('?')[0];
                                const isActive =
                                    location.pathname === itemBasePath ||
                                    (
                                        item.path === '/dashboard' &&
                                        location.pathname === '/'
                                    );
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        state={{
                                            fromDashboard:
                                                item.passState
                                        }}
                                        onClick={() =>
                                            setIsSidebarOpen(false)
                                        }
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg  font-medium text-sm  transition-all
                                            ${isActive
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} />
                                            <span>
                                                {item.label}
                                            </span>
                                        </div>

                                        {item.badge && (
                                            <span
                                                className={`text-xs px-2 py-0.5  rounded-full font-semibold
                                                    ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : item.badgeColor ||
                                                        'bg-slate-100 text-slate-600'
                                                    }
                                                `}
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
                    <div ref={logoutPopupRef} className="relative">
                        <div
                            onClick={handleLogoutClick}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="text-left truncate">
                                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                                        {username}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLogoutClick();
                                }}
                                disabled={isLoggingOut}
                                aria-label="Logout"
                                aria-busy={isLoggingOut}
                                title="Logout"
                                className="text-slate-400 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed p-1.5 transition-colors shrink-0 cursor-pointer"
                            >
                                <FiLogOut size={16} />
                            </button>
                        </div>

                        {showLogoutConfirm && (
                            <div className="absolute bottom-full left-4 right-4 mb-2 z-50">
                                <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4">
                                    <p className="text-sm font-semibold text-slate-800 mb-1">
                                        Confirm Logout
                                    </p>

                                    <p className="text-xs text-slate-500 mb-4">
                                        Are you sure you want to logout?
                                    </p>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelLogout}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={confirmLogout}
                                            disabled={isLoggingOut}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            {isLoggingOut
                                                ? 'Logging out...'
                                                : 'Logout'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
                            aria-label="Open menu"
                        >
                            <FiMenu size={20} />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span>
                                Blog Admin
                            </span>

                            <span>
                                /
                            </span>

                            <span className="text-slate-700 font-semibold capitalize">
                                {location.pathname.replace(
                                    '/',
                                    ''
                                ) || 'Overview'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                        /> */}

                        <span className="text-sm font-semibold text-slate-800">
                            {username}
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
