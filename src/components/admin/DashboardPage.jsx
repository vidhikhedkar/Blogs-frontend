import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiDownload, FiEye, FiEdit, FiTrash2, FiUser, FiChevronLeft, FiChevronRight, FiCheckCircle, FiX, FiInbox } from 'react-icons/fi';

const initialBlogs = [
    {
        id: 1,
        title: "The Architecture of Next-Generation Multi-Tenant CMS...",
        excerpt: "Dissecting distributed edge invalidation and latency mitigation protocols for high-...",
        category: "Technology",
        status: "Published",
        author: "Elena Rostova",
        date: "May 14, 2024",
        readTime: "6 min",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Refining Typographic Rhythm in Enterprise Design Systems",
        excerpt: "Creating mathematical scale models for responsive variable type stacks and cross-...",
        category: "Design Systems",
        status: "Published",
        author: "David Mercer",
        date: "May 11, 2024",
        readTime: "4 min",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Vector Search Paradigms for Editorial Knowledge Graphs",
        excerpt: "How neural embeddings and semantic vector search empower deep back-catalog...",
        category: "Technology",
        status: "Draft",
        author: "Julian Thorne",
        date: "May 09, 2024",
        readTime: "8 min",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "The Rituals of Asynchronous Writing Teams",
        excerpt: "A candid study into feedback cadence, inline critique hygiene, and creative focus...",
        category: "Culture",
        status: "Published",
        author: "Elena Rostova",
        date: "Apr 28, 2024",
        readTime: "5 min",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        title: "Component-Driven Authoring Beyond Rigid Page Builders",
        excerpt: "Decoupling schema contracts from visual layouts to achieve limitless modular...",
        category: "Product",
        status: "Published",
        author: "Kaveh Sarhani",
        date: "Apr 22, 2024",
        readTime: "9 min",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        title: "The Cognitive Burden of Excessive Editorial Metrics",
        excerpt: "Why tracking thirty micro-KPIs degrades article quality and how to return to signal-...",
        category: "UX Research",
        status: "Draft",
        author: "Sarah Lin",
        date: "Apr 15, 2024",
        readTime: "3 min",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        title: "Building Living Style Guides for Autonomous Product Verticals",
        excerpt: "Synchronizing Figma variable states directly into compiled CSS modules with...",
        category: "Design Systems",
        status: "Published",
        author: "David Mercer",
        date: "Apr 04, 2024",
        readTime: "7 min",
        image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"
    }
];

const ITEMS_PER_PAGE = 3;

export default function DashboardPage() {
    const navigate = useNavigate();

    // State
    const [blogs, setBlogs] = useState(initialBlogs);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const [forceEmptyState, setForceEmptyState] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);


    // Filter Logic
    const filteredBlogs = useMemo(() => {
        if (forceEmptyState) return [];

        return blogs.filter((blog) => {
            const matchesSearch =
                blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.author.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                selectedStatus === 'All Statuses' || blog.status === selectedStatus;

            const matchesCategory =
                selectedCategory === 'All Categories' || blog.category === selectedCategory;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [blogs, searchTerm, selectedStatus, selectedCategory, forceEmptyState]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;
    const paginatedBlogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBlogs, currentPage]);


    // Handlers
    const handleCreateBlog = () => {
        navigate('/create');
    };

    const handleEditBlog = (id) => {
        navigate(`/blogs?edit=${id}`);
    };


    // FIXED: Added state: { fromDashboard: true } to unblock PreviewPage
    const handlePreviewBlog = (id) => {
        const targetBlog = blogs.find((b) => b.id === id);
        navigate(`/preview?id=${id}`, {
            state: {
                fromDashboard: true,
                articleData: targetBlog
                    ? {
                        title: targetBlog.title,
                        subtitle: targetBlog.excerpt,
                        category: targetBlog.category.toUpperCase(),
                        author: { name: targetBlog.author },
                        featuredImage: targetBlog.image,
                        publishDate: targetBlog.date,
                        readTime: targetBlog.readTime
                    }
                    : null
            }
        });
    };


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);


    const handleDeleteBlog = (id) => {
        setBlogs((prev) => prev.filter((blog) => blog.id !== id));
        setToastMessage('Blog deleted successfully');
        setShowToast(true);
        setIsConfirmOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['ID,Title,Category,Status,Author,Date,ReadTime\n'];
        const rows = filteredBlogs.map(
            (b) => `"${b.id}","${b.title}","${b.category}","${b.status}","${b.author}","${b.date}","${b.readTime}"`
        );
        const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blogs-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Title & Action Buttons Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
                        <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                            {filteredBlogs.length} Total
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                        Manage, filter, and review all your published stories, editorial dispatches, and draft articles.
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                        <FiDownload size={14} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={handleCreateBlog}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                    >
                        <FiPlus size={16} />
                        <span>Create New Blog</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 shadow-sm">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by blog title, keyword..."
                        className="w-full bg-slate-50/50 md:bg-transparent text-xs pl-9 pr-4 py-2 md:py-1 text-slate-700 placeholder-slate-400 rounded-lg md:rounded-none border border-slate-200 md:border-none focus:outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-2 md:py-1 focus:outline-none cursor-pointer"
                    >
                        <option>All Statuses</option>
                        <option>Published</option>
                        <option>Draft</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-2 md:py-1 focus:outline-none cursor-pointer"
                    >
                        <option>All Categories</option>
                        <option>Technology</option>
                        <option>Design Systems</option>
                        <option>Culture</option>
                        <option>UX Research</option>
                        <option>Product</option>
                    </select>
                </div>
            </div>

            {/* Grid or Empty State */}
            {paginatedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-8">
                    {paginatedBlogs.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                        >
                            <div>
                                <div className="relative h-40 sm:h-44 overflow-hidden bg-slate-100">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                                        {post.category}
                                    </span>
                                    <span
                                        className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-md ${post.status === "Published"
                                            ? "bg-emerald-500/90 text-white"
                                            : "bg-slate-800/80 text-slate-200"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === "Published" ? "bg-white" : "bg-amber-400"}`}></span>
                                        {post.status}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h3
                                        onClick={() => handlePreviewBlog(post.id)}
                                        className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer mb-2"
                                    >
                                        {post.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                            <FiUser size={13} className="text-slate-400" />
                                            <span className="truncate max-w-22.5 sm:max-w-30">{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                                <button
                                    onClick={() => handlePreviewBlog(post.id)}
                                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                    <FiEye size={14} />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={() => handleEditBlog(post.id)}
                                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                    <FiEdit size={14} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmOpen(true)}
                                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer text-xs font-semibold text-slate-600"
                                >
                                    <FiTrash2 size={14} />
                                    <span>Delete</span>
                                </button>

                                {/* Pop Confirmation Modal */}
                                {isConfirmOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-slate-900">Delete Blog Post?</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    Are you sure you want to delete this blog? This action cannot be undone.
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsConfirmOpen(false)}
                                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBlog(post.id)}
                                                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                                                >
                                                    Confirm Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
                    <FiInbox size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-800 mb-1">No articles found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        No blog posts matched your search filters. Try adjusting your parameters or toggle empty state off.
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedStatus('All Statuses');
                            setSelectedCategory('All Categories');
                            setForceEmptyState(false);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Pagination Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <p className="text-center sm:text-left">
                    Showing <span className="font-semibold text-slate-800">{filteredBlogs.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)}</span> of <span className="font-semibold text-slate-800">{filteredBlogs.length}</span> results
                </p>

                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-600 cursor-pointer transition-colors"
                    >
                        <FiChevronLeft size={14} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center cursor-pointer transition-colors ${currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'hover:bg-slate-100 text-slate-600'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-medium text-slate-600 transition-colors"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <FiChevronRight size={14} />
                    </button>
                </div>
            </div>

          

        </div >
    );
}