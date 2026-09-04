import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiArrowLeft, FiCopy, FiImage, FiUploadCloud, FiTrash2, FiRefreshCw, FiX, FiCalendar, FiChevronDown, FiShare2, FiSave, FiCheckCircle, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CreateBlogPage = () => {
    const navigate = useNavigate();
    const [headline, setHeadline] = useState('10 Essential UI/UX Design Principles for Scala');
    const [slug, setSlug] = useState('10-essential-ui-ux-design-principles');
    const [isSlugCustom, setIsSlugCustom] = useState(false);
    const [excerpt, setExcerpt] = useState(
        'A comprehensive breakdown of foundational digital product rules—from visual rhythm and ocular fatigue reduction to progressive disclosure and ergonomic layout design.'
    );
    const [tags, setTags] = useState(['UI/UX', 'Design', 'Figma']);
    const [tagInput, setTagInput] = useState('');
    const [metaTitle, setMetaTitle] = useState('10 Essential UI/UX Design Principles | Blog');
    const [metaDescription, setMetaDescription] = useState(
        'Learn the principles behind creating simple, human-centered and user-friendly digital products.'
    );

    const [coverImage, setCoverImage] = useState({
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
        name: 'cover_hero_retina_v2.png',
        size: '1.4 MB'
    });

    const [category, setCategory] = useState('Design & UX');
    const [author, setAuthor] = useState({
        name: 'Sophia Turner (You)',
        role: 'Chief Editor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    });

    const [seoOpen, setSeoOpen] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isAuthorOpen, setIsAuthorOpen] = useState(false);
    const [notification, setNotification] = useState('');

    const fileInputRef = useRef(null);

    const [editorContent, setEditorContent] = useState(`
    <h2>The Foundation of Purposeful Design</h2>
    <p>Great user interfaces are neither artistic accidents nor purely mechanical spreadsheets. At scale, an impactful design system operates as a language—establishing intentional spatial cadences, frictionless eye movements, and unmistakable predictability. When designers respect cognitive limits, user trust naturally deepens.</p>
    <blockquote>
      <p>"Simplicity is not the lack of clutter, that's a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object and its components."</p>
      <p>— DIETER RAMS, TEN PRINCIPLES FOR GOOD DESIGN</p>
    </blockquote>
    <h2>1. Radical Visual Hierarchy</h2>
    <p>The eye reads in structured patterns: predominantly the F-pattern for data-heavy applications and the Z-pattern for editorial canvases. When every element shouts through heavy borders or over-saturated badges, nothing is heard. High-contrast typography paired with tranquil whitespace acts as an effortless trail of breadcrumbs for your users.</p>
    
    <div class="embedded-figure-card">
      <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" alt="Spatial Harmonic Alignment" />
      <div class="figure-content">
        <span class="figure-title">FIG 1. SPATIAL HARMONIC ALIGNMENT</span>
        <p>Standardizing on a strict 8-point typographic baseline completely resolves layout drift across multi-screen editorial viewports.</p>
      </div>
    </div>
  `);

    // Helper Functions
    const getWordCount = (text) => {
        const plainText = text.replace(/<[^>]*>/g, ' ').trim();
        return plainText ? plainText.split(/\s+/).length : 0;
    };

    const handleHeadlineChange = (e) => {
        const val = e.target.value;
        setHeadline(val);
        if (!isSlugCustom) {
            const autoSlug = val
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setSlug(autoSlug);
        }
    };

    const handleSlugChange = (e) => {
        setIsSlugCustom(true);
        setSlug(e.target.value);
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const cleanTag = tagInput.trim();
            if (!tags.includes(cleanTag)) {
                setTags([...tags, cleanTag]);
            }
            setTagInput('');
        }
    };

    const handleCopySlug = () => {
        navigator.clipboard.writeText(`yoursite.com/blog/${slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // File Upload Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            const url = URL.createObjectURL(file);
            setCoverImage({
                url,
                name: file.name,
                size: sizeInMB
            });
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeCoverImage = () => {
        setCoverImage(null);
    };

    const triggerNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSaveDraft = () => {
        triggerNotification('Draft saved successfully!');
    };

    const handlePublish = () => {
        triggerNotification('Blog published live!');
    };

    const modules = {
        toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const authorOptions = [
        {
            name: 'Sophia Turner (You)',
            role: 'Chief Editor',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
        },
        {
            name: 'Marcus Chen',
            role: 'Senior Technical Writer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
        }
    ];

    return (
        <div className="bg-[#F8F9FD] font-sans text-slate-700 ">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
                    <FiCheckCircle className="text-emerald-400" size={16} />
                    <span>{notification}</span>
                </div>
            )}

            <div className="w-full space-y-4">

                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-1">
                            <span>EDITORIAL ENGINE</span>
                            <span>/</span>
                            <span>NEW ENTRY</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Create New Blog</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Draft and publish a new post to your publication.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                    >
                        <FiArrowLeft size={14} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* Left Column - Main Body (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Section 01: Metadata */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                01. BASIC METADATA
                            </p>

                            {/* Headline */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-800">Blog Headline</label>
                                    <span className="text-xs text-slate-400 font-medium">{headline.length} / 100</span>
                                </div>
                                <input
                                    type="text"
                                    maxLength={100}
                                    value={headline}
                                    onChange={handleHeadlineChange}
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3.5 text-lg sm:text-xl font-serif font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-2">
                                    Permanent URL Slug
                                </label>
                                <div className="relative flex items-start">
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={handleSlugChange}
                                        className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4  sm:pr-10 py-3 text-xs font-medium text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                    />

                                </div>
                            </div>

                            {/* Featured Cover Image */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                                    <label className="text-xs font-bold text-slate-800">Featured Cover Image</label>
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

                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/70 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-white/90 text-xs font-medium truncate">
                                                <FiImage size={16} className="shrink-0" />
                                                <span className="truncate">{coverImage.name}</span>
                                                <span className="text-white/60 shrink-0">{coverImage.size}</span>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                                                >
                                                    <FiRefreshCw size={12} />
                                                    <span>Change</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={removeCoverImage}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                                                >
                                                    <FiTrash2 size={12} />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={triggerFileInput}
                                        className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all bg-[#F8F9FD]"
                                    >
                                        <FiUploadCloud size={32} className="text-slate-400 mb-2" />
                                        <p className="text-xs font-semibold text-slate-700">Click or Drag & Drop to Upload Cover Image</p>
                                        <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</p>
                                    </div>
                                )}

                                {/* <div className="mt-3 p-4 bg-[#EEF2FF]/60 border border-indigo-100/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                                            <FiUploadCloud size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-700">
                                                Drag and drop replacement or click to browse
                                            </p>
                                            <p className="text-[11px] text-slate-400">PNG, JPG, WebP up to 10MB</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
                                    >
                                        Select File
                                    </button>
                                </div> */}
                            </div>

                            {/* Excerpt */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-800">Short Excerpt / Teaser</label>
                                    <span className="text-[11px] text-slate-400 font-medium">Rendered on card views & RSS</span>
                                </div>
                                <textarea
                                    rows={3}
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Write a brief intro..."
                                    className="w-full bg-[#F4F6FA] border-0 rounded-xl p-4 text-xs font-medium text-slate-800 leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                                />
                            </div>

                        </div>

                        {/* Section 02: Article Body with React Quill */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        02. ARTICLE BODY
                                    </p>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900">Manuscript Editor</h2>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {getWordCount(editorContent)} words
                                    </span>
                                    <span>•</span>
                                    <span>{Math.ceil(getWordCount(editorContent) / 200)} min read</span>
                                </div>
                            </div>

                            {/* Custom-Styled React Quill Container */}
                            <div className="custom-quill-wrapper">
                                <ReactQuill
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

                    {/* Right Column - Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Settings Card */}
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

                            {/* Primary Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-2">Primary Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#F4F6FA] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                                    >
                                        <option value="Design & UX">Design & UX</option>
                                        <option value="Development">Development</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                    <FiChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none " />
                                </div>
                            </div>

                            {/* Article Tags */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-800">Article Tags</label>
                                    <span className="text-[11px] text-slate-400 font-medium">{tags.length} attached</span>
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
                                                    onClick={() => removeTag(tag)}
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
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        className="w-full bg-transparent border-0 px-1 py-1 text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Press Enter or comma to create new tag
                                </p>
                            </div>

                            {/* Assign Author */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-800 mb-2">Assign Author</label>
                                <div
                                    onClick={() => setIsAuthorOpen(!isAuthorOpen)}
                                    className="flex items-center justify-between bg-[#F4F6FA] rounded-xl p-2.5 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={author.avatar}
                                            alt={author.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{author.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{author.role}</p>
                                        </div>
                                    </div>
                                    <FiChevronDown size={16} className={`text-slate-400 transition-transform ${isAuthorOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isAuthorOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-10 overflow-hidden">
                                        {authorOptions.map((opt) => (
                                            <div
                                                key={opt.name}
                                                onClick={() => {
                                                    setAuthor(opt);
                                                    setIsAuthorOpen(false);
                                                }}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <img src={opt.avatar} alt={opt.name} className="w-8 h-8 rounded-full object-cover" />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{opt.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{opt.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Publication Schedule */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-2">Publication Schedule</label>
                                <div className="flex items-center justify-between bg-[#F4F6FA] rounded-xl p-3 text-xs font-semibold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar size={14} className="text-indigo-600" />
                                        <span>Sep 04, 2026</span>
                                    </div>
                                    <span className="text-slate-400 font-normal">09:00 AM EDT</span>
                                </div>
                            </div>

                        </div>

                        {/* SEO Settings Card */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-5">
                            <div
                                onClick={() => setSeoOpen(!seoOpen)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <FiShare2 size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-800">SEO Settings</h3>
                                        <p className="text-[11px] text-slate-400">Social cards & crawler optimization</p>
                                    </div>
                                </div>
                                <FiChevronDown size={16} className={`text-slate-400 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {seoOpen && (
                                <div className="space-y-4 pt-2 border-t border-slate-50">
                                    {/* Meta Title */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-slate-800">Meta Title</label>
                                            <span className="text-[11px] font-semibold text-emerald-600">
                                                {metaTitle.length} / 60 char
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                            className="w-full bg-[#F4F6FA] border-0 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                        />
                                    </div>

                                    {/* Meta Description */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-slate-800">Meta Description</label>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {metaDescription.length} / 160 char
                                            </span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            value={metaDescription}
                                            onChange={(e) => setMetaDescription(e.target.value)}
                                            className="w-full bg-[#F4F6FA] border-0 rounded-xl p-3 text-xs font-medium text-slate-700 leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>

                </div>

                {/* In-Flow Action Footer Bar */}
               
                <div className="w-full bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">

                        {/* =========================
            AUTOSAVE STATUS
        ========================== */}
                        <div className="flex items-start sm:items-center gap-2 text-xs font-medium text-slate-500 min-w-0 w-full lg:w-auto">

                            {/* Status Dot */}
                            <span className="w-2 h-2 mt-1 sm:mt-0 shrink-0 rounded-full bg-emerald-500 animate-pulse" />

                            {/* Status Content */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 leading-5">

                                <span className="font-semibold text-slate-700 whitespace-nowrap">
                                    Autosaved 2m ago
                                </span>

                                <span className="text-slate-300 hidden sm:inline">
                                    ·
                                </span>

                                <span className="text-slate-500 wrap-break-word">
                                    Syncing to cloud repository
                                </span>

                            </div>
                        </div>


                        {/* =========================
            ACTION BUTTONS
        ========================== */}
                        <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:flex
            lg:flex-row
            items-stretch
            gap-2.5
            sm:gap-3
            w-full
            lg:w-auto
        ">

                            {/* Cancel */}
                            <button
                                type="button"
                                className="
                    w-full
                    lg:w-auto
                    min-h-10.5
                    px-4
                    sm:px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-slate-600
                    hover:text-slate-800
                    hover:bg-slate-100
                    border
                    border-transparent
                    hover:border-slate-200
                    rounded-xl
                    transition-all
                    duration-200
                    cursor-pointer
                    whitespace-nowrap
                "
                            >
                                Cancel
                            </button>


                            {/* Save Draft */}
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="
                    w-full
                    lg:w-auto
                    min-h-10.5
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    sm:px-6
                    py-2.5
                    bg-[#EEF2FF]
                    text-indigo-900
                    hover:bg-indigo-100
                    border
                    border-indigo-100
                    hover:border-indigo-200
                    rounded-xl
                    text-xs
                    font-bold
                    transition-all
                    duration-200
                    cursor-pointer
                    whitespace-nowrap
                "
                            >
                                <FiSave size={14} className="shrink-0" />
                                <span>Save Draft</span>
                            </button>


                            {/* Publish */}
                            <button
                                type="button"
                                onClick={handlePublish}
                                className="
                    w-full
                    sm:col-span-2
                    lg:col-span-1
                    lg:w-auto
                    min-h-10.5
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    sm:px-7
                    py-2.5
                    bg-indigo-600
                    hover:bg-indigo-700
                    active:bg-indigo-800
                    text-white
                    rounded-xl
                    text-xs
                    font-bold
                    shadow-md
                    shadow-indigo-200
                    hover:shadow-lg
                    transition-all
                    duration-200
                    cursor-pointer
                    whitespace-nowrap
                "
                            >
                                <FiCheckCircle size={14} className="shrink-0" />
                                <span>Publish Blog</span>
                            </button>

                        </div>
                    </div>
                </div>
               


            </div>

            {/* Custom Quill Component Styles */}
            <style>{`
        .custom-quill-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          background-color: #EEF2FF;
          border-radius: 14px;
          padding: 8px 12px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
        }

        .custom-quill-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
        }

        .custom-quill-wrapper .ql-editor {
          padding: 0 !important;
          min-height: 250px;
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.8;
        }

        .custom-quill-wrapper .ql-editor h2 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .custom-quill-wrapper .ql-editor blockquote {
          border-left: 4px solid #6366f1 !important;
          background-color: #EEF2FF;
          padding: 1.25rem 1.5rem !important;
          border-radius: 0 16px 16px 0;
          margin: 1.5rem 0 !important;
          font-style: italic;
          color: #334155;
        }

        .custom-quill-wrapper .ql-editor blockquote p:last-child {
          font-style: normal;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-top: 0.5rem;
          text-transform: uppercase;
        }

        .custom-quill-wrapper .ql-editor .embedded-figure-card {
          background-color: #EEF4FF;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 24px 0;
        }

        @media (min-width: 640px) {
          .custom-quill-wrapper .ql-editor .embedded-figure-card {
            flex-direction: row;
            align-items: center;
          }
        }

        .custom-quill-wrapper .ql-editor .embedded-figure-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 12px;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .custom-quill-wrapper .ql-editor .embedded-figure-card img {
            width: 200px;
            height: 120px;
          }
        }

        .custom-quill-wrapper .ql-editor .embedded-figure-card .figure-content .figure-title {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #4F46E5;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .custom-quill-wrapper .ql-editor .embedded-figure-card .figure-content p {
          font-size: 0.8rem;
          line-height: 1.5;
          color: #475569;
          margin: 0;
        }
      `}</style>
        </div>
    );
};

export default CreateBlogPage;