import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit3, FiEye, FiTrash2, FiClock, FiChevronDown, FiCheckCircle, FiX } from 'react-icons/fi';
import { deleteBlogService, getAllBlogsService } from '../service/blog.service';


const renderCustomGraphic = (type) => {
    if (type === 'motion') {
        return (
            <div className="w-full h-full bg-[#EBF0FF] p-4 flex flex-col justify-between">
                <span className="text-xs font-bold text-indigo-700">
                    60 FPS
                </span>

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

                    <span className="text-2xl font-bold text-emerald-800">
                        0.012
                    </span>

                    <p className="text-[10px] font-medium text-slate-400">
                        Optimal Score
                    </p>
                </div>

                <svg
                    className="w-full h-8 text-emerald-500"
                    viewBox="0 0 100 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <path d="M0 25 C30 25, 40 5, 100 8" />
                </svg>
            </div>
        );
    }
    return null;
};


const DraftsPage = () => {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Last Modified');
    const [selectedDraftId, setSelectedDraftId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [deleting, setDeleting] = useState(false);


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);


    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const response = await getAllBlogsService();
            // console.log('All Blogs API Response:', response);
            let blogs = [];
            if (Array.isArray(response)) {
                blogs = response;
            } else if (Array.isArray(response?.data)) {
                blogs = response.data;
            } else if (Array.isArray(response?.blogs)) {
                blogs = response.blogs;
            } else if (Array.isArray(response?.data?.blogs)) {
                blogs = response.data.blogs;
            } else if (Array.isArray(response?.result)) {
                blogs = response.result;
            } else if (Array.isArray(response?.data?.data)) {
                blogs = response.data.data;
            }

            // console.log('Blogs extracted:', blogs);
            const draftBlogs = blogs.filter((blog) => {
                const blogStatus = String(
                    blog?.status ??
                    blog?.publishStatus ??
                    blog?.publicationStatus ??
                    ''
                )
                    .trim()
                    .toLowerCase();
                const isDeleted =
                    blog?.isDeleted === true ||
                    blog?.deleted === true ||
                    blog?.deletedAt;
                return (
                    blogStatus === 'draft' &&
                    !isDeleted
                );
            });
            // console.log('Draft Blogs:', draftBlogs);
            setDrafts(draftBlogs);
        } catch (error) {
            console.error('Fetch Draft Blogs Error:', error);
            setDrafts([]);
            setToastMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to load drafts'
            );
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchDrafts();
    }, []);


    const getBlogId = (blog) => {
        return blog?.id ?? blog?._id;
    };

    const getBlogTitle = (blog) => {
        return (
            blog?.title ??
            blog?.headline ??
            'Untitled Draft'
        );
    };

    const getBlogDescription = (blog) => {
        return (
            blog?.excerpt ??
            blog?.description ??
            blog?.subtitle ??
            ''
        );
    };

    const getBlogTags = (blog) => {
        const rawTags = blog?.tags;
        if (
            rawTags === null ||
            rawTags === undefined ||
            rawTags === '' ||
            (Array.isArray(rawTags) && rawTags.length === 0)
        ) {
            return [];
        }

        const normalizeTag = (tag) => {
            if (tag === null || tag === undefined) {
                return '';
            }

            if (typeof tag === 'object') {
                return String(
                    tag?.name ??
                    tag?.title ??
                    tag?.label ??
                    ''
                )
                    .trim()
                    .replace(/^["']+|["']+$/g, '');
            }

            return String(tag)
                .trim()
                .replace(/^["']+|["']+$/g, '');
        };

        let tags = rawTags;
        if (Array.isArray(tags)) {
            tags = tags.flat(Infinity);
        }

        else if (typeof tags === 'string') {
            let value = tags.trim();
            if (
                !value ||
                value === '[]' ||
                value === '[ ]' ||
                value.toLowerCase() === 'null' ||
                value.toLowerCase() === 'undefined'
            ) {
                return [];
            }
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    tags = parsed.flat(Infinity);
                } else {
                    tags = [parsed];
                }
            } catch (error) {
                value = value
                    .replace(/^\s*\[\s*/, '')
                    .replace(/\s*\]\s*$/, '');
                tags = value
                    .split(/"\s*,?\s*"|'\s*,?\s*'|,\s*/)
                    .map((tag) => normalizeTag(tag))
                    .filter(Boolean);
            }
        }

        if (!Array.isArray(tags)) {
            tags = [tags];
        }

        return tags
            .flat(Infinity)
            .map((tag) => normalizeTag(tag))
            .filter(
                (tag) =>
                    tag &&
                    tag !== '[]' &&
                    tag !== '[ ]' &&
                    tag.toLowerCase() !== 'null' &&
                    tag.toLowerCase() !== 'undefined'
            )
            .filter(
                (tag, index, array) =>
                    array.indexOf(tag) === index
            );
    };


    const getBlogImage = (blog) => {
        return (
            blog?.imageUrl ??
            blog?.image?.url ??
            (typeof blog?.image === 'string'
                ? blog.image
                : '') ??
            blog?.featuredImage ??
            blog?.featuredImageUrl ??
            blog?.coverImage ??
            blog?.thumbnail ??
            ''
        );
    };


    const getAuthorName = (blog) => {
        if (!blog?.author) {
            return '';
        }
        if (typeof blog.author === 'object') {
            return (
                blog.author?.name ??
                blog.author?.fullName ??
                blog.author?.username ??
                ''
            );
        }
        return String(blog.author);
    };


    const getUpdatedAt = (blog) => {
        const dateValue =
            blog?.updatedAt ??
            blog?.modifiedAt ??
            blog?.createdAt ??
            blog?.publicationDate ??
            blog?.publishDate;
        if (!dateValue) {
            return 'Recently updated';
        }
        try {
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) {
                return String(dateValue);
            }
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMinutes = Math.floor(
                diffMs / (1000 * 60)
            );
            if (diffMinutes < 1) {
                return 'Updated just now';
            }
            if (diffMinutes < 60) {
                return `Updated ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'
                    } ago`;
            }
            const diffHours = Math.floor(
                diffMinutes / 60
            );
            if (diffHours < 24) {
                return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'
                    } ago`;
            }
            const diffDays = Math.floor(
                diffHours / 24
            );
            if (diffDays < 7) {
                return `Updated ${diffDays} day${diffDays === 1 ? '' : 's'
                    } ago`;
            }
            return `Updated ${date.toLocaleDateString(
                'en-US',
                {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                }
            )}`;
        } catch (error) {
            return 'Recently updated';
        }
    };


    const filteredDrafts = drafts
        .filter((draft) => {
            const query =
                searchQuery.toLowerCase().trim();
            if (!query) {
                return true;
            }
            const title = getBlogTitle(draft)
                .toLowerCase();
            const description =
                getBlogDescription(draft)
                    .toLowerCase();
            const tags = getBlogTags(draft);
            return (
                title.includes(query) ||
                description.includes(query) ||
                tags.some((tag) =>
                    String(tag)
                        .toLowerCase()
                        .includes(query)
                )
            );
        })
        .sort((a, b) => {
            if (sortBy === 'Title') {
                return getBlogTitle(a).localeCompare(
                    getBlogTitle(b)
                );
            }

            if (sortBy === 'Oldest') {
                const dateA = new Date(
                    a?.updatedAt ??
                    a?.createdAt ??
                    0
                ).getTime();

                const dateB = new Date(
                    b?.updatedAt ??
                    b?.createdAt ??
                    0
                ).getTime();
                return dateA - dateB;
            }
            const dateA = new Date(
                a?.updatedAt ??
                a?.createdAt ??
                0
            ).getTime();
            const dateB = new Date(
                b?.updatedAt ??
                b?.createdAt ??
                0
            ).getTime();

            return dateB - dateA;
        });


    const promptDelete = (id) => {
        setSelectedDraftId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDraftId || deleting) {
            return;
        }
        try {
            setDeleting(true);
            // console.log('Soft deleting draft:',selectedDraftId);
            const response =
                await deleteBlogService(
                    selectedDraftId
                );
            // console.log('Soft Delete Response:',response);
            setDrafts((prevDrafts) =>
                prevDrafts.filter(
                    (draft) =>
                        getBlogId(draft) !==
                        selectedDraftId
                )
            );
            setToastMessage('Draft deleted successfully');
            setShowToast(true);
            setIsConfirmOpen(false);
            setSelectedDraftId(null);
        } catch (error) {
            console.error('Soft Delete Draft Error:', error);
            setToastMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to delete draft'
            );
            setShowToast(true);
        } finally {
            setDeleting(false);
        }
    };


    const handlePreview = (draft) => {
        const draftId = getBlogId(draft);
        navigate(`/preview-blogs?id=${draftId}`, {
            state: {
                articleData: draft,
                fromDashboard: false,
                fromDrafts: true
            }
        });
    };


    const handleContinueEditing = (draft) => {
        const draftId = getBlogId(draft);
        navigate(`/edit-blogs?edit=${draftId}`);
    };


    if (loading) {
        return (
            <div className="bg-[#F8F9FD] text-slate-700 font-sans">
                <div className="w-full space-y-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                                Drafts
                            </h1>

                            <span className="px-2.5 py-0.5 bg-[#EAEFFC] text-indigo-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                Loading...
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Work-in-progress posts waiting for editorial review or publication.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-sm font-semibold text-slate-700">
                            Loading drafts...
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Fetching your draft blogs.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FD] text-slate-700 font-sans">
            <div className="w-full space-y-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                            Drafts
                        </h1>

                        <span className="px-2.5 py-0.5 bg-[#EAEFFC] text-indigo-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            {drafts.length} Drafts
                        </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Work-in-progress posts waiting for editorial review or publication.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <FiSearch
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search drafts..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            className="w-full bg-[#F2F5FB] border-0 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                SORT:
                            </span>

                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(
                                            e.target.value
                                        )
                                    }
                                    className="bg-[#F2F5FB] border-0 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 appearance-none focus:outline-none cursor-pointer"
                                >
                                    <option value="Last Modified">
                                        Last Modified
                                    </option>

                                    <option value="Oldest">
                                        Oldest
                                    </option>
                                </select>
                                <FiChevronDown
                                    size={14}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    {filteredDrafts.map((draft) => {
                        const draftId =
                            getBlogId(draft);

                        const title =
                            getBlogTitle(draft);

                        const description =
                            getBlogDescription(draft);

                        const tags =
                            getBlogTags(draft);

                        const image =
                            getBlogImage(draft);

                        const author =
                            getAuthorName(draft);

                        const updatedAt =
                            getUpdatedAt(draft);

                        return (
                            <div
                                key={draftId}
                                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                            >
                                <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-50">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    'none';
                                            }}
                                        />
                                    ) : draft?.graphicType ? (
                                        renderCustomGraphic(
                                            draft.graphicType
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-[#F2F5FB] flex items-center justify-center">
                                            <span className="text-xs font-semibold text-slate-400">
                                                No cover image
                                            </span>
                                        </div>
                                    )}

                                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-slate-700 rounded-full text-[11px] font-semibold shadow-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                        Draft
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map((tag, index) => (
                                                    <span
                                                        key={`${tag}-${index}`}
                                                        className="px-2.5 py-1 bg-[#EEF3FF] text-indigo-700 rounded-md text-[11px] font-semibold"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <h2
                                            onClick={() =>
                                                handleContinueEditing(
                                                    draft
                                                )
                                            }
                                            className="text-base font-serif font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
                                        >
                                            {title}
                                        </h2>

                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {description ||
                                                'No excerpt available for this draft.'}
                                        </p>
                                    </div>

                                    <div className="pt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                                        <FiClock
                                            size={12}
                                            className="text-slate-400 shrink-0"
                                        />

                                        <span>
                                            {updatedAt}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 pt-0 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleContinueEditing(
                                                draft
                                            )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#5B50EA] hover:bg-[#4C41DF] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <FiEdit3 size={14} />
                                        <span>
                                            Continue Editing
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePreview(
                                                draft
                                            )
                                        }
                                        className="p-2 bg-[#F2F5FB] hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                                        title="Preview"
                                    >
                                        <FiEye size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            promptDelete(
                                                draftId
                                            )
                                        }
                                        className="p-2 bg-[#F2F5FB] hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                                        title="Delete Draft"
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredDrafts.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                        <p className="text-sm font-semibold text-slate-700">
                            {searchQuery
                                ? `No drafts found matching "${searchQuery}"`
                                : 'No draft blogs found'}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            {searchQuery
                                ? 'Try searching with a different term or clear filters.'
                                : 'Draft blogs saved from the editor will appear here.'}
                        </p>
                    </div>
                )}
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                                Delete Draft?
                            </h3>

                            <p className="text-xs text-slate-500 leading-relaxed">
                                Are you sure you want to delete this draft post? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setIsConfirmOpen(false)
                                }
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={
                                    handleConfirmDelete
                                }
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting
                                    ? 'Deleting...'
                                    : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 z-50">
                    <div className="flex items-center gap-2.5">
                        <FiCheckCircle
                            size={18}
                            className="text-emerald-500 shrink-0"
                        />

                        <span className="text-xs font-semibold text-slate-700">
                            {toastMessage}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowToast(false)
                        }
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

