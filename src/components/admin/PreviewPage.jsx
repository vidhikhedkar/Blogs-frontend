
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
    FiEye,
    FiArrowLeft,
    FiTrash2,
    FiSend,
    FiClock,
    FiCheckCircle,
    FiTag,
    FiEdit3,
    FiEyeOff,
    FiAlertTriangle,
    FiX,
} from 'react-icons/fi';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';

import {
    getBlogByIdService,
    deleteBlogService,
} from '../service/blog.service';

export default function PreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const blogId = searchParams.get('id');

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isFromDashboard = location.state?.fromDashboard === true;
    const isFromDraft = location.state?.fromDraft === true;
    const passedArticle = location.state?.articleData;

    // ============================================================
    // GET BLOG ID
    // ============================================================

    const getBlogId = useCallback((blogData) => {
        if (!blogData) return null;

        const id =
            blogData?.id ??
            blogData?._id ??
            blogData?.blogId;

        if (!id) return null;

        if (typeof id === 'object' && id.$oid) {
            return String(id.$oid);
        }

        return String(id);
    }, []);

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const getErrorMessage = useCallback((err, fallback) => {
        return (
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.data?.message ||
            err?.data?.error ||
            err?.message ||
            fallback
        );
    }, []);

    // ============================================================
    // NORMALIZE API BLOG
    // ============================================================

    const normalizeBlog = useCallback(
        (response) => {
            let data = response;

            /*
             * Supports responses such as:
             *
             * {
             *   id: "...",
             *   title: "..."
             * }
             *
             * OR
             *
             * {
             *   data: {
             *      id: "...",
             *      title: "..."
             *   }
             * }
             *
             * OR
             *
             * {
             *   blog: {
             *      id: "...",
             *      title: "..."
             *   }
             * }
             */

            if (response?.data && !Array.isArray(response.data)) {
                data = response.data;
            }

            if (response?.blog) {
                data = response.blog;
            }

            if (response?.result) {
                data = response.result;
            }

            if (response?.data?.blog) {
                data = response.data.blog;
            }

            if (!data || typeof data !== 'object') {
                return null;
            }

            const author =
                typeof data.author === 'object'
                    ? data.author
                    : {
                        name:
                            data.author ||
                            data.authorName ||
                            '',
                        role:
                            data.authorRole ||
                            '',

                    };

            const normalizedId =
                getBlogId(data) ||
                blogId;

            return {
                ...data,

                id: normalizedId,

                title:
                    data.title ||
                    '',

                category:
                    data.category ||
                    data.categoryName ||
                    '',

                revision:
                    data.revision ||
                    data.version ||
                    '',

                subtitle:
                    data.subtitle ||
                    data.excerpt ||
                    data.description ||
                    '',

                excerpt:
                    data.excerpt ||
                    data.subtitle ||
                    data.description ||
                    '',

                content:
                    data.content ||
                    data.body ||
                    data.descriptionContent ||
                    '',

                author,

                publishDate:
                    data.publishDate ||
                    data.date ||
                    data.publishedAt ||
                    data.createdAt ||
                    '',

                readTime:
                    data.readTime ||
                    data.read_time ||
                    '',

                featuredImage:
                    data.featuredImage ||
                    data.image ||
                    data.imageUrl ||
                    data.coverImage ||
                    data.thumbnail ||
                    '',

                imageCaption:
                    data.imageCaption ||
                    data.caption ||
                    '',

                imageCredit:
                    data.imageCredit ||
                    data.credit ||
                    '',

                tags:
                    Array.isArray(data.tags)
                        ? data.tags
                        : typeof data.tags === 'string'
                            ? data.tags
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean)
                            : [],

                status:
                    data.status ||
                    data.publishStatus ||
                    data.publicationStatus ||
                    'Draft',
            };
        },
        [blogId, getBlogId]
    );

    // ============================================================
    // FETCH BLOG BY ID
    // ============================================================

    const fetchBlog = useCallback(async () => {
        if (!blogId) {
            setError('Blog ID is missing.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            console.log('Fetching preview blog:', blogId);

            const response = await getBlogByIdService(blogId);

            console.log('Preview Blog API Response:', response);

            const normalizedBlog = normalizeBlog(response);

            if (!normalizedBlog) {
                throw new Error('Blog data could not be found.');
            }

            setBlog(normalizedBlog);
        } catch (err) {
            console.error('Fetch Preview Blog Error:', err);

            /*
             * If Dashboard already passed articleData,
             * use it as a fallback while still preferring
             * the API response.
             */
            if (passedArticle) {
                const fallbackBlog = normalizeBlog(passedArticle);

                if (fallbackBlog) {
                    setBlog(fallbackBlog);
                    setError('');
                    return;
                }
            }

            setError(
                getErrorMessage(
                    err,
                    'Failed to load blog preview.'
                )
            );

            setBlog(null);
        } finally {
            setLoading(false);
        }
    }, [
        blogId,
        passedArticle,
        normalizeBlog,
        getErrorMessage,
    ]);

    // ============================================================
    // INITIAL FETCH
    // ============================================================

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    // ============================================================
    // TOAST
    // ============================================================

    useEffect(() => {
        if (!showToast) return;

        const timer = setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 1500);

        return () => clearTimeout(timer);
    }, [showToast]);

    // ============================================================
    // PUBLISH
    // ============================================================

    const handlePublish = () => {
        /*
         * Publish API was not provided.
         *
         * Keeping your existing UI behavior.
         * If you have a publish endpoint, this function
         * can be connected to it.
         */
        navigate('/dashboard');
    };

    // ============================================================
    // EDIT BLOG
    // ============================================================

    const handleEdit = () => {
        if (!blogId) {
            setToastMessage('Invalid blog ID.');
            setShowToast(true);
            return;
        }

        navigate(
            `/edit-blogs?edit=${encodeURIComponent(blogId)}`,
            {
                state: {
                    articleData: blog,
                    fromDashboard: true,
                    fromPreview: true,
                },
            }
        );
    };

    // ============================================================
    // OPEN DELETE MODAL
    // ============================================================

    const handleOpenTrash = () => {
        if (!blogId) {
            setToastMessage('Invalid blog ID.');
            setShowToast(true);
            return;
        }

        setIsConfirmOpen(true);
    };

    // ============================================================
    // CLOSE DELETE MODAL
    // ============================================================

    const handleCloseTrash = () => {
        if (deleting) return;

        setIsConfirmOpen(false);
    };

    // ============================================================
    // SOFT DELETE BLOG
    // DELETE /api/blogs/:id
    // ============================================================

    const handleConfirmTrash = async () => {
        if (!blogId || deleting) {
            return;
        }

        try {
            setDeleting(true);

            console.log(
                'Soft deleting preview blog:',
                blogId
            );

            await deleteBlogService(blogId);

            console.log(
                'Blog soft deleted successfully:',
                blogId
            );

            setIsConfirmOpen(false);

            setToastMessage(
                'Blog moved to trash successfully'
            );

            setShowToast(true);

            /*
             * Small delay so the user can see the success
             * message before returning to dashboard.
             */
            setTimeout(() => {
                navigate('/dashboard');
            }, 700);

        } catch (err) {
            console.error(
                'Soft Delete Blog Error:',
                err
            );

            setToastMessage(
                getErrorMessage(
                    err,
                    'Failed to move blog to trash.'
                )
            );

            setShowToast(true);

        } finally {
            setDeleting(false);
        }
    };

    // ============================================================
    // ACCESS CHECK
    // ============================================================

    const hasPreviewAccess =
        isFromDashboard ||
        isFromDraft ||
        Boolean(passedArticle) ||
        Boolean(blogId);

    // ============================================================
    // ACCESS BLOCKED
    // ============================================================

    if (!hasPreviewAccess) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center space-y-5">

                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                        <FiAlertTriangle className="text-2xl sm:text-3xl" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            Access Restricted
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            This preview page can only be accessed directly from the Admin Dashboard.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center max-w-sm w-full">

                    <div className="w-9 h-9 border-2 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-4" />

                    <h2 className="text-base font-bold text-slate-900">
                        Loading blog preview...
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                        Please wait while we fetch the blog.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">

                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center space-y-5">

                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                        <FiAlertTriangle className="text-2xl sm:text-3xl" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            Blog Not Found
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {error || 'The requested blog could not be found.'}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100"
                    >
                        Return to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    // ============================================================
    // ARTICLE DATA
    // ============================================================

    const article = {
        id: blog.id || blogId,

        category:
            blog.category ||
            'UI/UX DESIGN',

        revision:
            blog.revision ||
            'Draft Revision',

        title:
            blog.title ||
            'Untitled Blog',

        subtitle:
            blog.subtitle ||
            blog.excerpt ||
            '',

        content:
            blog.content ||
            null,

        author: {
            name:
                blog.author?.name ||
                blog.author?.fullName ||
                blog.author?.username ||
                'Unknown Author',

            role:
                blog.author?.role ||
                blog.author?.designation ||
                'Author',

            avatar:
                blog.author?.avatar ||
                blog.author?.image ||
                '',
        },

        publishDate:
            blog.publishDate ||
            '',

        readTime:
            blog.readTime ||
            '',

        featuredImage:
            blog.featuredImage ||
            '',

        imageCaption:
            blog.imageCaption ||
            '',

        imageCredit:
            blog.imageCredit ||
            '',

        tags:
            Array.isArray(blog.tags)
                ? blog.tags
                : [],
    };

    return (
        <div className="bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">

            {/* =====================================================
                STICKY TOP HEADER
            ====================================================== */}

            <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-2xl">

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">

                    <div className="flex flex-col gap-3 sm:gap-4">

                        {/* MAIN ROW */}

                        <div className="flex items-center justify-between gap-3">

                            {/* BRAND & STATUS */}

                            <div className="flex items-center gap-3 min-w-0">

                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                                    <FiEye className="text-lg sm:text-xl" />
                                </div>

                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                        <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                                            Blog Preview
                                        </h1>

                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 whitespace-nowrap">

                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />

                                            {String(article?.status || 'Draft')
                                                .toLowerCase() === 'published'
                                                ? 'Published'
                                                : 'Draft'}

                                        </span>

                                    </div>

                                    <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                                        ID: {article.id}
                                    </p>

                                </div>

                            </div>

                            {/* DESKTOP ACTIONS */}

                            <div className="hidden md:flex items-center gap-2 shrink-0">

                                <button
                                    onClick={handleEdit}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <FiArrowLeft size={14} />
                                    Back to Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenTrash}
                                    disabled={deleting}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <FiTrash2 size={14} />
                                    <span>Move to Trash</span>
                                </button>

                                <button
                                    onClick={handlePublish}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer"
                                >
                                    <FiSend size={14} />
                                    Publish Now
                                </button>

                            </div>

                        </div>

                        {/* MOBILE ACTION ROW */}

                        <div className="grid md:hidden grid-cols-3 gap-2 pt-1 border-t border-slate-100">

                            <button
                                onClick={handleEdit}
                                className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                            >
                                <FiArrowLeft size={13} />
                                <span>Edit</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenTrash}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <FiTrash2 size={14} />
                                <span>Move to Trash</span>
                            </button>

                            <button
                                onClick={handlePublish}
                                className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#4F46E5] hover:bg-indigo-700 active:bg-indigo-800 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                            >
                                <FiSend size={13} />
                                <span>Publish</span>
                            </button>

                        </div>

                    </div>

                </div>

            </header>

            {/* =====================================================
                MAIN ARTICLE BODY
            ====================================================== */}

            <main className="w-full py-3">

                <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 sm:space-y-8">

                    {/* META BADGES */}

                    <div className="flex flex-wrap items-center gap-2 text-xs">

                        <span className="bg-indigo-50 text-[#4F46E5] font-extrabold px-3 py-1 rounded-lg tracking-wider uppercase">
                            {article.category}
                        </span>

                        {article.revision && (
                            <span className="text-slate-400 font-medium">
                                {article.revision}
                            </span>
                        )}

                    </div>

                    {/* HEADINGS */}

                    <div className="space-y-3 sm:space-y-4">

                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] sm:leading-[1.15] tracking-tight">
                            {article.title}
                        </h1>

                        {article.subtitle && (
                            <p className="text-sm sm:text-lg text-slate-500 font-normal leading-relaxed">
                                {article.subtitle}
                            </p>
                        )}

                    </div>

                    {/* AUTHOR BANNER */}

                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-slate-900 truncate">
                                        {article.author.name}
                                    </span>

                                    {article.author.role && (
                                        <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {article.author.role}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
                                    <span className="truncate">
                                        {article.publishDate
                                            ? new Date(article.publishDate).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            )
                                            : 'No date'}
                                    </span>

                                    {article.readTime && (
                                        <>
                                            <span>•</span>

                                            <span className="flex items-center gap-1 shrink-0">
                                                <FiClock size={12} />
                                                {article.readTime}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        FEATURED IMAGE
                    ====================================================== */}

                    {article.featuredImage && (
                        <figure className="space-y-2 sm:space-y-3 pt-2">

                            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-xs max-h-60 sm:max-h-96 lg:max-h-120 bg-slate-900">

                                <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />

                            </div>

                            {(article.imageCaption || article.imageCredit) && (
                                <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 italic px-1 gap-1">

                                    <span>
                                        {article.imageCaption}
                                    </span>

                                    <span className="not-italic font-medium text-slate-400 shrink-0">
                                        {article.imageCredit}
                                    </span>

                                </figcaption>
                            )}

                        </figure>
                    )}

                    {/* =====================================================
                        CONTENT AREA
                    ====================================================== */}

                    <div className="pt-2 text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg space-y-6">

                        {article.content ? (

                            <div
                                className="prose prose-slate max-w-none prose-sm sm:prose-base lg:prose-lg"
                                dangerouslySetInnerHTML={{
                                    __html: article.content,
                                }}
                            />

                        ) : (

                            <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl">

                                <FiInbox
                                    size={32}
                                    className="mx-auto text-slate-300 mb-3"
                                />

                                <p className="text-sm font-semibold text-slate-500">
                                    No blog content available.
                                </p>

                            </div>

                        )}

                        {/* =====================================================
                            TAGS
                        ====================================================== */}

                        {article.tags &&
                            article.tags.length > 0 && (

                                <div className="pt-6 border-t border-slate-100 space-y-3">

                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">

                                        <FiTag size={14} />

                                        <span>
                                            Indexed Tags & Topics
                                        </span>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        {article.tags.map((tag, index) => (

                                            <span
                                                key={`${tag}-${index}`}
                                                className="bg-indigo-50/70 hover:bg-indigo-100 text-[#4F46E5] text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                                            >
                                                {String(tag).startsWith('#')
                                                    ? tag
                                                    : `#${tag}`}
                                            </span>

                                        ))}

                                    </div>

                                </div>

                            )}

                    </div>

                </article>

            </main>

            {/* ============================================================
                DELETE CONFIRMATION MODAL
            ============================================================ */}

            {isConfirmOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">

                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">

                        <div className="space-y-1">

                            <h3 className="text-base font-bold text-slate-900">
                                Move to Trash?
                            </h3>

                            <p className="text-xs text-slate-500 leading-relaxed">
                                Are you sure you want to move this blog to trash?
                            </p>

                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleCloseTrash}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleConfirmTrash}
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting
                                    ? 'Moving...'
                                    : 'Move to Trash'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ============================================================
                TOAST
            ============================================================ */}

            {showToast && toastMessage && (

                <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-[60]">

                    <div
                        className={`px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${toastMessage.toLowerCase().includes('successfully') ||
                                toastMessage.toLowerCase().includes('trash')
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                    >

                        <div className="flex items-center gap-2">

                            <FiCheckCircle size={16} />

                            <span>
                                {toastMessage}
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowToast(false);
                                    setToastMessage('');
                                }}
                                className="ml-2 opacity-80 hover:opacity-100 cursor-pointer"
                            >
                                <FiX size={14} />
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

