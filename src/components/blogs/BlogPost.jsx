import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBlogsService } from '../service/blog.service';

export default function BlogPost() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await getAllBlogsService();

                console.log('Blog API Response:', response);

                // Handle different possible API response structures
                const blogData = Array.isArray(response)
                    ? response
                    : response?.blogs ||
                    response?.data ||
                    [];

                console.log('All Blogs:', blogData);

                // Show only active/non-deleted blogs
                const activeBlogs = blogData.filter(
                    (blog) => blog.isDeleted !== true
                );

                console.log('Active Blogs:', activeBlogs);

                setBlogs(activeBlogs);
            } catch (err) {
                console.error('Fetch Blogs Error:', err);
                setError('Unable to load blogs.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------
    if (loading) {
        return (
            <section className="bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
                <div className="mx-auto">

                    <div className="text-center mb-10 sm:mb-14">
                        <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">
                            Our Publications
                        </p>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 mb-4 tracking-tight">
                            Latest from our{' '}
                            <span className="italic font-normal">
                                blog
                            </span>
                        </h2>

                        <p className="text-stone-600 text-sm sm:text-base max-w-4xl mx-auto leading-relaxed">
                            Explore educational resources written by our leading
                            geophysicists, engineers, and solar installation experts.
                        </p>
                    </div>

                    <div className="flex justify-center items-center py-16">
                        <div className="w-8 h-8 border-4 border-stone-300 border-t-emerald-700 rounded-full animate-spin" />
                    </div>

                </div>
            </section>
        );
    }


    if (error) {
        return (
            <section className="bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
                <div className="mx-auto">
                    <div className="text-center mb-10 sm:mb-14">
                        <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">
                            Our Publications
                        </p>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 mb-4 tracking-tight">
                            Latest from our{' '}
                            <span className="italic font-normal">
                                blog
                            </span>
                        </h2>
                    </div>

                    <div className="text-center py-12">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            </section>
        );
    }


    if (blogs.length === 0) {
        return (
            <section className="bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
                <div className="mx-auto">
                    <div className="text-center mb-10 sm:mb-14">
                        <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">
                            Our Publications
                        </p>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 mb-4 tracking-tight">
                            Latest from our{' '}
                            <span className="italic font-normal">
                                blog
                            </span>
                        </h2>

                        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                            Explore educational resources written by our leading
                            geophysicists, engineers, and solar installation experts.
                        </p>
                    </div>

                    <div className="text-center py-12">
                        <p className="text-stone-500 text-sm">
                            No blog posts available.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
            <div className="mx-auto">
                <div className="text-center mb-10 sm:mb-14">
                    <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">
                        Our Publications
                    </p>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 mb-4 tracking-tight">
                        Latest from our{' '}
                        <span className="italic font-normal">
                            blog
                        </span>
                    </h2>

                    <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                        Explore educational resources written by our leading
                        geophysicists, engineers, and solar installation experts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 container">
                    {blogs.map((post) => {
                        const blogUrl = `/blogs/${post._id || post.id}`;
                        const image =
                            post.imageUrl ||
                            post.image ||
                            post.featuredImage ||
                            post.thumbnail ||
                            '';
                        return (
                            <Link
                                key={post._id || post.id}
                                to={blogUrl}
                                className="block h-full"
                            >
                                <article
                                    className="bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full cursor-pointer"
                                >
                                    <div
                                        className="relative h-52 sm:h-56 w-full bg-stone-100 overflow-hidden block"
                                    >
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={
                                                    post.title ||
                                                    'Blog article'
                                                }
                                                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                                <span className="text-stone-400 text-sm">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                    </div>


                                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2 text-[11px] font-bold tracking-wider uppercase mb-3">

                                                <span className="text-emerald-700">
                                                    {post.category || 'GENERAL'}
                                                </span>

                                                <span className="text-stone-400">
                                                    •
                                                </span>

                                                <span className="text-stone-400 font-normal">
                                                    {post.date ||
                                                        post.createdAt ||
                                                        ''}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-serif font-bold text-stone-900 leading-snug mb-3 transition-colors">
                                                {post.title}
                                            </h3>

                                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2">
                                                {post.description ||
                                                    post.excerpt ||
                                                    ''}
                                            </p>
                                        </div>

                                        <div
                                            className="inline-flex items-center text-xs sm:text-sm font-bold text-stone-900 hover:text-emerald-700 transition-colors group self-start"
                                        >
                                            Read Article
                                            <svg
                                                className="ml-1.5 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}