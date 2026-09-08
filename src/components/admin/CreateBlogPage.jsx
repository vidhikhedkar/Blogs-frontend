
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiArrowLeft, FiImage, FiUploadCloud, FiTrash2, FiRefreshCw, FiX, FiCalendar, FiShare2, FiSave, FiCheckCircle, } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { createBlogService, uploadInlineImageService, } from '../service/blog.service';

const CreateBlogPage = () => {
    const navigate = useNavigate();
    const [headline, setHeadline] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState({
        name: '',
        role: '',
    });

    const [seoOpen, setSeoOpen] = useState(true);
    const [notification, setNotification] = useState('');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploadingInline, setUploadingInline] = useState(false);
    const fileInputRef = useRef(null);
    const inlineImageInputRef = useRef(null);
    const quillRef = useRef(null);
    const [editorContent, setEditorContent] = useState('');


    const getWordCount = (text) => {
        const plainText = text
            .replace(/<[^>]*>/g, ' ')
            .trim();
        return plainText
            ? plainText.split(/\s+/).length
            : 0;
    };

    const handleHeadlineChange = (e) => {
        setHeadline(e.target.value);
    };

    const handleSlugChange = (e) => {
        setSlug(e.target.value);
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (
            (e.key === 'Enter' || e.key === ',') &&
            tagInput.trim()
        ) {
            e.preventDefault();
            const cleanTag = tagInput.trim();
            if (!tags.includes(cleanTag)) {
                setTags([...tags, cleanTag]);
            }
            setTagInput('');
        }
    };


    const handleCopySlug = async () => {
        try {
            await navigator.clipboard.writeText(
                `/ blog / ${slug} `
            );
            triggerNotification('Slug copied successfully!');
        } catch (error) {
            console.error('Copy slug failed:', error);
        }
    };

    const triggerNotification = (msg) => {
        setNotification(msg);

        setTimeout(() => {
            setNotification('');
        }, 3000);
    };


    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            triggerNotification(
                'Please select a valid image file.'
            );
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            triggerNotification(
                'Cover image must be less than 10MB.'
            );
            return;
        }
        const sizeInMB =
            (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        const url = URL.createObjectURL(file);
        setCoverImage({
            url,
            name: file.name,
            size: sizeInMB,
        });

        setCoverImageFile(file);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeCoverImage = () => {
        if (coverImage?.url) {
            URL.revokeObjectURL(coverImage.url);
        }

        setCoverImage(null);
        setCoverImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /* ============================================================
       INLINE IMAGE
       POST /api/blogs/upload-inline-image
    ============================================================ */

    const triggerInlineImageInput = () => {
        if (inlineImageInputRef.current) {
            inlineImageInputRef.current.click();
        }
    };

    const handleInlineImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            triggerNotification(
                'Please select a valid image file.'
            );

            e.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            triggerNotification(
                'Inline image must be less than 10MB.'
            );

            e.target.value = '';
            return;
        }

        try {
            setUploadingInline(true);

            const formData = new FormData();

            formData.append('image', file);

            console.log(
                'Uploading inline image:',
                file.name
            );

            const response =
                await uploadInlineImageService(formData);

            console.log(
                'Inline Image API Response:',
                response
            );

            const imageUrl =
                response?.imageUrl ||
                response?.url ||
                response?.data?.imageUrl ||
                response?.data?.url ||
                response?.data?.image?.url;

            if (!imageUrl) {
                console.error(
                    'Inline image URL missing:',
                    response
                );

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

            triggerNotification(
                'Inline image uploaded successfully!'
            );
        } catch (error) {
            console.error(
                'Inline image upload failed:',
                error
            );

            triggerNotification(
                error?.message ||
                error?.error ||
                'Failed to upload inline image.'
            );
        } finally {
            setUploadingInline(false);

            if (inlineImageInputRef.current) {
                inlineImageInputRef.current.value = '';
            }
        }
    };

    /* ============================================================
       QUILL MODULES
    ============================================================ */

    const modules = {
        toolbar: [
            [{ header: [2, 3, false] }],
            [
                'bold',
                'italic',
                'underline',
                'strike',
            ],
            [
                { list: 'ordered' },
                { list: 'bullet' },
            ],
            ['link', 'image'],
            ['clean'],
        ],
    };

    /* ============================================================
       AUTHOR CHANGE
    ============================================================ */

    const handleAuthorChange = (field, value) => {
        setAuthor((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /* ============================================================
       CREATE BLOG PAYLOAD
    ============================================================ */

    const buildBlogFormData = (status) => {
        const formData = new FormData();

        /* --------------------------------------------------------
           BASIC INFORMATION
        -------------------------------------------------------- */

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

        /* --------------------------------------------------------
           HTML ARTICLE CONTENT
        -------------------------------------------------------- */

        formData.append(
            'content',
            editorContent
        );

        /* --------------------------------------------------------
           CATEGORY
        -------------------------------------------------------- */

        formData.append(
            'category',
            category
        );

        /* --------------------------------------------------------
           TAGS
        -------------------------------------------------------- */

        formData.append(
            'tags',
            JSON.stringify(tags)
        );

        /* --------------------------------------------------------
           AUTHOR
        -------------------------------------------------------- */

        formData.append(
            'author',
            JSON.stringify({
                name: author.name,
                role: author.role,
                // avatar: author.avatar,
            })
        );

        /* --------------------------------------------------------
           SEO
        -------------------------------------------------------- */

        formData.append(
            'metaTitle',
            metaTitle
        );

        formData.append(
            'metaDescription',
            metaDescription
        );

        /* --------------------------------------------------------
           STATUS
        -------------------------------------------------------- */

        formData.append(
            'status',
            status
        );

        /* --------------------------------------------------------
           PUBLICATION DATE
        -------------------------------------------------------- */
        formData.append(
            'publicationDate',
            publicationDate
                ? new Date(`${publicationDate}T00:00:00`).toISOString()
                : new Date().toISOString()
        );
        /* --------------------------------------------------------
           READ TIME
        -------------------------------------------------------- */

        const wordCount =
            getWordCount(editorContent);

        const readTime =
            Math.max(
                1,
                Math.ceil(wordCount / 200)
            );

        formData.append(
            'readTime',
            String(readTime)
        );

        /* --------------------------------------------------------
           COVER IMAGE
        -------------------------------------------------------- */

        if (coverImageFile) {
            formData.append(
                'image',
                coverImageFile
            );
        }

        return formData;
    };

    /* ============================================================
       VALIDATION
    ============================================================ */

    const validateBlog = () => {
        if (!headline.trim()) {
            triggerNotification('Blog headline is required.');
            return false;
        }

        if (!slug.trim()) {
            triggerNotification('Blog slug is required.');
            return false;
        }

        if (!editorContent.trim()) {
            triggerNotification('Blog content is required.');
            return false;
        }

        return true;
    };

    /* ============================================================
       SAVE DRAFT
       POST /api/blogs
    ============================================================ */

    const handleSaveDraft = async () => {
        // Allow draft to be saved even if only one field is filled.
        // Only prevent saving when absolutely nothing has been entered.

        const hasAnyData =
            headline.trim() ||
            slug.trim() ||
            excerpt.trim() ||
            category.trim() ||
            editorContent.trim() ||
            tags.length > 0 ||
            author.name.trim() ||
            author.role.trim() ||
            metaTitle.trim() ||
            metaDescription.trim() ||
            coverImageFile ||
            publicationDate;

        if (!hasAnyData) {
            triggerNotification(
                'Please enter at least one detail before saving the draft.'
            );

            return;
        }

        try {
            setSaving(true);

            const formData = buildBlogFormData('draft');

            console.log('Creating draft blog...');

            const response = await createBlogService(formData);

            console.log(
                'Create Draft Blog Response:',
                response
            );

            triggerNotification(
                'Draft saved successfully!'
            );
        } catch (error) {
            console.error(
                'Create Draft Blog Error:',
                error
            );

            triggerNotification(
                error?.response?.data?.message ||
                error?.message ||
                error?.error ||
                'Failed to save draft.'
            );
        } finally {
            setSaving(false);
        }
    };
    /* ============================================================
       PUBLISH BLOG
       POST /api/blogs
    ============================================================ */

    const handlePublish = async () => {
        if (!validateBlog()) {
            return;
        }

        try {
            setPublishing(true);

            const formData =
                buildBlogFormData('published');

            console.log(
                'Publishing blog...'
            );

            const response =
                await createBlogService(
                    formData
                );

            console.log(
                'Publish Blog Response:',
                response
            );

            triggerNotification(
                'Blog published live!'
            );

            // Optional:
            // setTimeout(() => {
            //     navigate('/dashboard');
            // }, 1500);
        } catch (error) {
            console.error(
                'Publish Blog Error:',
                error
            );

            triggerNotification(
                error?.response?.data?.message ||
                error?.message ||
                error?.error ||
                'Failed to publish blog.'
            );
        } finally {
            setPublishing(false);
        }
    };

    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div className="bg-[#F8F9FD] font-sans text-slate-700">

            {/* ====================================================
                NOTIFICATION
            ==================================================== */}

            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
                    <FiCheckCircle
                        className="text-emerald-400"
                        size={16}
                    />

                    <span>
                        {notification}
                    </span>
                </div>
            )}

            <div className="w-full space-y-4">

                {/* ====================================================
                    TOP HEADER
                ==================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-1">

                            <span>
                                EDITORIAL ENGINE
                            </span>

                            <span>
                                /
                            </span>

                            <span>
                                NEW ENTRY
                            </span>

                        </div>

                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                            Create New Blog
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Draft and publish a new post to your publication.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/dashboard')
                        }
                        className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                    >
                        <FiArrowLeft size={14} />

                        <span>
                            Back to Dashboard
                        </span>
                    </button>

                </div>

                {/* ====================================================
                    MAIN GRID
                ==================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ====================================================
                        LEFT COLUMN
                    ==================================================== */}

                    <div className="lg:col-span-8 space-y-6">

                        {/* ====================================================
                            BASIC METADATA
                        ==================================================== */}

                        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6">

                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                01. BASIC METADATA
                            </p>

                            {/* HEADLINE */}

                            <div>

                                <div className="flex justify-between items-center mb-2">

                                    <label className="text-xs font-bold text-slate-800">
                                        Blog Headline
                                    </label>

                                    <span className="text-xs text-slate-400 font-medium">
                                        {headline.length} / 100
                                    </span>

                                </div>

                                <input
                                    type="text"
                                    maxLength={100}
                                    value={headline}
                                    onChange={handleHeadlineChange}
                                    placeholder="Enter blog headline..."
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3.5 text-lg sm:text-xl font-serif font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                />

                            </div>

                            {/* SLUG */}

                            <div>

                                <div className="flex justify-between items-center mb-2">

                                    <label className="text-xs font-bold text-slate-800">
                                        Permanent URL Slug
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleCopySlug}
                                        disabled={!slug}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Copy
                                    </button>

                                </div>

                                <div className="relative flex items-center">

                                    <span className="absolute left-4 text-xs text-slate-400 pointer-events-none">
                                        /blog/
                                    </span>

                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={handleSlugChange}
                                        placeholder="enter-your-blog-slug"
                                        className="w-full bg-[#F4F6FA] border-0 rounded-xl pl-14 pr-4 py-3 text-xs font-medium text-indigo-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                    />

                                </div>

                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Enter the permanent URL slug manually.
                                </p>

                            </div>

                            {/* COVER IMAGE */}

                            <div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">

                                    <label className="text-xs font-bold text-slate-800">
                                        Featured Cover Image
                                    </label>

                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Recommended ratio 16:9 (1920×1080px)
                                    </span>

                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {coverImage ? (

                                    <div className="relative rounded-2xl overflow-hidden border border-slate-100">

                                        <img
                                            src={coverImage.url}
                                            alt="Cover Preview"
                                            className="w-full h-56 sm:h-80 object-cover"
                                        />

                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                                            <div className="flex items-center gap-2 text-white/90 text-xs font-medium truncate">

                                                <FiImage
                                                    size={16}
                                                    className="shrink-0"
                                                />

                                                <span className="truncate">
                                                    {coverImage.name}
                                                </span>

                                                <span className="text-white/60 shrink-0">
                                                    {coverImage.size}
                                                </span>

                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto">

                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                                                >
                                                    <FiRefreshCw size={12} />

                                                    <span>
                                                        Change
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={removeCoverImage}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                                                >
                                                    <FiTrash2 size={12} />

                                                    <span>
                                                        Remove
                                                    </span>
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div
                                        onClick={triggerFileInput}
                                        className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all bg-[#F8F9FD]"
                                    >

                                        <FiUploadCloud
                                            size={32}
                                            className="text-slate-400 mb-2"
                                        />

                                        <p className="text-xs font-semibold text-slate-700">
                                            Click or Drag & Drop to Upload Cover Image
                                        </p>

                                        <p className="text-[11px] text-slate-400 mt-1">
                                            PNG, JPG, WebP up to 10MB
                                        </p>

                                    </div>

                                )}

                            </div>

                            {/* EXCERPT */}

                            <div>

                                <div className="flex justify-between items-center mb-2">

                                    <label className="text-xs font-bold text-slate-800">
                                        Short Excerpt / Teaser
                                    </label>

                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Rendered on card views & RSS
                                    </span>

                                </div>

                                <textarea
                                    rows={3}
                                    value={excerpt}
                                    onChange={(e) =>
                                        setExcerpt(e.target.value)
                                    }
                                    placeholder="Write a brief intro..."
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl p-4 text-xs font-medium text-slate-800 leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                                />

                            </div>

                        </div>

                        {/* ====================================================
                            ARTICLE BODY
                        ==================================================== */}

                        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                                <div>

                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        02. ARTICLE BODY
                                    </p>

                                    <h2 className="text-2xl font-serif font-bold text-slate-900">
                                        Manuscript Editor
                                    </h2>

                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">

                                    <span className="flex items-center gap-1.5">

                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                                        {getWordCount(editorContent)} words

                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>
                                        {Math.max(
                                            1,
                                            Math.ceil(
                                                getWordCount(editorContent) / 200
                                            )
                                        )} min read
                                    </span>

                                </div>

                            </div>

                            {/* INLINE IMAGE UPLOAD */}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EEF2FF]/60 border border-indigo-100/70 rounded-xl p-3">

                                <div className="flex items-center gap-2.5">

                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">

                                        <FiImage size={16} />

                                    </div>

                                    <div>

                                        <p className="text-xs font-bold text-slate-700">
                                            Inline Image
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            Upload an image and insert it at the cursor
                                        </p>

                                    </div>

                                </div>

                                <input
                                    type="file"
                                    ref={inlineImageInputRef}
                                    onChange={handleInlineImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={triggerInlineImageInput}
                                    disabled={uploadingInline}
                                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-white border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {uploadingInline ? (

                                        <>
                                            <FiRefreshCw
                                                size={13}
                                                className="animate-spin"
                                            />

                                            <span>
                                                Uploading...
                                            </span>
                                        </>

                                    ) : (

                                        <>
                                            <FiUploadCloud
                                                size={13}
                                            />

                                            <span>
                                                Upload Inline Image
                                            </span>
                                        </>

                                    )}

                                </button>

                            </div>

                            {/* QUILL */}

                            <div className="custom-quill-wrapper">

                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={editorContent}
                                    onChange={setEditorContent}
                                    modules={modules}
                                    placeholder="Click here to continue writing..."
                                    className="border-0"
                                />

                            </div>

                        </div>

                    </div>

                    {/* ====================================================
                        RIGHT SIDEBAR
                    ==================================================== */}

                    <div className="lg:col-span-4 space-y-6">

                        {/* SETTINGS */}

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-6">

                            <div className="flex justify-between items-center">

                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    SETTINGS & TAXONOMY
                                </span>

                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600">

                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>

                                    Draft State

                                </span>

                            </div>

                            {/* CATEGORY - MANUAL INPUT */}

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

                            {/* TAGS */}

                            <div>

                                <div className="flex justify-between items-center mb-2">

                                    <label className="text-xs font-bold text-slate-800">
                                        Article Tags
                                    </label>

                                    <span className="text-[11px] text-slate-400 font-medium">
                                        {tags.length} attached
                                    </span>

                                </div>

                                <div className="bg-[#F4F6FA] rounded-xl p-2.5 space-y-2">

                                    <div className="flex flex-wrap gap-1.5">

                                        {tags.map((tag) => (

                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                                            >

                                                {tag}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeTag(tag)
                                                    }
                                                    className="text-slate-400 cursor-pointer hover:text-slate-600"
                                                >
                                                    <FiX size={12} />
                                                </button>

                                            </span>

                                        ))}

                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Add a tag..."
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={handleTagKeyDown}
                                        className="w-full bg-transparent border-0 px-1 py-1 text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                                    />

                                </div>

                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Press Enter or comma to create new tag
                                </p>

                            </div>

                            {/* AUTHOR - MANUAL INPUT */}

                            <div>

                                <label className="block text-xs font-bold text-slate-800 mb-2">
                                    Author Name
                                </label>

                                <input
                                    type="text"
                                    value={author.name}
                                    onChange={(e) =>
                                        handleAuthorChange(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter author name..."
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                />

                                <label className="block text-xs font-bold text-slate-800 mb-2 mt-4">
                                    Author Role
                                </label>

                                <input
                                    type="text"
                                    value={author.role}
                                    onChange={(e) =>
                                        handleAuthorChange(
                                            'role',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter author role..."
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                />

                                {/* <label className="block text-xs font-bold text-slate-800 mb-2 mt-4">
                                    Author Avatar URL
                                </label> */}

                                {/* <input
                                    type="text"
                                    value={author.avatar}
                                    onChange={(e) =>
                                        handleAuthorChange(
                                            'avatar',
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                />

                                {author.avatar && (
                                    <div className="mt-3 flex items-center gap-3">

                                        <img
                                            src={author.avatar}
                                            alt={author.name || 'Author'}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    'none';
                                            }}
                                        />

                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                {author.name || 'Author'}
                                            </p>

                                            <p className="text-[10px] text-slate-400">
                                                {author.role || 'Author Role'}
                                            </p>
                                        </div>

                                    </div>
                                )} */}

                            </div>

                            {/* PUBLICATION */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-2">
                                    Publication date
                                </label>

                                <div className="relative">
                                    <div className="flex items-center gap-2 bg-[#F4F6FA] rounded-xl p-3">
                                        <FiCalendar
                                            size={14}
                                            className="text-indigo-600 shrink-0"
                                        />

                                        <input
                                            type="date"
                                            value={publicationDate}
                                            onChange={(e) => setPublicationDate(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-700 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* SEO */}

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-5">

                            <div
                                onClick={() =>
                                    setSeoOpen(!seoOpen)
                                }
                                className="flex items-center justify-between cursor-pointer"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">

                                        <FiShare2 size={16} />

                                    </div>

                                    <div>

                                        <h3 className="text-xs font-bold text-slate-800">
                                            SEO Settings
                                        </h3>

                                        <p className="text-[11px] text-slate-400">
                                            Social cards & crawler optimization
                                        </p>

                                    </div>

                                </div>

                                <span
                                    className={`text - slate - 400 transition - transform ${seoOpen
                                        ? 'rotate-180'
                                        : ''
                                        } `}
                                >
                                    ▼
                                </span>

                            </div>

                            {seoOpen && (

                                <div className="space-y-4 pt-2 border-t border-slate-50">

                                    {/* META TITLE */}

                                    <div>

                                        <div className="flex justify-between items-center mb-1.5">

                                            <label className="text-xs font-bold text-slate-800">
                                                Meta Title
                                            </label>

                                            <span className="text-[11px] font-semibold text-emerald-600">
                                                {metaTitle.length} / 60 char
                                            </span>

                                        </div>

                                        <input
                                            type="text"
                                            maxLength={60}
                                            value={metaTitle}
                                            onChange={(e) =>
                                                setMetaTitle(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-[#F4F6FA] border-0 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                        />

                                    </div>

                                    {/* META DESCRIPTION */}

                                    <div>

                                        <div className="flex justify-between items-center mb-1.5">

                                            <label className="text-xs font-bold text-slate-800">
                                                Meta Description
                                            </label>

                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {metaDescription.length} / 160 char
                                            </span>

                                        </div>

                                        <textarea
                                            rows={3}
                                            maxLength={160}
                                            value={metaDescription}
                                            onChange={(e) =>
                                                setMetaDescription(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-[#F4F6FA] border-0 rounded-xl p-3 text-xs font-medium text-slate-700 leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                                        />

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                {/* ====================================================
                    ACTION FOOTER
                ==================================================== */}

                <div className="w-full bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-100 shadow-sm">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">

                        {/* AUTOSAVE */}

                        <div className="flex items-start sm:items-center gap-2 text-xs font-medium text-slate-500 min-w-0 w-full lg:w-auto">

                            <span className="w-2 h-2 mt-1 sm:mt-0 shrink-0 rounded-full bg-emerald-500 animate-pulse" />

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 leading-5">

                                <span className="font-semibold text-slate-700 whitespace-nowrap">
                                    Autosave enabled
                                </span>

                                <span className="text-slate-300 hidden sm:inline">
                                    ·
                                </span>

                                <span className="text-slate-500 wrap-break-word">
                                    Syncing to cloud repository
                                </span>

                            </div>

                        </div>

                        {/* BUTTONS */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-stretch gap-2.5 sm:gap-3 w-full lg:w-auto">

                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/dashboard')
                                }
                                className="w-full lg:w-auto min-h-10.5 px-4 sm:px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                            >
                                Cancel
                            </button>

                            {/* SAVE DRAFT */}

                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={
                                    saving ||
                                    publishing
                                }
                                className="w-full lg:w-auto min-h-10.5 flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-[#EEF2FF] text-indigo-900 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                            >

                                {saving ? (

                                    <>
                                        <FiRefreshCw
                                            size={14}
                                            className="animate-spin"
                                        />

                                        <span>
                                            Saving...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <FiSave
                                            size={14}
                                            className="shrink-0"
                                        />

                                        <span>
                                            Save Draft
                                        </span>
                                    </>

                                )}

                            </button>

                            {/* PUBLISH */}

                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={
                                    publishing ||
                                    saving
                                }
                                className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto min-h-10.5 flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                            >

                                {publishing ? (

                                    <>
                                        <FiRefreshCw
                                            size={14}
                                            className="animate-spin"
                                        />

                                        <span>
                                            Publishing...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <FiCheckCircle
                                            size={14}
                                            className="shrink-0"
                                        />

                                        <span>
                                            Publish Blog
                                        </span>
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {/* ========================================================
                QUILL STYLES
            ======================================================== */}

            <style>{`

    .custom - quill - wrapper.ql - toolbar.ql - snow {
    border: none!important;
    background - color: #EEF2FF;
    border - radius: 14px;
    padding: 8px 12px;
    margin - bottom: 24px;
    display: flex;
    flex - wrap: wrap;
    align - items: center;
    gap: 4px;
}

                .custom - quill - wrapper.ql - container.ql - snow {
    border: none!important;
    font - family: inherit;
}

                .custom - quill - wrapper.ql - editor {
    padding: 0!important;
    min - height: 250px;
    color: #334155;
    font - size: 0.95rem;
    line - height: 1.8;
}

                .custom - quill - wrapper.ql - editor h2 {
    font - family: ui - serif, Georgia, Cambria,
        "Times New Roman", Times, serif;
    font - size: 1.5rem;
    font - weight: 700;
    color: #0f172a;
    margin - top: 1.5rem;
    margin - bottom: 0.75rem;
}

                .custom - quill - wrapper.ql - editor blockquote {
    border - left: 4px solid #6366f1!important;
    background - color: #EEF2FF;
    padding: 1.25rem 1.5rem!important;
    border - radius: 0 16px 16px 0;
    margin: 1.5rem 0!important;
    font - style: italic;
    color: #334155;
}

                .custom - quill - wrapper.ql - editor img {
    max - width: 100 %;
    height: auto;
    border - radius: 12px;
    margin: 16px 0;
}

                .custom - quill - wrapper.ql - editor ul,
                .custom - quill - wrapper.ql - editor ol {
    padding - left: 1.5rem;
}

                .custom - quill - wrapper.ql - editor p {
    margin - bottom: 0.75rem;
}

@media(min - width: 640px) {
                    .custom - quill - wrapper.ql - editor {
        min - height: 300px;
    }
}

`}</style>

        </div>
    );
};

export default CreateBlogPage;

