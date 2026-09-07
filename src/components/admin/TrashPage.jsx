import React, { useState, useMemo, useEffect } from 'react';
import {
  FiSearch,
  FiTrash2,
  FiX,
  FiInfo,
  FiUpload,
  FiLock,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import { IoTimerOutline } from "react-icons/io5";


import {
  getTrashBlogsService,
  restoreBlogService,
  permanentlyDeleteBlogService,
} from '../service/blog.service';


export default function TrashPage() {

  const [posts, setPosts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [restoreModalPost, setRestoreModalPost] = useState(null);

  const [deleteModalPost, setDeleteModalPost] = useState(null);

  const [showRestoreToast, setShowRestoreToast] = useState(false);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');




  const formatUpdatedAt = (date) => {

    if (!date) {
      return 'Recently updated';
    }

    const updatedDate = new Date(date);

    if (Number.isNaN(updatedDate.getTime())) {
      return 'Recently updated';
    }

    const now = new Date();
    const difference = now.getTime() - updatedDate.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));


    if (minutes < 1) {
      return 'Updated just now';
    }

    if (minutes < 60) {
      return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (hours < 24) {
      return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (days < 7) {
      return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
    }

    return `Updated ${updatedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })}`;
  };



  const fetchTrashBlogs = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await getTrashBlogsService();
      const blogs = Array.isArray(response)
        ? response
        : response?.data ||
        response?.blogs ||
        response?.data?.blogs ||
        [];

      const deletedBlogs = blogs.filter(
        (blog) =>
          blog?.isDeleted === true ||
          blog?.isDeleted === 'true' ||
          blog?.isDeleted === 1 ||
          blog?.isDeleted === '1'
      );


      console.log('Trash API Response:', response);
      console.log('All Trash Blogs:', blogs);
      console.log('Only Deleted Blogs:', deletedBlogs);



      const formattedBlogs = deletedBlogs.map((blog) => ({
        id: blog._id || blog.id,
        title:
          blog.title ||
          blog.headline ||
          'Untitled Blog',

        description:
          blog.excerpt ||
          blog.description ||
          '',

        tags:
          Array.isArray(blog.tags)
            ? blog.tags
            : [],

        image:
          blog.image ||
          blog.imageUrl ||
          '',

        slug:
          blog.slug ||
          '',

        updatedAt:
          blog.updatedAt ||
          blog.deletedAt ||
          blog.createdAt ||
          null,
        author:
          typeof blog.author === 'object' && blog.author !== null
            ? blog.author.name || ''
            : blog.author || '',

        isLive:
          blog.status === 'published',

      }));


      setPosts(formattedBlogs);

    } catch (error) {
      console.error(
        'Fetch Trash Blogs Error:',
        error
      );

      setErrorMessage(
        error?.message ||
        error?.error ||
        'Failed to load trash blogs.'
      );

      setPosts([]);

    } finally {

      setLoading(false);

    }

  };


  // FETCH ON PAGE LOAD
  useEffect(() => {
    fetchTrashBlogs();
  }, []);


  // SEARCH
  const filteredPosts = useMemo(() => {
    const q = searchQuery
      .toLowerCase()
      .trim();
    return posts.filter((post) => {

      if (!q) {
        return true;
      }


      return (
        String(post.title || '')
          .toLowerCase()
          .includes(q)

        ||

        String(post.description || '')
          .toLowerCase()
          .includes(q)

        ||

        String(post.author || '')
          .toLowerCase()
          .includes(q)

        ||

        post.tags.some((tag) =>
          String(tag)
            .toLowerCase()
            .includes(q)
        )

      );

    });

  }, [
    posts,
    searchQuery
  ]);



  // RESTORE BLOG
  const handleRestore = async (id) => {
    try {
      setActionLoading(true);
      setErrorMessage('');
      console.log(
        'Restore Blog ID:',
        id
      );


      const response =
        await restoreBlogService(id);


      console.log(
        'Restore Blog Response:',
        response
      );


      setPosts((prev) =>
        prev.filter(
          (post) =>
            post.id !== id
        )
      );


      setRestoreModalPost(null);
      setShowRestoreToast(true);
      setTimeout(() => {
        setShowRestoreToast(false);
      }, 4000);


      // REFRESH TRASH

      await fetchTrashBlogs();

    } catch (error) {

      console.error(
        'Restore Blog Error:',
        error
      );


      setErrorMessage(
        error?.message ||
        error?.error ||
        'Failed to restore blog.'
      );

    } finally {

      setActionLoading(false);

    }

  };


  // ============================================================
  // PERMANENT DELETE
  // DELETE /api/blogs/:id/permanent
  // ============================================================

  const handleDelete = async (id) => {

    try {

      setActionLoading(true);

      setErrorMessage('');


      console.log(
        'Permanent Delete Blog ID:',
        id
      );


      const response =
        await permanentlyDeleteBlogService(id);


      console.log(
        'Permanent Delete Response:',
        response
      );


      // Remove from UI

      setPosts((prev) =>
        prev.filter(
          (post) =>
            post.id !== id
        )
      );


      setDeleteModalPost(null);


      // Refresh Trash

      await fetchTrashBlogs();

    } catch (error) {

      console.error(
        'Permanent Delete Blog Error:',
        error
      );


      setErrorMessage(
        error?.message ||
        error?.error ||
        'Failed to permanently delete blog.'
      );

    } finally {

      setActionLoading(false);

    }

  };


  return (

    <div className="bg-[#f8f9fe] text-slate-800 font-sans relative">

      <div className="mx-auto">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-4">

          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">

            <div className="flex items-center gap-2.5">

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider text-slate-900">

                TRASH

              </h1>


              <span className="bg-[#DAE2FD] text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">

                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>

                {posts.length} Drafts

              </span>

            </div>

          </div>


          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">

            Work-in-progress posts waiting for editorial review or publication.

          </p>

        </header>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {errorMessage && (

          <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl px-4 py-3 flex items-center justify-between gap-3">

            <span>
              {errorMessage}
            </span>


            <button
              onClick={() =>
                setErrorMessage('')
              }
              className="shrink-0"
            >

              <FiX size={15} />

            </button>

          </div>

        )}


        {/* =====================================================
            SEARCH + FILTER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-3  bg-white rounded-2xl p-3 sm:p-4">

          <div className="relative flex-1">

            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#464555] w-4 h-4" />

            <input
              type="text"
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-3 py-2.5 bg-[#f0f3fa] text-xs sm:text-sm text-[#464555] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-300 transition-all"
            />

          </div>


         

        </div>


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-4">

            <div className="flex justify-center mb-3">

              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

            </div>


            <p className="text-slate-500 text-xs sm:text-sm">

              Loading drafts...

            </p>

          </div>


        ) : filteredPosts.length === 0 ? (

          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-4">

            <p className="text-slate-500 text-xs sm:text-sm">

              No drafts found matching your search.

            </p>

          </div>


        ) : (

          /* ===================================================
             POST GRID
          ==================================================== */

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">

            {filteredPosts.map((post) => (

              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col justify-between"
              >

                <div>


                  {/* =================================================
                      IMAGE
                  ================================================== */}

                  <div className="relative aspect-[22/9] w-full rounded-xl overflow-hidden bg-slate-50 mb-3">

                    {post.image ? (

                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center bg-slate-50">

                        <FiUpload className="w-6 h-6 text-slate-300" />

                      </div>

                    )}


                    <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md text-[#5C647A] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm">

                      <span className="w-1.5 h-1.5 bg-[#565E74] rounded-full"></span>

                      Draft

                    </span>

                  </div>


                  {/* =================================================
                      TAGS
                  ================================================== */}

                  <div className="flex flex-wrap gap-1.5 mb-2">

                    {post.tags.map((tag, index) => (

                      <span
                        key={`${tag}-${index}`}
                        className="bg-[#DCE9FF] text-[#464555] text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >

                        {tag}

                      </span>

                    ))}

                  </div>


                  {/* =================================================
                      TITLE
                  ================================================== */}

                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0B1C30] leading-snug mb-1.5 line-clamp-2">

                    {post.title}

                  </h3>


                  {/* =================================================
                      DESCRIPTION
                  ================================================== */}

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">

                    {post.description}

                  </p>

                </div>


                {/* ===================================================
                    FOOTER
                ==================================================== */}

                <div className="pt-2">


                  <p className="text-[11px] text-[#464555] flex items-center gap-1.5 mb-3">

                    <FiClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />


                    <span className="truncate">

                      {formatUpdatedAt(post.updatedAt)}

                      {post.author && (
                        <>
                          {' '}
                          • by {post.author}
                        </>
                      )}

                    </span>

                  </p>


                  {/* =================================================
                      ACTION BUTTONS
                  ================================================== */}

                  <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">

                    <button
                      onClick={() =>
                        setRestoreModalPost(post)
                      }
                      disabled={actionLoading}
                      className="flex-1 bg-[#4F46E5] hover:bg-[#4338ca] active:scale-[0.98] text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition min-w-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >

                      <IoTimerOutline className="w-3.5 h-3.5 shrink-0" />


                      <span className="truncate">

                        Restore Blog

                      </span>

                    </button>


                    <button
                      onClick={() =>
                        setDeleteModalPost(post)
                      }
                      disabled={actionLoading}
                      className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white active:scale-[0.98] p-2 rounded-xl transition shrink-0 border cursor-pointer border-red-100 hover:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Delete permanent"
                    >

                      <FiTrash2 className="w-4 h-4" />

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ==========================================================
          RESTORE SUCCESS TOAST
          KEEPING SAME
      =========================================================== */}

      {showRestoreToast && (

        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-[#1a2536] text-white shadow-2xl rounded-2xl p-3 sm:p-4 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 duration-200 border border-slate-700/50">

          <div className="w-7 h-7 rounded-full bg-[#00875a] flex items-center justify-center shrink-0">

            <FiCheckCircle className="w-4 h-4 text-white" />

          </div>


          <div className="flex-1 min-w-0">

            <h4 className="font-serif font-semibold text-xs sm:text-sm leading-tight text-white truncate">

              Blog restored successfully

            </h4>


            <p className="text-[11px] text-slate-300 font-sans mt-0.5 truncate">

              Moved to Drafts review queue.

            </p>

          </div>


          <button
            onClick={() =>
              setShowRestoreToast(false)
            }
            className="text-slate-400 hover:text-white transition p-1 shrink-0 cursor-pointer"
            aria-label="Close notification"
          >

            <FiX className="w-4 h-4" />

          </button>

        </div>

      )}


      {/* ==========================================================
          RESTORE MODAL
          DO NOT CHANGE
      =========================================================== */}

      {restoreModalPost && (

        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">


            <button
              onClick={() =>
                setRestoreModalPost(null)
              }
              disabled={actionLoading}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >

              <FiX className="w-4 h-4" />

            </button>


            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">

              <FiUpload className="w-5 h-5" />

            </div>


            <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 mb-1">

              Restore Blog?

            </h2>


            <p className="text-xs text-slate-600 mb-4 leading-relaxed">

              Restore{' '}

              <strong className="text-slate-900 font-semibold">

                "{restoreModalPost.title}"

              </strong>{' '}

              back to primary list?

            </p>


            <div className="bg-[#f0f4fe] border border-indigo-100/50 rounded-xl p-3 flex items-start gap-2 mb-5">

              <FiInfo className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />


              <p className="text-xs text-slate-600 leading-normal">

                Status will revert to{' '}

                <strong className="text-slate-800 font-medium">
                  Draft
                </strong>.

              </p>

            </div>


            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2">

              <button
                onClick={() =>
                  setRestoreModalPost(null)
                }
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition text-center cursor-pointer"
              >

                Cancel

              </button>


              <button
                onClick={() =>
                  handleRestore(
                    restoreModalPost.id
                  )
                }
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center gap-1.5 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >

                {actionLoading ? (

                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>

                ) : (

                  <IoTimerOutline className="w-3.5 h-3.5" />

                )}


                {actionLoading
                  ? 'Restoring...'
                  : 'Restore'}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==========================================================
          DELETE MODAL
          DO NOT CHANGE
      =========================================================== */}

      {deleteModalPost && (

        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">


            <button
              onClick={() =>
                setDeleteModalPost(null)
              }
              disabled={actionLoading}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >

              <FiX className="w-4 h-4" />

            </button>


            <div className="w-10 h-10 rounded-full bg-red-100 mx-auto flex items-center justify-center text-red-600 mb-3">

              <FiTrash2 className="w-5 h-5" />

            </div>


            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">

              Delete Blog?

            </h2>


            <p className="text-xs text-slate-600 mb-3 leading-relaxed">

              Delete{' '}

              <strong className="text-slate-900 font-semibold">

                '{deleteModalPost.title}'

              </strong>?

            </p>


            <div className="bg-[#f3f5fc] rounded-xl p-2.5 flex items-center justify-between mb-4 text-xs font-mono text-slate-600">

              <div className="flex items-center gap-1.5 overflow-hidden min-w-0">

                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>


                <span className="truncate">

                  {deleteModalPost.slug}

                </span>

              </div>


              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold shrink-0 ml-1">

                {deleteModalPost.isLive
                  ? 'LIVE'
                  : 'DRAFT'}

              </span>

            </div>


            <div className="grid grid-cols-2 gap-2 mb-3">

              <button
                onClick={() =>
                  setDeleteModalPost(null)
                }
                disabled={actionLoading}
                className="py-2 rounded-xl text-xs font-medium bg-[#f0f3fa] text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >

                Cancel

              </button>


              <button
                onClick={() =>
                  handleDelete(
                    deleteModalPost.id
                  )
                }
                disabled={actionLoading}
                className="py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >

                {actionLoading ? (

                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>

                ) : (

                  <FiTrash2 className="w-3.5 h-3.5" />

                )}


                {actionLoading
                  ? 'Deleting...'
                  : 'Delete'}

              </button>

            </div>


            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">

              <FiLock className="w-3 h-3 shrink-0" />

              Requires admin privileges

            </p>

          </div>

        </div>

      )}

    </div>

  );

}