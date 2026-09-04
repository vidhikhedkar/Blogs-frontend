import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiSearch,
    FiSliders,
    FiEdit3,
    FiEye,
    FiTrash2,
    FiClock,
    FiChevronDown,
    FiCheckCircle,
    FiX
} from 'react-icons/fi';

// Render function for dynamic graphics so they don't get placed in serializable state
const renderCustomGraphic = (type) => {
    if (type === 'motion') {
        return (
            <div className="w-full h-full bg-[#EBF0FF] p-4 flex flex-col justify-between">
                <span className="text-xs font-bold text-indigo-700">60 FPS</span>
                <div className="flex items-end justify-between gap-1.5 h-16">
                    <div className="w-full bg-indigo-300 rounded-t h-[40%]"></div>
                    <div className="w-full bg-indigo-300 rounded-t h-[75%]"></div>
                    <div className="w-full bg-indigo-300 rounded-t h-[50%]"></div>
                    <div className="w-full bg-indigo-600 rounded-t h-full"></div>
                    <div className="w-full bg-indigo-400 rounded-t h-[85%]"></div>
                    <div className="w-full bg-indigo-300 rounded-t h-[65%]"></div>
                </div>
            </div>
        );
    }
    if (type === 'cls') {
        return (
            <div className="w-full h-full bg-[#F0F4FF] p-4 flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        CUMULATIVE LAYOUT SHIFT
                    </span>
                    <span className="text-2xl font-bold text-emerald-800">0.012</span>
                    <p className="text-[10px] font-medium text-slate-400">Optimal Score</p>
                </div>
                <svg className="w-full h-8 text-emerald-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M0 25 C30 25, 40 5, 100 8" />
                </svg>
            </div>
        );
    }
    return null;
};

const initialDrafts = [
    {
        id: '1',
        title: 'Building Scalable Component Libraries with Tailwind CSS',
        description: 'A practical guide for engineering teams to structure reusable design tokens and headless UI...',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        tags: ['Tailwind', 'Design System'],
        updatedAt: 'Updated 2 hours ago',
        author: 'Sophia Turner'
    },
    {
        id: '2',
        title: 'Future of AI-Assisted Prototyping Workflows',
        description: 'Examining how generative design tools will augment rather than replace human craft and...',
        image: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&q=80',
        tags: ['AI', 'Workflows'],
        updatedAt: 'Updated 3 days ago',
        author: 'Sophia Turner'
    },
    {
        id: '3',
        title: 'Design Systems Beyond Figma: Code Parity & Governance',
        description: 'How engineering and design teams maintain zero-drift design tokens across iOS, Android,...',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        tags: ['Engineering', 'Tokens'],
        updatedAt: 'Updated Sep 01, 2026',
        author: null
    },
    {
        id: '4',
        title: 'Framer Motion vs Vanilla CSS: When to Switch',
        description: 'Performance profiling and developer ergonomics comparison for modern web motion...',
        graphicType: 'motion',
        tags: ['Animation', 'Performance'],
        updatedAt: 'Updated Aug 28, 2026',
        author: 'Sophia Turner'
    },
    {
        id: '5',
        title: 'Case Study: Re-architecting Editorial UX for 100k Readers',
        description: 'Deep dive into typography layout shifts, content layout stability, and render metrics...',
        graphicType: 'cls',
        tags: ['Case Study', 'Metrics'],
        updatedAt: 'Updated Aug 20, 2026',
        author: 'Sophia Turner'
    }
];

const DraftsPage = () => {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState(initialDrafts);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Last Modified');

    const [selectedDraftId, setSelectedDraftId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const filteredDrafts = drafts
        .filter(draft =>
            draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            draft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'Title') {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === 'Oldest') {
                return Number(a.id) - Number(b.id);
            }
            return Number(b.id) - Number(a.id); // Last Modified default sorting
        });

    const promptDelete = (id) => {
        setSelectedDraftId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedDraftId) {
            setDrafts(drafts.filter(d => d.id !== selectedDraftId));
            setToastMessage('Draft deleted successfully');
            setShowToast(true);
        }
        setIsConfirmOpen(false);
        setSelectedDraftId(null);
    };

    const handlePreview = (draft) => {
        navigate(`/preview?id=${draft.id}`, {
            state: {
                articleData: draft,
                fromDashboard: false,
                fromDrafts: true
            }
        });
    };

    return (
        <div className="bg-[#F8F9FD] text-slate-700 font-sans">
            <div className="w-full space-y-6">

                {/* Header Section */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Drafts</h1>
                        <span className="px-2.5 py-0.5 bg-[#EAEFFC] text-indigo-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            {drafts.length} Drafts
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Work-in-progress posts waiting for editorial review or publication.
                    </p>
                </div>

                {/* Search & Sort Controls Bar */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search drafts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F2F5FB] border-0 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SORT:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-[#F2F5FB] border-0 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 appearance-none focus:outline-none cursor-pointer"
                                >
                                    <option value="Last Modified">Last Modified</option>
                                    <option value="Title">Title</option>
                                    <option value="Oldest">Oldest</option>
                                </select>
                                <FiChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="p-2.5 bg-[#F2F5FB] hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                            title="Filter Options"
                        >
                            <FiSliders size={16} />
                        </button>
                    </div>
                </div>

                {/* Draft Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrafts.map((draft) => (
                        <div
                            key={draft.id}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                        >
                            <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-50">
                                {draft.image ? (
                                    <img
                                        src={draft.image}
                                        alt={draft.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    renderCustomGraphic(draft.graphicType)
                                )}

                                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-slate-700 rounded-full text-[11px] font-semibold shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                    Draft
                                </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {draft.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 bg-[#EEF3FF] text-indigo-700 rounded-md text-[11px] font-semibold"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h2
                                        onClick={() => navigate(`/blogs?edit=${draft.id}`)}
                                        className="text-base font-serif font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                        {draft.title}
                                    </h2>

                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                        {draft.description}
                                    </p>
                                </div>

                                <div className="pt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                                    <FiClock size={12} className="text-slate-400 shrink-0" />
                                    <span>
                                        {draft.updatedAt}
                                        {draft.author && ` • by ${draft.author}`}
                                    </span>
                                </div>
                            </div>

                            {/* Card Action Buttons */}
                            <div className="p-4 pt-0 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/blogs?edit=${draft.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#5B50EA] hover:bg-[#4C41DF] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    <FiEdit3 size={14} />
                                    <span>Continue Editing</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handlePreview(draft)}
                                    className="p-2 bg-[#F2F5FB] hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                                    title="Preview"
                                >
                                    <FiEye size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => promptDelete(draft.id)}
                                    className="p-2 bg-[#F2F5FB] hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                                    title="Delete Draft"
                                >
                                    <FiTrash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDrafts.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                        <p className="text-sm font-semibold text-slate-700">No drafts found matching "{searchQuery}"</p>
                        <p className="text-xs text-slate-400 mt-1">Try searching with a different term or clear filters.</p>
                    </div>
                )}

            </div>

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">Delete Draft?</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Are you sure you want to delete this draft post? This action cannot be undone.
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
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 z-50">
                    <div className="flex items-center gap-2.5">
                        <FiCheckCircle size={18} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700">
                            {toastMessage}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowToast(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DraftsPage;