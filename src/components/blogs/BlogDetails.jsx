import React, { useEffect, useMemo, useState, } from 'react';
import { useParams, Link, } from 'react-router-dom';
import heroBg from '../../assets/about-aerial.png';
import { FiThumbsUp, FiShare2, FiCheck, FiArrowLeft, FiArrowRight, } from 'react-icons/fi';
import { getBlogByIdService, getAllBlogsService, } from '../service/blog.service';


const getCategoryName = (blog) => {
    if (!blog) {
        return 'GENERAL';
    }
    if (typeof blog.category === 'string') {
        return blog.category.trim() || 'GENERAL';
    }
    if (
        blog.category &&
        typeof blog.category === 'object'
    ) {
        return (
            blog.category.name ||
            blog.category.title ||
            blog.category.label ||
            'GENERAL'
        );
    }
    return 'GENERAL';
};


const stripHtml = (html = '') => {
    if (!html) {
        return '';
    }
    if (
        typeof window === 'undefined'
    ) {
        return String(html)
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    const div =
        document.createElement('div');
    div.innerHTML = html;

    return (
        div.textContent ||
        div.innerText ||
        ''
    )
        .replace(/\s+/g, ' ')
        .trim();
};


const getDescription = (blog) => {
    if (!blog) {
        return '';
    }
    const description =
        blog.description ||
        blog.excerpt ||
        '';
    return stripHtml(
        description
    );
};


const getShortDescription = (blog,
    maxLength = 100) => {
    if (!blog) {
        return '';
    }
    const description =
        getDescription(blog);

    if (description) {
        return description;
    }

    const content =
        blog.content ||
        blog.fullContent ||
        '';

    const plainText =
        stripHtml(content);

    if (
        plainText.length <=
        maxLength
    ) {
        return plainText;
    }

    return `${plainText
        .substring(
            0,
            maxLength
        )
        .trim()}...`;
};


export default function BlogDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [allBlogs, setAllBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        const fetchBlogDetails =
            async () => {
                try {
                    setLoading(true);
                    setError('');
                    // console.log('Fetching Blog ID:', id);
                    const response = await getBlogByIdService(id);
                    // console.log('Blog Details API Response:', response);
                    const blog =
                        response?.blog ||
                        response?.data?.blog ||
                        response?.data ||
                        response;
                    // console.log('Final Blog Details:', blog);

                    if (
                        !blog ||
                        !blog._id
                    ) {
                        setError('Blog not found.');
                        setPost(null);
                        return;
                    }

                    if (
                        blog.isDeleted === true
                    ) {
                        setError('This blog is no longer available.');
                        setPost(null);
                        return;
                    }
                    setPost(blog);
                    setLikesCount(
                        Number(
                            blog.likes ??
                            blog.likesCount ??
                            0
                        )
                    );
                } catch (err) {
                    console.error('Fetch Blog Details Error:', err);
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        'Unable to load blog details.'
                    );
                } finally {
                    setLoading(false);
                }
            };
        if (id) {
            fetchBlogDetails();
        } else {
            setError(
                'Blog ID is missing.'
            );
            setLoading(false);
        }
    }, [id]);


    useEffect(() => {
        const fetchAllBlogs =
            async () => {
                try {
                    const response =
                        await getAllBlogsService();
                    // console.log('All Blogs For Related Articles:',response);
                    const blogData =
                        Array.isArray(response)
                            ? response
                            : response?.blogs ||
                            response?.data?.blogs ||
                            response?.data ||
                            [];

                    const activeBlogs =
                        blogData.filter(
                            (blog) =>
                                blog &&
                                blog.isDeleted !== true
                        );

                    // console.log('Active Blogs For Related Articles:',activeBlogs);
                    setAllBlogs(
                        activeBlogs
                    );
                } catch (err) {
                    console.error(
                        'Fetch Related Blogs Error:',
                        err
                    );
                    setAllBlogs([]);
                }
            };
        fetchAllBlogs();
    }, []);


    const currentIndex =
        useMemo(() => {
            if (
                !post ||
                allBlogs.length === 0
            ) {
                return -1;
            }
            return allBlogs.findIndex(
                (blog) =>
                    String(
                        blog._id
                    ) ===
                    String(
                        post._id
                    )
            );
        }, [
            post,
            allBlogs,
        ]);


    const prevPost =
        currentIndex > 0
            ? allBlogs[
            currentIndex - 1
            ]
            : null;


    const nextPost =
        currentIndex !== -1 &&
            currentIndex <
            allBlogs.length - 1
            ? allBlogs[
            currentIndex + 1
            ]
            : null;


    const relatedPosts =
        useMemo(() => {
            if (!post) {
                return [];
            }
            const currentCategory =
                getCategoryName(
                    post
                ).toLowerCase();

            const otherBlogs =
                allBlogs.filter(
                    (blog) =>
                        String(
                            blog._id
                        ) !==
                        String(
                            post._id
                        ) &&
                        blog.isDeleted !==
                        true
                );

            const sameCategory =
                otherBlogs.filter(
                    (blog) =>
                        getCategoryName(
                            blog
                        ).toLowerCase() ===
                        currentCategory
                );

            const otherCategory =
                otherBlogs.filter(
                    (blog) =>
                        getCategoryName(
                            blog
                        ).toLowerCase() !==
                        currentCategory
                );
            return [
                ...sameCategory,
                ...otherCategory,
            ].slice(0, 4);
        }, [
            allBlogs,
            post,
        ]);


    const popularTopics =
        useMemo(() => {
            if (
                !Array.isArray(
                    allBlogs
                )
            ) {
                return [];
            }
            const categories =
                allBlogs
                    .filter(
                        (blog) =>
                            blog &&
                            blog.isDeleted !==
                            true
                    )
                    .map(
                        (blog) =>
                            getCategoryName(
                                blog
                            )
                    )
                    .filter(
                        Boolean
                    );
            return [
                ...new Set(
                    categories.map(
                        (category) =>
                            String(
                                category
                            ).trim()
                    )
                ),
            ]
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b
                        )
                );
        }, [
            allBlogs,
        ]);


    const handleLike = () => {
        if (isLiked) {
            setLikesCount(
                (prev) =>
                    Math.max(
                        0,
                        prev - 1
                    )
            );
            setIsLiked(false);
        } else {
            setLikesCount(
                (prev) =>
                    prev + 1
            );
            setIsLiked(true);
        }
    };


    const handleShare =
        async () => {
            if (!post) {
                return;
            }
            const shareData = {
                title:
                    post.title ||
                    'Blog Article',
                text:
                    post.description ||
                    post.excerpt ||
                    '',
                url:
                    window.location.href,
            };
            if (
                navigator.share
            ) {
                try {
                    await navigator.share(
                        shareData
                    );
                } catch (err) {
                    // console.log('Share cancelled/error:',err);
                }
                return;
            }
            try {
                await navigator.clipboard.writeText(
                    window.location.href
                );
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            } catch (err) {
                console.error(
                    'Failed to copy:',
                    err
                );
            }
        };

    const image =
        post?.imageUrl ||
        post?.image ||
        post?.featuredImage ||
        post?.thumbnail ||
        '';

    const description =
        post?.description ||
        post?.excerpt ||
        '';

    const category =
        getCategoryName(
            post
        );

    const date =
        post?.date ||
        post?.createdAt ||
        '';

    const authorName =
        post?.author?.name ||
        post?.authorName ||
        post?.createdBy?.name ||
        'admin';


    const authorRole =
        post?.author?.role ||
        post?.authorRole ||
        'Author';


    const authorAvatar =
        post?.author?.avatar ||
        post?.authorAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';


    const content =
        post?.content ||
        post?.fullContent ||
        '';

    const topics =
        Array.isArray(
            post?.tags
        )
            ? post.tags
            : typeof post?.tags ===
                'string'
                ? post.tags
                    .split(',')
                    .map(
                        (tag) =>
                            tag.trim()
                    )
                    .filter(
                        Boolean
                    )
                : [];


    const formattedDate =
        (() => {
            if (!date) {
                return '';
            }
            try {
                const parsedDate =
                    new Date(
                        date
                    );
                if (
                    Number.isNaN(
                        parsedDate.getTime()
                    )
                ) {
                    return date;
                }
                return parsedDate.toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }
                );
            } catch {
                return date;
            }
        })();



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">
                        Loading blog...
                    </p>
                </div>
            </div>
        );
    }


    if (
        error ||
        !post
    ) {
        return (
            <div className="flex items-center justify-center bg-[#F8F9FF] px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                        Blog Not Found
                    </h2>

                    <p className="text-sm text-slate-500 mb-6">
                        {error ||
                            'Unable to load this blog.'}
                    </p>

                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className=" bg-[#F5F3F0]">
            <div className="relative min-h-[80vh] flex flex-col justify-end bg-gray-900 text-white overflow-hidden px-6 sm:px-12 md:px-16 pt-32 sm:pt-48 md:pt-56 pb-20 md:pb-28">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${heroBg})`,
                    }}
                >
                    <div className="absolute inset-0 bg-black/60 bg-linear-to-b from-black/50 via-black/40 to-black/80" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-300/80 mb-6">
                        VENTURE INSIGHTS &amp; TECH GUIDES
                    </span>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white mb-8 leading-[1.05]">
                        Knowledge on tap, <br />
                        <span className="italic font-normal">grounded in science.</span>
                    </h1>

                    <p className="max-w-xl text-sm sm:text-base md:text-lg text-gray-300/90 font-normal leading-relaxed">
                        Deep-dives into borehole drilling engineering, geophysical survey methodologies, well casing standards, and sustainable solar pumping systems across Zimbabwe.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start w-full container py-30">
                <main className="w-full lg:w-3/4 py-4 sm:py-6 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium text-slate-400 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2DFFF] text-[#3323CC] font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3323CC]" />
                            {category}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B1C30] leading-tight mb-4">
                        {post.title}
                    </h1>

                    {description && (
                        <p className="text-sm sm:text-base text-[#464555] font-sans leading-relaxed mb-10">
                            {description}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#EFF4FF] rounded-2xl p-4 mb-8 gap-4 border border-[#000000]/0">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#0B1C30] text-sm sm:text-base">
                                        {authorName}
                                    </span>

                                    <span className="text-xs bg-[#DCE9FF] text-[#3525CD] px-2 py-0.5 rounded font-semibold">
                                        Author
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-[#565E74]">
                                    {authorRole}
                                    {formattedDate && (
                                        <>
                                            {' '}
                                            • Published{' '}
                                            {formattedDate}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={
                                    handleLike
                                }
                                className={`flex items-center gap-1.5 border border-[#000000]/5 rounded-xl px-3.5 py-2 transition-colors cursor-pointer ${isLiked
                                    ? 'bg-indigo-50 text-indigo-600 font-bold border-indigo-200'
                                    : 'bg-white hover:bg-slate-50 text-[#464555]'
                                    }`}
                                aria-label={
                                    isLiked
                                        ? 'Unlike blog'
                                        : 'Like blog'
                                }
                            >
                                <FiThumbsUp
                                    className={`w-4 h-4 ${isLiked
                                        ? 'text-indigo-600'
                                        : 'text-slate-500'
                                        }`}
                                />
                                <span>
                                    {likesCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleShare
                                }
                                className="relative p-2.5 bg-white border border-[#000000]/5 rounded-xl hover:bg-slate-50 text-[#464555]0 transition-colors cursor-pointer"
                                title="Share Post"
                                aria-label="Share blog"
                            >
                                {copied ? (
                                    <FiCheck className="w-4 h-4 text-green-600" />
                                ) : (
                                    <FiShare2 className="w-4 h-4 text-slate-500" />
                                )}

                                {copied && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow whitespace-nowrap">
                                        Copied!
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {image && (
                        <div className="mb-2">
                            <div className="relative w-full overflow-hidden rounded-2xl aspect-video sm:aspect-video">
                                <img
                                    src={image}
                                    alt={
                                        post.title ||
                                        'Blog article'
                                    }
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}


                    {content ? (
                        <article
                            className="prose max-w-none text-slate-700 leading-relaxed mb-10
        prose-headings:font-serif
        prose-headings:text-slate-900
        prose-p:text-slate-700
        prose-a:text-indigo-600
        prose-strong:text-slate-900
        prose-img:rounded-2xl
        prose-img:w-full"
                            dangerouslySetInnerHTML={{
                                __html: content,
                            }}
                        />
                    ) : (
                        <p className="text-sm text-slate-400 mb-10">
                            No blog content available.
                        </p>
                    )}

                    {topics.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-slate-200">
                            <h3 className="text-xs font-extrabold tracking-widest text-[#565E74] uppercase mb-3">
                                Categorized Topics
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {topics.map(
                                    (topic, index) => (
                                        <span
                                            key={`${topic}-${index}`}
                                            className="px-3 py-1.5 bg-[#EFF4FF] text-[#464555] border border-slate-100 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            {String(
                                                topic
                                            ).startsWith(
                                                '#'
                                            )
                                                ? topic
                                                : `#${topic}`}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevPost ? (
                            <Link
                                to={`/blogs/${prevPost._id}`}
                                className="flex flex-col justify-between p-4 sm:p-5 bg-[#EFF4FF] hover:bg-[#E2EBFF] rounded-2xl transition-colors group border border-slate-100"
                            >
                                <div className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-[#565E74] uppercase mb-2">
                                    <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                                    <span>
                                        Previous Article
                                    </span>
                                </div>

                                <h4 className="font-serif font-bold text-[#0B1C30] text-sm sm:text-base leading-snug line-clamp-2">
                                    {prevPost.title}
                                </h4>
                            </Link>
                        ) : (
                            <div className="hidden sm:block" />
                        )}

                        {nextPost && (
                            <Link
                                to={`/blogs/${nextPost._id}`}
                                className="flex flex-col justify-between p-4 sm:p-5 bg-[#EFF4FF] hover:bg-[#E2EBFF] rounded-2xl transition-colors text-left sm:text-right group border border-slate-100"
                            >
                                <div className="flex items-center justify-start sm:justify-end gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                                    <span>Next Article</span>
                                    <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </div>

                                <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                                    {nextPost.title}
                                </h4>
                            </Link>
                        )}
                    </div>
                </main>

                <aside className="w-full lg:w-1/4 flex flex-col gap-6 lg:sticky lg:top-6">
                    <div className="bg-white rounded-3xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#3525CD]" />
                                Related Articles
                            </h2>

                            <Link
                                to="/blogs"
                                className="text-xs sm:text-sm font-semibold text-[#3525CD] hover:underline"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="space-y-6">
                            {relatedPosts.map(
                                (item) => {
                                    const itemImage =
                                        item.imageUrl ||
                                        item.image ||
                                        item.featuredImage ||
                                        item.thumbnail ||
                                        '';

                                    const itemCategory =
                                        getCategoryName(
                                            item
                                        );

                                    const itemDescription =
                                        getShortDescription(
                                            item,
                                            100
                                        );

                                    return (
                                        <Link
                                            key={item._id}
                                            to={`/blogs/${item._id}`}
                                            className="flex gap-3 items-start group"
                                        >
                                            {itemImage ? (
                                                <img
                                                    src={
                                                        itemImage
                                                    }
                                                    alt={
                                                        item.title ||
                                                        'Related article'
                                                    }
                                                    className="w-18 h-18 rounded-xl object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] text-slate-400">
                                                        No Image
                                                    </span>
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                                    <span className="text-[#3525CD] font-bold text-xs">
                                                        {itemCategory}
                                                    </span>

                                                    <span>•</span>

                                                    <span>{item.readTime ||'5 min read'}</span>
                                                </div>

                                                <h3 className="text-sm font-bold text-[#0B1C30] truncate transition-colors mt-0.5">
                                                    {item.title}
                                                </h3>

                                                {itemDescription && (
                                                    <p className="text-[14px] text-[#464555] truncate mt-1">
                                                        {itemDescription}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                }
                            )}

                            {relatedPosts.length === 0 && (
                                <p className="text-xs text-slate-400">
                                    No related articles available.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900 mb-3">
                            Popular Topics
                        </h2>

                        <div className="flex flex-wrap gap-1.5">
                            {popularTopics.map(
                                (topic,index) => (
                                    <Link
                                        key={`${topic}-${index}`}
                                        to={`/blogs?category=${encodeURIComponent(
                                            topic
                                        )}`}
                                        className="px-2.5 py-1 bg-[#EFF4FF] text-[#0B1C30] hover:bg-slate-100 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                                    >
                                        {topic}
                                    </Link>
                                )
                            )}

                            {/* NO CATEGORIES */}
                            {popularTopics.length === 0 && (
                                <p className="text-xs text-slate-400">
                                    No topics available.
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}