import React, {
    useState,
    useRef,
    useMemo,
    useEffect,
    useCallback
} from 'react';

import {
    useSearchParams,
    useNavigate
} from 'react-router-dom';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import {
    FiSearch,
    FiSave,
    FiX,
    FiRefreshCw,
    FiTrash2,
    FiChevronDown,
    FiPlus,
    FiLock,
    FiArrowLeft,
    FiSliders,
    FiCalendar,
    FiCheckCircle,
    FiMaximize2,
    FiCopy,
    FiImage,
    FiUploadCloud,
    FiLink,
    FiBold,
    FiItalic,
    FiUnderline,
    FiType,
    FiList,
    FiCode,
    FiEdit3
} from 'react-icons/fi';

import {
    getBlogByIdService,
    updateBlogService,
    uploadInlineImageService
} from '../service/blog.service';


const EditBlogsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const blogId = searchParams.get('edit');

    /* =========================================================
       REFS
    ========================================================= */

    const fileInputRef = useRef(null);
    const inlineImageInputRef = useRef(null);
    const quillRef = useRef(null);


    /* =========================================================
       STATE
    ========================================================= */

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingInline, setUploadingInline] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const [headline, setHeadline] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [category, setCategory] = useState('');

    const [author, setAuthor] = useState({
        name: '',
        role: ''
    });

    const [publicationDate, setPublicationDate] = useState('');

    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    const [coverImage, setCoverImage] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);

    const [editorContent, setEditorContent] = useState('');

    const [status, setStatus] = useState('draft');

    const [seoOpen, setSeoOpen] = useState(true);

    const [toastMessage, setToastMessage] = useState(null);


    /* =========================================================
       TOAST
    ========================================================= */

    const triggerToast = useCallback((message) => {
        setToastMessage(message);

        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    }, []);


    /* =========================================================
       RESPONSE HELPERS
    ========================================================= */

    const extractBlog = useCallback((response) => {
        if (!response) return null;

        if (
            response.id ||
            response._id ||
            response.title ||
            response.headline
        ) {
            return response;
        }

        if (response.data && !Array.isArray(response.data)) {

            if (
                response.data.id ||
                response.data._id ||
                response.data.title ||
                response.data.headline
            ) {
                return response.data;
            }

            if (response.data.blog) {
                return response.data.blog;
            }

            if (
                response.data.data &&
                !Array.isArray(response.data.data)
            ) {
                return response.data.data;
            }
        }

        if (response.blog) {
            return response.blog;
        }

        if (
            response.result &&
            !Array.isArray(response.result)
        ) {
            return response.result;
        }

        return null;
    }, []);


    const getAuthorData = useCallback((authorValue) => {

        if (!authorValue) {
            return {
                name: '',
                role: ''
            };
        }

        if (typeof authorValue === 'object') {
            return {
                name: String(
                    authorValue.name ||
                    authorValue.fullName ||
                    authorValue.username ||
                    authorValue.authorName ||
                    ''
                ),

                role: String(
                    authorValue.role ||
                    authorValue.authorRole ||
                    authorValue.position ||
                    authorValue.designation ||
                    ''
                )
            };
        }

        return {
            name: String(authorValue),
            role: ''
        };

    }, []);


    const formatDateForInput = useCallback((dateValue) => {

        if (!dateValue) return '';

        try {

            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
                return '';
            }

            const year = date.getFullYear();
            const month = String(
                date.getMonth() + 1
            ).padStart(2, '0');

            const day = String(
                date.getDate()
            ).padStart(2, '0');

            return `${year}-${month}-${day}`;

        } catch (error) {
            return '';
        }

    }, []);


    /* =========================================================
       FETCH BLOG
    ========================================================= */

    const fetchBlog = useCallback(async () => {

        if (!blogId) {
            setLoading(false);
            return;
        }

        try {

            setLoading(true);

            const response =
                await getBlogByIdService(blogId);

            console.log(
                'Edit Blog API Response:',
                response
            );

            const blog =
                extractBlog(response);

            if (!blog) {

                triggerToast(
                    'Blog data could not be found.'
                );

                return;
            }


            /* ---------------------------------------------
               TITLE
            --------------------------------------------- */

            setHeadline(
                blog.title ??
                blog.headline ??
                ''
            );


            /* ---------------------------------------------
               EXCERPT
            --------------------------------------------- */

            setExcerpt(
                blog.excerpt ??
                blog.subtitle ??
                blog.description ??
                ''
            );


            /* ---------------------------------------------
               SLUG
            --------------------------------------------- */

            setSlug(
                blog.slug ??
                blog.urlSlug ??
                blog.url_slug ??
                ''
            );


            /* ---------------------------------------------
               CATEGORY
            --------------------------------------------- */

            setCategory(
                blog.category ??
                blog.categoryName ??
                ''
            );


            /* ---------------------------------------------
               TAGS
            --------------------------------------------- */
            let blogTags = [];

            if (Array.isArray(blog.tags)) {
                blogTags = blog.tags
                    .map((tag) => {
                        if (typeof tag === 'object' && tag !== null) {
                            return (
                                tag.name ||
                                tag.title ||
                                tag.label ||
                                ''
                            );
                        }

                        return String(tag);
                    })
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            } else if (typeof blog.tags === 'string') {
                const rawTags = blog.tags.trim();

                // Handle empty string
                if (!rawTags || rawTags === '[]') {
                    blogTags = [];
                } else {
                    try {
                        const parsed = JSON.parse(rawTags);

                        if (Array.isArray(parsed)) {
                            blogTags = parsed
                                .map((tag) => {
                                    if (
                                        typeof tag === 'object' &&
                                        tag !== null
                                    ) {
                                        return (
                                            tag.name ||
                                            tag.title ||
                                            tag.label ||
                                            ''
                                        );
                                    }

                                    return String(tag);
                                })
                                .map((tag) => tag.trim())
                                .filter(Boolean);
                        } else {
                            blogTags = rawTags
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean);
                        }
                    } catch (error) {
                        blogTags = rawTags
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter(Boolean);
                    }
                }
            }

            setTags(blogTags);


            /* ---------------------------------------------
               AUTHOR
            --------------------------------------------- */

            const authorData =
                getAuthorData(blog.author);

            setAuthor(authorData);


            /* ---------------------------------------------
               PUBLICATION DATE
            --------------------------------------------- */

            const dateValue =
                blog.publicationDate ??
                blog.publishDate ??
                blog.date ??
                blog.publishedAt ??
                blog.createdAt ??
                '';

            setPublicationDate(
                formatDateForInput(dateValue)
            );


            /* ---------------------------------------------
               STATUS
            --------------------------------------------- */

            const currentStatus =
                String(
                    blog.status ??
                    blog.publishStatus ??
                    blog.publicationStatus ??
                    'draft'
                ).trim();

            setStatus(
                currentStatus.toLowerCase()
            );


            /* ---------------------------------------------
               FEATURED IMAGE
            --------------------------------------------- */

            const existingImage =
                blog.imageUrl ??
                blog.image?.url ??
                blog.image ??
                blog.featuredImage ??
                blog.featuredImageUrl ??
                blog.coverImage ??
                blog.thumbnail ??
                '';

            if (existingImage) {

                setCoverImage({
                    url: existingImage,
                    name: 'Current featured image',
                    size: '',
                    isExisting: true
                });

            } else {

                setCoverImage(null);
            }


            /* ---------------------------------------------
               ARTICLE CONTENT
            --------------------------------------------- */

            setEditorContent(
                blog.content ??
                blog.body ??
                blog.articleContent ??
                ''
            );


            /* ---------------------------------------------
               SEO
            --------------------------------------------- */

            setMetaTitle(
                blog.metaTitle ??
                blog.seo?.metaTitle ??
                blog.seo?.title ??
                ''
            );

            setMetaDescription(
                blog.metaDescription ??
                blog.seo?.metaDescription ??
                blog.seo?.description ??
                ''
            );

        } catch (error) {

            console.error(
                'Fetch Blog By ID Error:',
                error
            );

            triggerToast(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to load blog.'
            );

        } finally {

            setLoading(false);
        }

    }, [
        blogId,
        extractBlog,
        getAuthorData,
        formatDateForInput,
        triggerToast
    ]);


    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);


    /* =========================================================
       WORD COUNT
    ========================================================= */

    const getWordCount = useCallback((text) => {

        const plainText =
            text
                .replace(/<[^>]*>/g, ' ')
                .trim();

        return plainText
            ? plainText.split(/\s+/).length
            : 0;

    }, []);


    const wordCount =
        getWordCount(editorContent);

    const readTime =
        Math.max(
            1,
            Math.ceil(wordCount / 200)
        );


    /* =========================================================
       HEADLINE
    ========================================================= */

    const handleHeadlineChange = (e) => {

        const value =
            e.target.value.slice(0, 100);

        setHeadline(value);
    };


    /* =========================================================
       SLUG
    ========================================================= */

    const handleSlugChange = (e) => {

        setSlug(e.target.value);
    };


    const handleCopySlug = async () => {

        try {

            await navigator.clipboard.writeText(
                `/blog/${slug}`
            );

            triggerToast(
                'Slug copied successfully!'
            );

        } catch (error) {

            console.error(
                'Copy slug failed:',
                error
            );

            triggerToast(
                'Unable to copy slug.'
            );
        }
    };


    /* =========================================================
       TAGS
    ========================================================= */

    const removeTag = (tagToRemove) => {

        setTags(
            tags.filter(
                (tag) => tag !== tagToRemove
            )
        );
    };

    const handleTagKeyDown = (e) => {
        if (
            (e.key === 'Enter' || e.key === ',') &&
            tagInput.trim()
        ) {
            e.preventDefault();

            const cleanTag = tagInput
                .trim()
                .replace(/^["']+|["']+$/g, '')
                .replace(/^,+|,+$/g, '')
                .trim();

            if (
                cleanTag &&
                !tags.some(
                    (tag) =>
                        String(tag).toLowerCase() ===
                        cleanTag.toLowerCase()
                )
            ) {
                setTags((prevTags) => [
                    ...prevTags,
                    cleanTag
                ]);
            }

            setTagInput('');
        }
    };


    /* =========================================================
       AUTHOR
    ========================================================= */

    const handleAuthorChange = (
        field,
        value
    ) => {

        setAuthor((prev) => ({
            ...prev,
            [field]: value
        }));
    };


    /* =========================================================
       FEATURED IMAGE
    ========================================================= */

    const triggerFileInput = () => {

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    const handleFileChange = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;


        if (!file.type.startsWith('image/')) {

            triggerToast(
                'Please select a valid image file.'
            );

            e.target.value = '';

            return;
        }


        if (
            file.size >
            10 * 1024 * 1024
        ) {

            triggerToast(
                'Cover image must be less than 10MB.'
            );

            e.target.value = '';

            return;
        }


        if (
            coverImage?.url &&
            coverImage.url.startsWith('blob:')
        ) {

            URL.revokeObjectURL(
                coverImage.url
            );
        }


        const sizeInMB =
            (
                file.size /
                (1024 * 1024)
            ).toFixed(1) + ' MB';


        const url =
            URL.createObjectURL(file);


        setCoverImage({
            url,
            name: file.name,
            size: sizeInMB,
            isExisting: false
        });

        setCoverImageFile(file);

        triggerToast(
            'Featured image selected.'
        );
    };


    const removeCoverImage = () => {

        if (
            coverImage?.url &&
            coverImage.url.startsWith('blob:')
        ) {

            URL.revokeObjectURL(
                coverImage.url
            );
        }

        setCoverImage(null);
        setCoverImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        triggerToast(
            'Featured image removed.'
        );
    };


    /* =========================================================
       INLINE IMAGE
    ========================================================= */

    const triggerInlineImageInput = () => {

        if (
            inlineImageInputRef.current
        ) {

            inlineImageInputRef.current.click();
        }
    };


    const handleInlineImageChange =
        async (e) => {

            const file =
                e.target.files?.[0];

            if (!file) return;


            if (
                !file.type.startsWith('image/')
            ) {

                triggerToast(
                    'Please select a valid image file.'
                );

                e.target.value = '';

                return;
            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                triggerToast(
                    'Inline image must be less than 10MB.'
                );

                e.target.value = '';

                return;
            }


            try {

                setUploadingInline(true);

                const formData =
                    new FormData();

                formData.append(
                    'image',
                    file
                );


                const response =
                    await uploadInlineImageService(
                        formData
                    );


                const imageUrl =
                    response?.imageUrl ||
                    response?.url ||
                    response?.data?.imageUrl ||
                    response?.data?.url ||
                    response?.data?.image?.url ||
                    response?.image?.url;


                if (!imageUrl) {

                    throw new Error(
                        'Image uploaded but image URL was not returned by the API.'
                    );
                }


                const quill =
                    quillRef.current?.getEditor();


                if (!quill) {

                    throw new Error(
                        'Editor is not available.'
                    );
                }


                const range =
                    quill.getSelection(true);


                const position =
                    range
                        ? range.index
                        : quill.getLength();


                quill.insertEmbed(
                    position,
                    'image',
                    imageUrl,
                    'user'
                );


                quill.setSelection(
                    position + 1,
                    0,
                    'user'
                );


                triggerToast(
                    'Inline image uploaded successfully!'
                );

            } catch (error) {

                console.error(
                    'Inline image upload failed:',
                    error
                );

                triggerToast(
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Failed to upload inline image.'
                );

            } finally {

                setUploadingInline(false);

                if (
                    inlineImageInputRef.current
                ) {

                    inlineImageInputRef.current.value =
                        '';
                }
            }
        };


    /* =========================================================
       QUILL IMAGE HANDLER
    ========================================================= */

    const imageHandler = useCallback(() => {

        triggerInlineImageInput();

    }, []);


    const modules = useMemo(() => ({

        toolbar: {
            container: '#custom-quill-toolbar',

            handlers: {
                image: imageHandler
            }
        }

    }), [imageHandler]);


    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'link',
        'image'
    ];


    /* =========================================================
       BUILD FORM DATA
    ========================================================= */

    const buildFormData = (
        targetStatus
    ) => {

        const formData =
            new FormData();


        formData.append(
            'title',
            headline
        );

        formData.append(
            'headline',
            headline
        );

        formData.append(
            'slug',
            slug
        );

        formData.append(
            'excerpt',
            excerpt
        );

        formData.append(
            'content',
            editorContent
        );

        formData.append(
            'category',
            category
        );

        tags.forEach((tag) => {
            const cleanTag = String(tag)
                .trim()
                .replace(/^["']+|["']+$/g, '');

            if (cleanTag) {
                formData.append('tags', cleanTag);
            }
        });

        formData.append(
            'author',
            JSON.stringify({
                name: author.name,
                role: author.role
            })
        );


        formData.append(
            'metaTitle',
            metaTitle
        );

        formData.append(
            'metaDescription',
            metaDescription
        );


        formData.append(
            'status',
            targetStatus
        );


        const formattedPublicationDate =
            publicationDate
                ? new Date(
                    `${publicationDate}T00:00:00`
                ).toISOString()
                : '';


        if (formattedPublicationDate) {

            formData.append(
                'publicationDate',
                formattedPublicationDate
            );

            formData.append(
                'publishDate',
                formattedPublicationDate
            );
        }


        formData.append(
            'readTime',
            String(readTime)
        );


        formData.append(
            'wordCount',
            String(wordCount)
        );


        /*
         * Only send image when user selected
         * a NEW image.
         */
        if (coverImageFile) {

            formData.append(
                'image',
                coverImageFile
            );
        }


        return formData;
    };


    /* =========================================================
       UPDATE BLOG
    ========================================================= */

    const handleUpdateBlog = async (
        targetStatus,
        successMessage
    ) => {

        if (!blogId) {

            triggerToast(
                'Invalid blog ID.'
            );

            return;
        }


        if (!headline.trim()) {

            triggerToast(
                'Article title is required.'
            );

            return;
        }


        try {

            setSaving(true);


            const formData =
                buildFormData(
                    targetStatus
                );


            console.log(
                'Updating Blog ID:',
                blogId
            );

            console.log(
                'Update Status:',
                targetStatus
            );


            const response =
                await updateBlogService(
                    blogId,
                    formData
                );


            console.log(
                'Update Blog Response:',
                response
            );


            setStatus(
                targetStatus
            );


            setCoverImageFile(null);


            triggerToast(
                successMessage ||
                'Article updated successfully!'
            );

        } catch (error) {

            console.error(
                'Update Blog Error:',
                error
            );


            triggerToast(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to update article.'
            );

        } finally {

            setSaving(false);
        }
    };


    /* =========================================================
       SAVE DRAFT
    ========================================================= */

    const handleSaveDraft = async () => {

        await handleUpdateBlog(
            'draft',
            'Draft updated successfully!'
        );
    };


    /* =========================================================
       PUBLISH
    ========================================================= */

    const handlePublish = async () => {

        await handleUpdateBlog(
            'published',
            'Blog updated successfully!'
        );
    };


    /* =========================================================
       NO BLOG ID
    ========================================================= */

    if (!blogId) {

        return (

            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 shadow-sm font-sans">

                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">

                    <FiLock size={22} />

                </div>


                <h2 className="text-lg font-bold text-slate-800 mb-2">

                    No Article Selected to Edit

                </h2>


                <p className="text-xs text-slate-500 mb-6 leading-relaxed">

                    The Edit tab is restricted. Please select a post from the Dashboard to open the editor.

                </p>


                <button
                    onClick={() =>
                        navigate('/dashboard')
                    }
                    className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >

                    <FiArrowLeft size={16} />

                    <span>
                        Go to Dashboard
                    </span>

                </button>

            </div>
        );
    }


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="w-full flex items-center justify-center py-20">

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">

                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

                    <h3 className="text-sm font-bold text-slate-800">

                        Loading blog...

                    </h3>

                    <p className="text-xs text-slate-400 mt-1">

                        Please wait while we fetch the article.

                    </p>

                </div>

            </div>
        );
    }


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="w-full space-y-6 pb-8 font-sans text-slate-700">


            {/* =====================================================
                TOAST
            ===================================================== */}

            {toastMessage && (

                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">

                    <FiCheckCircle
                        className="text-emerald-400"
                        size={16}
                    />

                    <span>
                        {toastMessage}
                    </span>

                </div>
            )}


            {/* =====================================================
                TOP HEADER - KEPT SAME
            ===================================================== */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">

                <div>

                    <div className="flex items-center gap-2.5">

                        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                            Edit Blogs
                        </h1>

                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            Edit
                        </span>

                    </div>

                    <p className="text-xs text-slate-400 mt-1 font-normal">
                        Manage, edit, preview, and organize all your blog posts in one place.
                    </p>

                </div>

            </div>




            {/* =====================================================
                EXISTING BLOG HEADER
            ===================================================== */}

            <div className="w-full bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                    <div className="min-w-0 flex-1">
                        {/* Main desktop row wrapper */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">

                            {/* Breadcrumb Navigation */}
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium mb-2.5 lg:mb-0 overflow-hidden shrink-0">
                                <button
                                    type="button"
                                    className="hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Blogs
                                </button>

                                <span className="shrink-0 text-slate-300">›</span>

                                <span className="text-slate-600 truncate min-w-0 max-w-32.5 xs:max-w-[200px] sm:max-w-87.5 md:max-w-112.5 lg:max-w-64">
                                    {headline}
                                </span>

                                <span className="shrink-0 text-slate-300">›</span>

                                <span className="text-[#4F46E5] font-semibold shrink-0">
                                    Edit
                                </span>
                            </div>

                            {/* Title & Status Badge */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 shrink-0">
                                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight wrap-break-word">
                                    Edit Blog
                                </h2>

                                <div className="inline-flex items-center gap-1.5 bg-[#ECFDF5] text-[#10B981] px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border border-emerald-100 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                                    <span className="whitespace-nowrap">
                                        Status: {status}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>




                </div>

            </div>


            {/* =====================================================
                CREATE PAGE STYLE BODY
            ===================================================== */}

            <div className="bg-[#F8F9FD] font-sans text-slate-700 -mx-1 sm:-mx-2">

                <main className="w-full space-y-4">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">


                        {/* =================================================
                            LEFT SIDE
                        ================================================= */}

                        <div className="lg:col-span-8 space-y-6">


                            {/* =============================================
                                BASIC METADATA
                            ============================================= */}

                            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">

                                    <div>

                                        <p className="text-[10px] font-bold text-[#4F46E5] tracking-[0.15em] uppercase">
                                            01. BASIC METADATA
                                        </p>

                                        <h3 className="text-sm font-bold text-slate-800 mt-1">
                                            Blog Information
                                        </h3>

                                    </div>

                                    <FiSliders
                                        size={17}
                                        className="text-slate-300"
                                    />

                                </div>


                                <div className="p-5 sm:p-6 space-y-6">


                                    {/* =====================================
                                        HEADLINE
                                    ===================================== */}

                                    <div>

                                        <div className="flex items-center justify-between mb-2">

                                            <label className="text-xs font-bold text-slate-700">
                                                Blog Headline
                                            </label>

                                            <span className="text-[10px] text-slate-400">
                                                {headline.length}/100
                                            </span>

                                        </div>

                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={
                                                handleHeadlineChange
                                            }
                                            maxLength={100}
                                            placeholder="Enter your blog headline..."
                                            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        />

                                    </div>


                                    {/* =====================================
                                        SLUG
                                    ===================================== */}

                                    <div>

                                        <label className="text-xs font-bold text-slate-700 block mb-2">
                                            Permanent URL Slug
                                        </label>

                                        <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300">

                                            <div className="px-3 text-xs text-slate-400 border-r border-slate-200 bg-slate-50 h-full flex items-center">
                                                /blog/
                                            </div>

                                            <input
                                                type="text"
                                                value={slug}
                                                onChange={
                                                    handleSlugChange
                                                }
                                                placeholder="your-blog-slug"
                                                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-xs text-slate-700 focus:outline-none"
                                            />

                                            <button
                                                type="button"
                                                onClick={
                                                    handleCopySlug
                                                }
                                                className="mr-2 p-2 rounded-lg hover:bg-white text-slate-400 hover:text-[#4F46E5] transition-colors cursor-pointer"
                                                title="Copy slug"
                                            >
                                                <FiCopy
                                                    size={14}
                                                />
                                            </button>

                                        </div>

                                    </div>


                                    {/* =====================================
                                        FEATURED IMAGE
                                    ===================================== */}

                                    <div>

                                        <label className="text-xs font-bold text-slate-700 block mb-2">
                                            Featured Cover Image
                                        </label>


                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleFileChange
                                            }
                                            className="hidden"
                                        />


                                        {!coverImage ? (

                                            <button
                                                type="button"
                                                onClick={
                                                    triggerFileInput
                                                }
                                                className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-[#F8FAFC] hover:bg-indigo-50/30 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer"
                                            >

                                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">

                                                    <FiUploadCloud
                                                        size={21}
                                                        className="text-[#4F46E5]"
                                                    />

                                                </div>

                                                <p className="text-xs font-bold text-slate-700">
                                                    Upload cover image
                                                </p>

                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    PNG, JPG or WEBP • Max 10MB
                                                </p>

                                            </button>

                                        ) : (

                                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-[#F8FAFC]">

                                                <div className="relative">

                                                    <img
                                                        src={coverImage.url}
                                                        alt="Featured cover"
                                                        className="w-full h-52 sm:h-64 object-cover"
                                                    />


                                                    <div className="absolute top-3 right-3 flex items-center gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                triggerFileInput
                                                            }
                                                            className="bg-white/95 backdrop-blur-sm text-slate-700 hover:text-[#4F46E5] p-2 rounded-lg shadow-sm border border-slate-200 cursor-pointer"
                                                            title="Change image"
                                                        >

                                                            <FiEdit3
                                                                size={14}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={
                                                                removeCoverImage
                                                            }
                                                            className="bg-white/95 backdrop-blur-sm text-red-500 hover:text-red-600 p-2 rounded-lg shadow-sm border border-slate-200 cursor-pointer"
                                                            title="Remove image"
                                                        >

                                                            <FiTrash2
                                                                size={14}
                                                            />

                                                        </button>

                                                    </div>

                                                </div>


                                                <div className="p-3 flex items-center justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <p className="text-xs font-bold text-slate-700 truncate">
                                                            {coverImage.name}
                                                        </p>

                                                        {coverImage.size && (

                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                {coverImage.size}
                                                            </p>

                                                        )}

                                                    </div>


                                                    <span className="shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">

                                                        {coverImage.isExisting
                                                            ? 'Current'
                                                            : 'New image'
                                                        }

                                                    </span>

                                                </div>

                                            </div>
                                        )}

                                    </div>


                                    {/* =====================================
                                        EXCERPT
                                    ===================================== */}

                                    <div>

                                        <div className="flex items-center justify-between mb-2">

                                            <label className="text-xs font-bold text-slate-700">
                                                Short Excerpt / Teaser
                                            </label>

                                            <span className="text-[10px] text-slate-400">
                                                {excerpt.length} characters
                                            </span>

                                        </div>


                                        <textarea
                                            value={excerpt}
                                            onChange={(e) =>
                                                setExcerpt(
                                                    e.target.value
                                                )
                                            }
                                            rows={4}
                                            placeholder="Write a short summary of your article..."
                                            className="w-full resize-none bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        />

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                ARTICLE BODY
                            ============================================= */}

                            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                    <div>

                                        <p className="text-[10px] font-bold text-[#4F46E5] tracking-[0.15em] uppercase">
                                            02. ARTICLE BODY
                                        </p>

                                        <h3 className="text-sm font-bold text-slate-800 mt-1">
                                            Editor
                                        </h3>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {wordCount} words
                                        </span>

                                        <span className="text-slate-200">
                                            |
                                        </span>

                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {readTime} min read
                                        </span>

                                    </div>

                                </div>




                                {/* =====================================
                                        INLINE IMAGE PANEL
                                    ===================================== */}

                                <input
                                    ref={
                                        inlineImageInputRef
                                    }
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleInlineImageChange
                                    }
                                    className="hidden"
                                />


                                <div className="mt-4 rounded-xl border border-slate-100 bg-[#F8FAFC] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">

                                            <FiImage
                                                size={15}
                                                className="text-[#4F46E5]"
                                            />

                                        </div>


                                        <div>

                                            <p className="text-[11px] font-bold text-slate-700">
                                                Add inline image
                                            </p>

                                            <p className="text-[10px] text-slate-400">
                                                Upload an image directly into your article.
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            triggerInlineImageInput
                                        }
                                        disabled={
                                            uploadingInline
                                        }
                                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-200 hover:text-[#4F46E5] text-[10px] font-bold text-slate-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >

                                        <FiUploadCloud
                                            size={14}
                                        />

                                        {uploadingInline
                                            ? 'Uploading...'
                                            : 'Upload Image'
                                        }

                                    </button>

                                </div>

                                <div className="p-5 sm:p-6">


                                    {/* =====================================
                                        CUSTOM TOOLBAR
                                    ===================================== */}

                                    <div
                                        id="custom-quill-toolbar"
                                        className="border border-slate-200 border-b-0 rounded-t-xl bg-[#F8FAFC] px-2 py-2 flex flex-wrap items-center gap-1"
                                    >

                                        <select
                                            className="ql-header text-xs"
                                            defaultValue=""
                                        >

                                            <option value="2">
                                                H2
                                            </option>

                                            <option value="3">
                                                H3
                                            </option>

                                            <option value="">
                                                Normal
                                            </option>

                                        </select>


                                        <span className="w-px h-5 bg-slate-200 mx-1" />


                                        <button
                                            type="button"
                                            className="ql-bold"
                                            title="Bold"
                                        />

                                        <button
                                            type="button"
                                            className="ql-italic"
                                            title="Italic"
                                        />

                                        <button
                                            type="button"
                                            className="ql-underline"
                                            title="Underline"
                                        />

                                        <button
                                            type="button"
                                            className="ql-strike"
                                            title="Strike"
                                        />


                                        <span className="w-px h-5 bg-slate-200 mx-1" />


                                        <button
                                            type="button"
                                            className="ql-list"
                                            value="ordered"
                                            title="Numbered list"
                                        />

                                        <button
                                            type="button"
                                            className="ql-list"
                                            value="bullet"
                                            title="Bullet list"
                                        />


                                        <span className="w-px h-5 bg-slate-200 mx-1" />


                                        <button
                                            type="button"
                                            className="ql-link"
                                            title="Insert link"
                                        />

                                        <button
                                            type="button"
                                            className="ql-image"
                                            title="Insert image"
                                        />


                                        <button
                                            type="button"
                                            className="ql-clean"
                                            title="Clear formatting"
                                        />

                                    </div>


                                    <div className="custom-quill-wrapper">

                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={editorContent}
                                            onChange={
                                                setEditorContent
                                            }
                                            modules={modules}
                                            formats={formats}
                                            placeholder="Start writing your article..."
                                        />

                                    </div>




                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            RIGHT SIDE
                        ================================================= */}

                        <div className="lg:col-span-4 space-y-6">


                            {/* =============================================
                                SETTINGS & TAXONOMY
                            ============================================= */}

                            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                <div className="px-5 py-4 border-b border-slate-100">

                                    <p className="text-[10px] font-bold text-[#4F46E5] tracking-[0.15em] uppercase">
                                        SETTINGS
                                    </p>

                                    <h3 className="text-sm font-bold text-slate-800 mt-1">
                                        Taxonomy & Publication
                                    </h3>

                                </div>


                                <div className="p-5 space-y-5">


                                    {/* =====================================
                                        CATEGORY
                                    ===================================== */}
                                    <div>

                                        <label className="block text-xs font-bold text-slate-800 mb-2">
                                            Primary Category
                                        </label>

                                        <input
                                            type="text"
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                            placeholder="Enter category..."
                                            className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                        />

                                    </div>

                                    {/* =====================================
                                        TAGS
                                    ===================================== */}

                                    <div>

                                        <label className="text-xs font-bold text-slate-700 block mb-2">
                                            Article Tags
                                        </label>


                                        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300">

                                            <div className="flex flex-wrap gap-1.5 mb-1">
                                                {Array.isArray(tags) &&
                                                    tags.length > 0 &&
                                                    tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-[#4F46E5] px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                        >
                                                            {tag}

                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(tag)}
                                                                className="hover:text-red-500 cursor-pointer"
                                                            >
                                                                <FiX size={11} />
                                                            </button>
                                                        </span>
                                                    ))
                                                }

                                            </div>


                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) =>
                                                    setTagInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={
                                                    handleTagKeyDown
                                                }
                                                placeholder="Type tag and press Enter..."
                                                className="w-full bg-transparent px-1 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                            />

                                        </div>

                                        <p className="text-[9px] text-slate-400 mt-1.5">
                                            Press Enter or comma to add a tag.
                                        </p>

                                    </div>


                                    {/* =====================================
                                        AUTHOR
                                    ===================================== */}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <div>

                                            <label className="text-xs font-bold text-slate-700 block mb-2">
                                                Author Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    author.name
                                                }
                                                onChange={(e) =>
                                                    handleAuthorChange(
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Author name"
                                                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                                            />

                                        </div>


                                        <div>

                                            <label className="text-xs font-bold text-slate-700 block mb-2">
                                                Author Role
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    author.role
                                                }
                                                onChange={(e) =>
                                                    handleAuthorChange(
                                                        'role',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Editor"
                                                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        DATE
                                    ===================================== */}

                                    <div>

                                        <label className="text-xs font-bold text-slate-700 block mb-2">
                                            Publication Date
                                        </label>

                                        <div className="relative">

                                            <FiCalendar
                                                size={14}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />

                                            <input
                                                type="date"
                                                value={
                                                    publicationDate
                                                }
                                                onChange={(e) =>
                                                    setPublicationDate(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                                            />

                                        </div>

                                    </div>



                                </div>

                            </section>


                            {/* =============================================
                                SEO
                            ============================================= */}

                            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSeoOpen(
                                            !seoOpen
                                        )
                                    }
                                    className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 cursor-pointer"
                                >

                                    <div className="text-left">

                                        <p className="text-[10px] font-bold text-[#4F46E5] tracking-[0.15em] uppercase">
                                            SEO
                                        </p>

                                        <h3 className="text-sm font-bold text-slate-800 mt-1">
                                            Search Optimization
                                        </h3>

                                    </div>


                                    <FiChevronDown
                                        size={16}
                                        className={`text-slate-400 transition-transform ${seoOpen
                                            ? 'rotate-180'
                                            : ''
                                            }`}
                                    />

                                </button>


                                {seoOpen && (

                                    <div className="p-5 space-y-5">


                                        {/* =================================
                                            META TITLE
                                        ================================= */}

                                        <div>

                                            <div className="flex items-center justify-between mb-2">

                                                <label className="text-xs font-bold text-slate-700">
                                                    Meta Title
                                                </label>

                                                <span className="text-[9px] text-slate-400">
                                                    {metaTitle.length}/60
                                                </span>

                                            </div>


                                            <input
                                                type="text"
                                                value={
                                                    metaTitle
                                                }
                                                onChange={(e) =>
                                                    setMetaTitle(
                                                        e.target.value.slice(
                                                            0,
                                                            60
                                                        )
                                                    )
                                                }
                                                maxLength={60}
                                                placeholder="SEO optimized title"
                                                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                                            />

                                        </div>


                                        {/* =================================
                                            META DESCRIPTION
                                        ================================= */}

                                        <div>

                                            <div className="flex items-center justify-between mb-2">

                                                <label className="text-xs font-bold text-slate-700">
                                                    Meta Description
                                                </label>

                                                <span className="text-[9px] text-slate-400">
                                                    {metaDescription.length}/160
                                                </span>

                                            </div>


                                            <textarea
                                                value={
                                                    metaDescription
                                                }
                                                onChange={(e) =>
                                                    setMetaDescription(
                                                        e.target.value.slice(
                                                            0,
                                                            160
                                                        )
                                                    )
                                                }
                                                maxLength={160}
                                                rows={5}
                                                placeholder="Write a concise description for search engines..."
                                                className="w-full resize-none bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                                            />

                                        </div>




                                    </div>

                                )}

                            </section>




                        </div>

                    </div>


                    {/* =================================================
                        BOTTOM ACTION FOOTER
                    ================================================= */}

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">


                            <div className="flex items-center gap-2">

                                <span className="relative flex h-2.5 w-2.5">

                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />

                                </span>

                                <span className="text-[10px] font-semibold text-slate-400">
                                    Changes are ready to be saved
                                </span>

                            </div>


                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/dashboard"
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all cursor-pointer"
                                >

                                    <FiX
                                        size={14}
                                    />

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={
                                        handleSaveDraft
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    <FiSave
                                        size={14}
                                    />

                                    {saving
                                        ? 'Saving...'
                                        : 'Save Draft'
                                    }

                                </button>


                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={
                                        handlePublish
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    <FiRefreshCw
                                        size={14}
                                    />

                                    {saving
                                        ? 'Updating...'
                                        : 'Publish Blog'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </main>

            </div>


            {/* =====================================================
                CUSTOM QUILL CSS
            ===================================================== */}

            <style>
                {`
                    .custom-quill-wrapper .ql-toolbar.ql-snow {
                        display: none;
                    }

                    .custom-quill-wrapper .ql-container.ql-snow {
                        border: 1px solid #e2e8f0;
                        border-radius: 0 0 12px 12px;
                        border-top: 0;
                        font-family: inherit;
                    }

                    .custom-quill-wrapper .ql-editor {
                        min-height: 420px;
                        padding: 18px;
                        font-size: 14px;
                        line-height: 1.8;
                        color: #334155;
                    }

                    .custom-quill-wrapper .ql-editor.ql-blank::before {
                        color: #94a3b8;
                        font-style: normal;
                        font-size: 13px;
                    }

                    .custom-quill-wrapper .ql-editor h2 {
                        font-size: 24px;
                        line-height: 1.3;
                        font-weight: 800;
                        color: #0f172a;
                        margin-top: 20px;
                        margin-bottom: 12px;
                    }

                    .custom-quill-wrapper .ql-editor h3 {
                        font-size: 20px;
                        line-height: 1.4;
                        font-weight: 700;
                        color: #0f172a;
                        margin-top: 18px;
                        margin-bottom: 10px;
                    }

                    .custom-quill-wrapper .ql-editor p {
                        margin-bottom: 12px;
                    }

                    .custom-quill-wrapper .ql-editor img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 12px;
                        margin: 16px 0;
                    }

                    #custom-quill-toolbar {
                        min-height: 48px;
                    }

                    #custom-quill-toolbar .ql-formats {
                        margin-right: 0;
                    }

                    #custom-quill-toolbar button {
                        width: 28px;
                        height: 28px;
                        padding: 5px;
                        border-radius: 7px;
                    }

                    #custom-quill-toolbar button:hover {
                        background: #eef2ff;
                    }

                    #custom-quill-toolbar .ql-active {
                        background: #eef2ff;
                        color: #4f46e5;
                    }

                    #custom-quill-toolbar select {
                        height: 30px;
                        border: 1px solid #e2e8f0;
                        border-radius: 7px;
                        background: white;
                        color: #475569;
                        font-size: 11px;
                        font-weight: 600;
                        padding: 0 5px;
                        outline: none;
                    }

                    #custom-quill-toolbar select:focus {
                        border-color: #a5b4fc;
                    }

                    @media (max-width: 640px) {
                        .custom-quill-wrapper .ql-editor {
                            min-height: 320px;
                            padding: 14px;
                            font-size: 13px;
                        }

                        #custom-quill-toolbar {
                            gap: 2px;
                            padding: 7px;
                        }
                    }
                `}
            </style>

        </div>
    );
};

export default EditBlogsPage;