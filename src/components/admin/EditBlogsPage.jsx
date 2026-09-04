import React, { useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FiSearch, FiSave, FiX, FiRefreshCw, FiTrash2, FiChevronDown, FiPlus, FiLock, FiArrowLeft, FiSliders, FiCalendar, FiCheckCircle, FiMaximize2 } from 'react-icons/fi';

export default function EditBlogsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const blogId = searchParams.get('edit');
    const quillRef = useRef(null);


    // --- ACCESS GUARD ---
    if (!blogId) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 shadow-sm font-sans">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <FiLock size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">No Article Selected to Edit</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    The Edit tab is restricted. Please select a post from the Dashboard to open the editor.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                    <FiArrowLeft size={16} />
                    <span>Go to Dashboard</span>
                </button>
            </div>
        );
    }


    // --- STATE MANAGEMENT ---
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest First');

    const [title, setTitle] = useState('Designing Accessible Enterprise Dashboards in 2024');
    const [excerpt, setExcerpt] = useState('A deep dive into color contrast, keyboard navigation hierarchies, and assistive technology considerations when building complex SaaS interfaces.');
    const [slug, setSlug] = useState('designing-accessible-enterprise-dashboards');
    const [category, setCategory] = useState('Design Systems');
    const [tags, setTags] = useState(['Accessibility', 'WCAG 2.2', 'SaaS']);
    const [tagInput, setTagInput] = useState('');
    const [author] = useState('Elena Rostova');
    const [publishDate] = useState('May 12, 2024 • 09:45 AM');
    const [status] = useState('Published');
    const [featuredImage, setFeaturedImage] = useState('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80');
    const [toastMessage, setToastMessage] = useState(null);

    // Rich Text Editor Content State
    const [editorContent, setEditorContent] = useState(`
    <p>When enterprise software expands across thousands of global team members, design flaws in visual hierarchy and low keyboard fidelity don't just create slight frictions—they turn core administrative workflows into complete accessibility barriers.</p>
    <h2>Why Accessibility is Core to Modern B2B</h2>
    <p>Enterprise dashboards synthesize dense metrics, cascading tables, and interactive configuration drawers into high-pressure screens. Meeting WCAG 2.2 AAA guidelines requires treating accessible state management not as a final review checklist item, but as the foundational system logic.</p>
    <blockquote>"Accessible design in data platforms isn't just about high-contrast color tokens—it's about cognitive pacing and granting deterministic keyboard control across every state shift."</blockquote>
    <p>Key baseline architectural tenets implemented within our updated design system include:</p>
    <p><strong>Algorithmic contrast verification:</strong> Automated CI validation ensuring all analytical visualization glyphs sustain at least 4.5:1 against adaptive container surfaces.</p>
    <p><strong>Focus-trapping data drawers:</strong> Modal sheets dynamically constrain Tab cycles and restore previous active elements upon dismissal.</p>
    <p><strong>Audible live regions:</strong> Announcing real-time telemetry streaming updates through discrete <code>aria-live="polite"</code> channels.</p>
    <p>By prioritizing these primitives early, teams prevent expensive retrofits while empowering every operator to navigate mission-critical pipelines with surgical confidence.</p>
  `);

    // --- HANDLERS ---
    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFeaturedImage(URL.createObjectURL(file));
            triggerToast('Featured image updated');
        }
    };

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Custom Inline Image Handler for React Quill
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range ? range.index : 0, 'image', reader.result);
                    triggerToast('Inline image inserted');
                };
                reader.readAsDataURL(file);
            }
        };
    };

    // Quill Modules Configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: '#custom-quill-toolbar',
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'blockquote', 'code-block',
        'link', 'image'
    ];

    return (
        <div className="w-full space-y-6 pb-8 font-sans text-slate-700">

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
                    <FiCheckCircle className="text-emerald-400" size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* TOP HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">Edit Blogs</h1>
                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            31 Total
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-normal">
                        Manage, edit, preview, and organize all your blog posts in one place.
                    </p>
                </div>
            </div>

            {/* SEARCH AND SORT BAR */}
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-full">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blogs by title, tag, or excerpt..."
                        className="w-full bg-[#F8FAFC] text-xs font-medium text-slate-700 pl-10 pr-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>


            </div>

            {/* BREADCRUMB AND BAR ACTIONS */}

            <div className="w-full bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium mb-2.5 overflow-hidden">

                            <button
                                type="button"
                                className="hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
                                onClick={() => navigate("/dashboard")}
                            >
                                Blogs
                            </button>

                            <span className="shrink-0 text-slate-300">
                                ›
                            </span>

                            <span className="text-slate-600 truncate min-w-0 max-w-32.5 xs:max-w-[200px] sm:max-w-87.5 md:max-w-112.5 lg:max-w-137.5">
                                {title}
                            </span>

                            <span className="shrink-0 text-slate-300">
                                ›
                            </span>

                            <span className="text-[#4F46E5] font-semibold shrink-0">
                                Edit
                            </span>
                        </div>

        
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3">
                            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight wrap-break-word">
                                Edit Blog
                            </h2>

                            {/* Status */}

                            <div className="inline-flex items-center gap-1.5 bg-[#ECFDF5] text-[#10B981] px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border border-emerald-100 w-fit">

                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />

                                <span className="whitespace-nowrap">
                                    Status: {status}
                                </span>

                            </div>

                            {/* ID */}

                            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg w-fit max-w-full truncate">
                                ID: ART-9842
                            </span>
                        </div>
                    </div>

                    <div className="w-full xl:w-auto">

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:flex-nowrap items-stretch gap-2 sm:gap-2.5">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center justify-center gap-1.5 min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                            >
                                <FiX
                                    size={14}
                                    className="shrink-0"
                                />

                                <span>
                                    Cancel
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    triggerToast("Draft changes saved!")
                                }
                                className="flex items-center justify-center gap-1.5 min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                            >
                                <FiSave
                                    size={14}
                                    className="shrink-0"
                                />

                                <span>
                                    Save Changes
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    triggerToast(
                                        "Article updated successfully!"
                                    )
                                }
                                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 min-h-10 sm:min-h-11 px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 cursor-pointer whitespace-nowrap"
                            >
                                <FiRefreshCw
                                    size={14}
                                    className="shrink-0"
                                />
                                <span>
                                    Update Article
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-800">Article Title</label>
                                <span className="text-[11px] font-semibold text-slate-400">{title.length} / 100</span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#F3F4F6]/70 text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* EXCERPT */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-800">Short Description / Excerpt</label>
                                <span className="text-[11px] font-semibold text-slate-400">{excerpt.length} / 240</span>
                            </div>
                            <textarea
                                rows={3}
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                className="w-full bg-[#F3F4F6]/70 text-slate-700 text-xs font-medium rounded-xl p-3.5 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
                            />
                        </div>

                        {/* FEATURED VISUAL */}
                        <div>
                            <label className="text-xs font-bold text-slate-800 block mb-2">Featured Visual</label>
                            <div className="relative rounded-2xl overflow-hidden border border-slate-100 group h-64 sm:h-72 bg-slate-900">
                                {featuredImage ? (
                                    <img
                                        src={featuredImage}
                                        alt="Featured visual preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                        No visual selected
                                    </div>
                                )}

                                {/* OVERLAY FOOTER ON IMAGE */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="text-white font-mono text-[11px] drop-shadow-sm">
                                        <p className="font-semibold text-white/95">cover-accessible-dashboards-2024.webp</p>
                                        <p className="text-white/70 text-[10px]">1920 × 820 px • 328 KB</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md transition-all shadow-xs flex items-center gap-1.5">
                                            <FiRefreshCw size={13} />
                                            <span>Replace Image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setFeaturedImage('')}
                                            className="bg-[#FEE2E2] hover:bg-rose-200 text-[#EF4444] text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <FiTrash2 size={13} />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RICH TEXT EDITOR CARD (REACT-QUILL) */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">

                        {/* CUSTOM REACT-QUILL TOOLBAR */}
                        <div id="custom-quill-toolbar" className="px-5 py-3 border-b border-slate-100 bg-[#FAFBFD] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1">

                                {/* HEADINGS */}
                                <select className="ql-header" defaultValue="">
                                    <option value="1">H1</option>
                                    <option value="2">H2</option>
                                    <option value="3">H3</option>
                                    <option value="">Normal</option>
                                </select>

                                <div className="h-4 w-px bg-slate-200 mx-1" />

                                {/* TEXT FORMATTING */}
                                <button className="ql-bold" />
                                <button className="ql-italic" />
                                <button className="ql-underline" />
                                <button className="ql-strike" />

                                <div className="h-4 w-px bg-slate-200 mx-1" />

                                {/* LISTS & QUOTES */}
                                <button className="ql-list" value="bullet" />
                                <button className="ql-list" value="ordered" />
                                <button className="ql-blockquote" />
                                <button className="ql-code-block" />

                                <div className="h-4 w-px bg-slate-200 mx-1" />

                                {/* INSERTS & MEDIA (WITH INLINE IMAGE BUTTON) */}
                                <button className="ql-link" />
                                <button className="ql-image" title="Insert Inline Image" />

                            </div>

                            {/* STATS & FULLSCREEN */}
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                <span>1,248 words</span>
                                <button type="button" className="text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                                    <FiMaximize2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* REACT QUILL EDITOR CONTAINER */}
                        <div className="p-2 quill-custom-styles">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={editorContent}
                                onChange={setEditorContent}
                                modules={modules}
                                formats={formats}
                            />
                        </div>

                        {/* FOOTER EDITOR STATUS BAR */}
                        <div className="px-8 py-3 bg-[#FAFBFD] border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-semibold text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-emerald-600 font-bold">Auto-saved at 14:32 PM</span>
                                <span className="text-slate-300">•</span>
                                <span>Reading time: ~5 mins</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>UTF-8</span>
                                <span className="text-slate-300">•</span>
                                <span>Markdown Enabled</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* RIGHT PUBLISHING DETAILS PANEL (4 COLS) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-1">
                        <h3 className="text-sm font-extrabold text-slate-900">Publishing Details</h3>
                        <FiSliders className="text-slate-400" size={16} />
                    </div>

                    {/* AUTHOR SELECTOR */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Assigned Author</label>
                        <div className="flex items-center justify-between bg-[#F3F4F6]/70 rounded-2xl p-2.5">
                            <div className="flex items-center gap-3">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                    alt="Elena Rostova"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{author}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Editor in Chief</p>
                                </div>
                            </div>
                            <FiChevronDown className="text-slate-400 mr-1" size={16} />
                        </div>
                    </div>

                    {/* PUBLISHED DATE */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Published Date</label>
                        <div className="flex items-center gap-2.5 bg-[#F3F4F6]/70 rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-700">
                            <FiCalendar className="text-slate-400 shrink-0" size={15} />
                            <span>{publishDate}</span>
                        </div>
                    </div>

                    {/* URL SLUG */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">URL Slug</label>
                        <div className="flex items-center bg-[#F3F4F6]/70 rounded-2xl px-3 py-2.5">
                            <span className="text-[11px] font-semibold text-slate-400 select-none pr-1">/blog/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* PRIMARY CATEGORY */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Primary Category</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full appearance-none bg-[#F3F4F6]/70 rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option>Design Systems</option>
                                <option>Engineering</option>
                                <option>Product Management</option>
                            </select>
                            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                        </div>
                    </div>

                    {/* TAXONOMY & TAGS */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Taxonomy & Tags</label>
                        <div className="bg-[#F3F4F6]/70 rounded-2xl p-3 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-white text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-slate-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-1 pt-1">
                                <FiPlus className="text-slate-400" size={14} />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add tag"
                                    className="w-full bg-transparent text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* REACT-QUILL CUSTOM OVERRIDE STYLES */}
            <style>{`
        .quill-custom-styles .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
        }
        .quill-custom-styles .ql-editor {
          min-height: 380px;
          padding: 1.5rem 2rem;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #334155;
        }
        .quill-custom-styles .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .quill-custom-styles .ql-editor blockquote {
          background-color: #f5f7ff;
          border-left: none;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          color: #334155;
          font-style: italic;
          margin: 1.25rem 0;
        }
        .quill-custom-styles .ql-editor code {
          background-color: #eef2ff;
          color: #4f46e5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-weight: 600;
        }
        #custom-quill-toolbar button.ql-active {
          color: #4f46e5 !important;
          background-color: #eef2ff !important;
          border-radius: 0.5rem;
        }
        #custom-quill-toolbar .ql-picker-label.ql-active {
          color: #4f46e5 !important;
        }
      `}</style>
        </div>
    );
}