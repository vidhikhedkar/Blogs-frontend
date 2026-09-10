import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEye, FiEdit, FiTrash2, FiUser, FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import { getAllBlogsService, deleteBlogService } from '../service/blog.service';

const ITEMS_PER_PAGE = 6;


export default function DashboardPage() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getBlogId = useCallback((blog) => {
        if (!blog) return null;
        const id = blog.id ?? blog._id;
        if (!id) return null;
        if (typeof id === 'object' && id.$oid) {
            return String(id.$oid);
        }
        return String(id);
    }, []);


    const getAuthorName = useCallback((author) => {
        if (!author) return '';
        if (typeof author === 'object') {
            return String(
                author?.name ||
                author?.fullName ||
                author?.username ||
                ''
            );
        }
        return String(author);
    }, []);


    const getBlogImage = useCallback((blog) => {
        if (!blog) return '';
        return (
            blog.image ||
            blog.featuredImage ||
            blog.imageUrl ||
            blog.coverImage ||
            blog.thumbnail ||
            ''
        );
    }, []);


    const getBlogExcerpt = useCallback((blog) => {
        if (!blog) return '';
        return String(
            blog.excerpt ||
            blog.subtitle ||
            blog.description ||
            ''
        );
    }, []);

    const getBlogDate = useCallback((blog) => {
        if (!blog) return '';
        return (
            blog.date ||
            blog.publishDate ||
            blog.publishedAt ||
            blog.createdAt ||
            ''
        );
    }, []);


    const getBlogReadTime = useCallback((blog) => {
        if (!blog) return '';
        return (
            blog.readTime ||
            blog.read_time ||
            ''
        );
    }, []);


    const getBlogCategory = useCallback((blog) => {
        if (!blog) return '';
        return String(
            blog.category ||
            blog.categoryName ||
            ''
        );
    }, []);


    const extractBlogs = useCallback((response) => {
        let blogData = [];
        if (Array.isArray(response)) {
            blogData = response;
        } else if (Array.isArray(response?.blogs)) {
            blogData = response.blogs;
        } else if (Array.isArray(response?.data)) {
            blogData = response.data;
        } else if (Array.isArray(response?.data?.blogs)) {
            blogData = response.data.blogs;
        } else if (Array.isArray(response?.data?.data)) {
            blogData = response.data.data;
        } else if (Array.isArray(response?.result)) {
            blogData = response.result;
        } else if (Array.isArray(response?.result?.blogs)) {
            blogData = response.result.blogs;
        }

        return blogData.map((blog) => ({
            ...blog,

            id: blog?.id ?? blog?._id,
            status: String(
                blog?.status ??
                blog?.publishStatus ??
                blog?.publicationStatus ??
                'Draft'
            ).trim(),

            category:
                blog?.category ??
                blog?.categoryName ??
                '',
            image:
                blog?.image ??
                blog?.featuredImage ??
                blog?.imageUrl ??
                blog?.coverImage ??
                blog?.thumbnail ??
                '',
            excerpt:
                blog?.excerpt ??
                blog?.subtitle ??
                blog?.description ??
                '',
            date:
                blog?.date ??
                blog?.publishDate ??
                blog?.publishedAt ??
                blog?.createdAt ??
                '',
            readTime:
                blog?.readTime ??
                blog?.read_time ??
                '',
        }));
    }, []);


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


    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllBlogsService();
            // console.log('Dashboard Blogs:', response);
            const blogData = extractBlogs(response);
            setBlogs(
                Array.isArray(blogData)
                    ? blogData
                    : []);
        } catch (err) {
            console.error('Fetch Blogs Error:', err);
            setError(getErrorMessage(err, 'Failed to load blogs.'));
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [extractBlogs, getErrorMessage]);


    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);


    const categories = useMemo(() => {
        const categorySet = new Set();
        blogs.forEach((blog) => {
            const category = getBlogCategory(blog);
            if (category) {
                categorySet.add(category.trim());
            }
        });
        return Array.from(categorySet).sort((a, b) =>
            a.localeCompare(b)
        );
    }, [blogs, getBlogCategory]);


    const normalizeValue = (value) => {
        return String(value ?? '')
            .trim()
            .toLowerCase();
    };


    const filteredBlogs = useMemo(() => {
        const search = normalizeValue(searchTerm);
        const statusFilter = normalizeValue(selectedStatus);
        const categoryFilter = normalizeValue(selectedCategory);

        return blogs.filter((blog) => {
            const title = normalizeValue(blog?.title);

            const excerpt = normalizeValue(
                blog?.excerpt ||
                blog?.subtitle ||
                blog?.description
            );

            const author = normalizeValue(
                typeof blog?.author === 'object'
                    ? blog?.author?.name ||
                    blog?.author?.fullName ||
                    blog?.author?.username ||
                    ''
                    : blog?.author
            );

            const category = normalizeValue(
                blog?.category ||
                blog?.categoryName ||
                ''
            );

            const status = normalizeValue(
                blog?.status ||
                blog?.publishStatus ||
                blog?.publicationStatus ||
                'draft'
            );

            const matchesSearch =
                !search ||
                title.includes(search) ||
                excerpt.includes(search) ||
                author.includes(search) ||
                category.includes(search);

            const matchesStatus =
                selectedStatus === 'All Statuses' ||
                status === statusFilter;

            const matchesCategory =
                selectedCategory === 'All Categories' ||
                category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [
        blogs,
        searchTerm,
        selectedStatus,
        selectedCategory
    ]);


    const totalPages =
        Math.max(
            Math.ceil(
                filteredBlogs.length / ITEMS_PER_PAGE
            ),
            1
        );


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    const paginatedBlogs = useMemo(() => {
        const start =
            (currentPage - 1) * ITEMS_PER_PAGE;

        return filteredBlogs.slice(
            start,
            start + ITEMS_PER_PAGE
        );
    }, [filteredBlogs, currentPage]);


    const handleCreateBlog = () => {
        navigate('/create-blogs');
    };


    const handleEditBlog = (id) => {
        if (!id) return;
        navigate(`/edit-blogs?edit=${encodeURIComponent(id)}`);
    };


    const handlePreviewBlog = (id) => {
        if (!id) return;
        const targetBlog = blogs.find(
            (blog) =>
                getBlogId(blog) === String(id)
        );
        if (!targetBlog) {
            setToastMessage('Blog could not be found.');
            setShowToast(true);
            return;
        }
        navigate(
            `/preview-blogs?id=${encodeURIComponent(id)}`,
            {
                state: {
                    fromDashboard: true,
                    articleData: {
                        ...targetBlog,
                        id: getBlogId(targetBlog),
                        title:
                            targetBlog.title || '',
                        subtitle:
                            getBlogExcerpt(targetBlog),
                        category:
                            getBlogCategory(targetBlog)
                                .toUpperCase(),
                        author:
                            typeof targetBlog.author === 'object'
                                ? targetBlog.author
                                : {
                                    name:
                                        getAuthorName(
                                            targetBlog.author
                                        )
                                },
                        featuredImage:
                            getBlogImage(targetBlog),
                        publishDate:
                            getBlogDate(targetBlog),
                        readTime:
                            getBlogReadTime(targetBlog)
                    }
                }
            }
        );
    };


    useEffect(() => {
        if (!showToast) return;
        const timer = setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 3000);
        return () => clearTimeout(timer);
    }, [showToast]);


    const handleOpenDeleteModal = (id) => {
        if (!id) {
            setToastMessage('Invalid blog ID.');
            setShowToast(true);
            return;
        }
        setSelectedBlogId(String(id));
        setIsConfirmOpen(true);
    };


    const handleCloseDeleteModal = () => {
        if (deleting) return;
        setIsConfirmOpen(false);
        setSelectedBlogId(null);
    };


    const handleDeleteBlog = async () => {
        if (!selectedBlogId || deleting) {
            return;
        }
        try {
            setDeleting(true);
            // console.log('Deleting blog:',selectedBlogId);
            await deleteBlogService(
                selectedBlogId
            );

            setBlogs((prevBlogs) =>
                prevBlogs.filter(
                    (blog) =>
                        getBlogId(blog) !==
                        String(selectedBlogId)
                )
            );

            setToastMessage('Blog deleted successfully');
            setShowToast(true);
            setIsConfirmOpen(false);
            setSelectedBlogId(null);
        } catch (err) {
            console.error('Delete Blog Error:', err);
            setToastMessage(
                getErrorMessage(err, 'Failed to delete blog')
            );
            setShowToast(true);
        } finally {
            setDeleting(false);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('All Statuses');
        setSelectedCategory('All Categories');
        setCurrentPage(1);
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(1);
    };


    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };


    const handlePreviousPage = () => {
        setCurrentPage((page) =>
            Math.max(page - 1, 1)
        );
    };

    const handleNextPage = () => {
        setCurrentPage((page) =>
            Math.min(
                page + 1,
                totalPages
            )
        );
    };

    const handlePageChange = (page) => {
        if (
            page >= 1 &&
            page <= totalPages
        ) {
            setCurrentPage(page);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Dashboard
                        </h1>

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
                        onClick={handleCreateBlog}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                    >
                        <FiPlus size={16} />
                        <span>Create New Blog</span>
                    </button>
                </div>
            </div>

            {error && !loading && (
                <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}


            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 shadow-sm">
                <div className="relative flex-1">
                    <FiSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by blog title, keyword..."
                        className="w-full bg-slate-50/50 md:bg-transparent text-xs pl-9 pr-4 py-2 md:py-1 text-slate-700 placeholder-slate-400 rounded-lg md:rounded-none border border-slate-200 md:border-none focus:outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-2 md:py-1 focus:outline-none cursor-pointer"
                    >
                        <option>All Statuses</option>
                        <option>Published</option>
                        <option>Draft</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-2 md:py-1 focus:outline-none cursor-pointer"
                    >
                        <option>All Categories</option>
                        {categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">
                        Loading blogs...
                    </h3>
                    <p className="text-xs text-slate-500">
                        Please wait while we fetch your blog posts.
                    </p>
                </div>
            ) : paginatedBlogs.length > 0 ? (
                <div className="flex flex-wrap gap-6">
                    {paginatedBlogs.map((post) => {
                        const postId = getBlogId(post);
                        const authorName =
                            typeof post.author === 'object'
                                ? post.author?.name || ''
                                : post.author || '';
                        const postImage =
                            post.image ||
                            post.featuredImage ||
                            post.imageUrl ||
                            '';
                        const postExcerpt =
                            post.excerpt ||
                            post.subtitle ||
                            '';
                        const postDate =
                            post.date ||
                            post.publishDate ||
                            '';
                        const postReadTime =
                            post.readTime ||
                            '';
                        const postStatus = String(
                            post?.status ||
                            post?.publishStatus ||
                            post?.publicationStatus ||
                            'Draft'
                        ).trim();
                        const displayStatus =
                            postStatus.toLowerCase() === 'published'
                                ? 'Published'
                                : 'Draft';
                        const postCategory =
                            post.category ||
                            '';
                        return (

                            <div
                                key={postId}
                                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative h-40 sm:h-44 overflow-hidden bg-slate-100">
                                        {postImage ? (
                                            <img
                                                src={postImage}
                                                alt={post.title || 'Blog'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                <FiInbox
                                                    size={32}
                                                    className="text-slate-300"
                                                />
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                                            {postCategory}
                                        </span>

                                        <span
                                            className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-md ${displayStatus === 'Published'
                                                ? 'bg-emerald-500/90 text-white'
                                                : 'bg-slate-800/80 text-slate-200'
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${displayStatus === 'Published'
                                                    ? 'bg-white'
                                                    : 'bg-amber-400'
                                                    }`}
                                            ></span>
                                            {displayStatus}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3
                                            onClick={() =>
                                                handlePreviewBlog(postId)
                                            }
                                            className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer mb-2"
                                        >
                                            {post.title || 'Untitled Blog'}
                                        </h3>

                                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                            {postExcerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                                <FiUser
                                                    size={13}
                                                    className="text-slate-400"
                                                />

                                                <span className="truncate max-w-22.5 sm:max-w-30">
                                                    {authorName}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span>
                                                    {postDate
                                                        ? new Date(postDate).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : 'No date'}
                                                </span>

                                                <span>•</span>

                                                <span>
                                                    {postReadTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                                    <button
                                        onClick={() =>
                                            handlePreviewBlog(postId)
                                        }
                                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                        <FiEye size={14} />
                                        <span>Preview</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleEditBlog(postId)
                                        }
                                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                        <FiEdit size={14} />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDeleteModal(postId)
                                        }
                                        className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer text-xs font-semibold text-slate-600"
                                    >
                                        <FiTrash2 size={14} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
                    <FiInbox
                        size={40}
                        className="mx-auto text-slate-300 mb-3"
                    />

                    <h3 className="text-base font-bold text-slate-800 mb-1">
                        No articles found
                    </h3>

                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        No blog posts matched your search filters. Try adjusting your parameters or toggle empty state off.
                    </p>

                    <button
                        onClick={handleResetFilters}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <p className="text-center sm:text-left">
                    Showing{' '}
                    <span className="font-semibold text-slate-800">
                        {filteredBlogs.length
                            ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                            : 0}
                    </span>

                    {' '}to{' '}

                    <span className="font-semibold text-slate-800">
                        {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredBlogs.length
                        )}
                    </span>

                    {' '}of{' '}

                    <span className="font-semibold text-slate-800">
                        {filteredBlogs.length}
                    </span>

                    {' '}results
                </p>

                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={handlePreviousPage}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-600 cursor-pointer transition-colors"
                    >
                        <FiChevronLeft size={14} />
                        <span className="hidden sm:inline">
                            Previous
                        </span>
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                    ).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
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
                        onClick={handleNextPage}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-medium text-slate-600 transition-colors"
                    >
                        <span className="hidden sm:inline">
                            Next
                        </span>
                        <FiChevronRight size={14} />
                    </button>
                </div>
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                                Delete Blog Post?
                            </h3>

                            <p className="text-xs text-slate-500 leading-relaxed">
                                Are you sure you want to delete this blog? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDeleteBlog}
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

            {showToast && toastMessage && (
                <div className="fixed bottom-5 right-5 z-60">
                    <div
                        className={`px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${toastMessage.includes('successfully')
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                            }`}
                    >
                        {toastMessage}
                    </div>
                </div>
            )}
        </div>
    );
}