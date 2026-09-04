import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FiEye, FiArrowLeft, FiTrash2, FiSend, FiClock, FiBookmark, FiShare2, FiCheckCircle, FiTag, FiEdit3, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';

export default function PreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const blogId = searchParams.get('id') || 'art-2026-09x';
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isFromDashboard = location.state?.fromDashboard === true;
    const isFromDraft = location.state?.fromDraft === true;
    const passedArticle = location.state?.articleData;

    const article = {
        id: blogId,
        category: passedArticle?.category || 'UI/UX DESIGN',
        revision: passedArticle?.revision || 'Draft Revision #4',
        title: passedArticle?.title || '10 Essential UI/UX Design Principles for 2026',
        subtitle: passedArticle?.subtitle || 'Learn the principles behind creating simple, human-centered, and user-friendly digital products that stand the test of time.',
        content: passedArticle?.content || null,
        author: {
            name: passedArticle?.author?.name || 'Sophia Turner',
            role: passedArticle?.author?.role || 'Chief Editor',
            avatar: passedArticle?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        },
        publishDate: passedArticle?.publishDate || 'Published Sep 04, 2026',
        readTime: passedArticle?.readTime || '6 min read',
        featuredImage: passedArticle?.featuredImage || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80',
        imageCaption: passedArticle?.imageCaption || 'Figure 1.0 — Kinetic calm and spatial balance in contemporary interfaces.',
        imageCredit: passedArticle?.imageCredit || 'Shot by Editorial Studio',
        tags: passedArticle?.tags || ['#UIUX', '#DesignSystems', '#ProductDesign', '#Figma', '#Prototyping']
    };

    const handlePublish = () => {
        navigate('/dashboard');
    };


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleConfirmTrash = () => {
        setIsConfirmOpen(false);
        setToastMessage('Draft moved to trash successfully');
        setShowToast(true);
        navigate('/dashboard');
    };


    const handleEdit = () => {
        navigate(`/blogs?edit=${article.id}`, {
            state: {
                articleData: article,
                fromDashboard: true
            }
        });
    };




    const hasPreviewAccess =
        isFromDashboard ||
        isFromDraft ||
        Boolean(passedArticle) ||
        searchParams.get('draft') === 'true';


    // ACCESS BLOCKED FALLBACK UI
    if (!hasPreviewAccess) {
        return (
            <div className="bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                        <FiAlertTriangle className="text-2xl sm:text-3xl" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Access Restricted</h2>
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

    return (
        <div className=" bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
            {/* STICKY TOP HEADER */}
            <header className=" bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-2xl">
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
                                            Draft
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
                                    onClick={() => setIsConfirmOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                                >
                                    <FiTrash2 size={14} />
                                    <span>Move to Trash</span>
                                </button>

                                {/* Confirmation Modal */}
                                {isConfirmOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-slate-900">Move to Trash?</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    Are you sure you want to move this draft to trash?
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsConfirmOpen(false)}
                                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmTrash}
                                                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all"
                                                >
                                                    Move to Trash
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Toast Notification */}
                                {showToast && (
                                    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 z-50">
                                        <div className="flex items-center gap-2.5">
                                            <FiCheckCircle size={18} className="text-emerald-500 shrink-0" />
                                            <span className="text-xs font-semibold text-slate-700">
                                                {toastMessage}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowToast(false)}
                                            className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                )}

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
                                onClick={() => setIsConfirmOpen(true)}
                                className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                            >
                                <FiTrash2 size={14} />
                                <span>Move to Trash</span>
                            </button>

                            {/* Confirmation Modal */}
                            {isConfirmOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-slate-900">Move to Trash?</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Are you sure you want to move this draft to trash?
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsConfirmOpen(false)}
                                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleConfirmTrash}
                                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all"
                                            >
                                                Move to Trash
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Toast Notification */}
                            {showToast && (
                                <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 z-50">
                                    <div className="flex items-center gap-2.5">
                                        <FiCheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-700">
                                            {toastMessage}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowToast(false)}
                                        className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            )}

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

            {/* MAIN ARTICLE BODY */}
            <main className="w-full py-3">
                <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 sm:space-y-8">

                    {/* META BADGES */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-indigo-50 text-[#4F46E5] font-extrabold px-3 py-1 rounded-lg tracking-wider uppercase">
                            {article.category}
                        </span>
                        <span className="text-slate-400 font-medium">
                            {article.revision}
                        </span>
                    </div>

                    {/* HEADINGS */}
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] sm:leading-[1.15] tracking-tight">
                            {article.title}
                        </h1>
                        <p className="text-sm sm:text-lg text-slate-500 font-normal leading-relaxed">
                            {article.subtitle}
                        </p>
                    </div>

                    {/* AUTHOR BANNER */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-slate-900 truncate">{article.author.name}</span>
                                    <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {article.author.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
                                    <span className="truncate">{article.publishDate}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 shrink-0">
                                        <FiClock size={12} />
                                        {article.readTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex items-center gap-1 text-slate-400 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                className="p-2 hover:bg-white hover:text-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                                title="Bookmark"
                            >
                                <FiBookmark size={16} />
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-white hover:text-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                                title="Share"
                            >
                                <FiShare2 size={16} />
                            </button>
                        </div> */}
                    </div>

                    {/* FEATURED IMAGE */}
                    {article.featuredImage && (
                        <figure className="space-y-2 sm:space-y-3 pt-2">
                            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-xs max-h-60 sm:max-h-96 lg:max-h-120 bg-slate-900">
                                <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 italic px-1 gap-1">
                                <span>{article.imageCaption}</span>
                                <span className="not-italic font-medium text-slate-400 shrink-0">{article.imageCredit}</span>
                            </figcaption>
                        </figure>
                    )}

                    {/* CONTENT AREA */}
                    <div className="pt-2 text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg space-y-6">
                        {article.content ? (
                            <div
                                className="prose prose-slate max-w-none prose-sm sm:prose-base lg:prose-lg"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        ) : (
                            <>
                                <p className="first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:mr-3 first-letter:text-slate-900 first-letter:leading-none">
                                    In an era where software interfaces are inundated with hyperactive micro-animations and ubiquitous sensory overload, the greatest competitive moat a product team can cultivate is cognitive tranquility. Great interaction design in 2026 isn't defined by how much information we can pack onto an OLED canvas, but by how effortlessly the human subconscious can parse intent and synthesize agency.
                                </p>

                                <p>
                                    As synthetic intelligence weaves deeper into our day-to-day tooling, the visual surface must step back. We are transitioning from explicit manual control panels into calm, anticipatory canvases where user intention dictates topology.
                                </p>

                                {/* SECTION 01 */}
                                <div className="pt-4 space-y-2">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                                        <span className="text-[#4F46E5]">01.</span>
                                        <span>Clarity Over Novelty</span>
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        Interface friction rarely stems from missing features; it is almost universally born of cognitive ambiguity. When buttons impersonate cards, when critical navigational anchors drift dynamically across viewports, and when interaction paradigms force the user to guess, fatigue inevitably follows. Every extraneous decorative flair drains a fraction of working memory that belongs strictly to the reader's original objective.
                                    </p>
                                </div>

                                {/* QUOTE BLOCK */}
                                <blockquote className="my-6 sm:my-8 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F4F6FF] border-none relative space-y-3">
                                    <BiSolidQuoteAltLeft className="text-indigo-200 text-3xl sm:text-4xl mb-1" />
                                    <p className="text-slate-800 font-medium italic text-base sm:text-lg lg:text-xl leading-relaxed">
                                        "Simplicity is not the lack of clutter, that's a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object and surface."
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="w-5 h-0.5 bg-indigo-600 rounded-full" />
                                        <cite className="not-italic text-[10px] sm:text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                                            Jony Ive — On Holistic Product Intent
                                        </cite>
                                    </div>
                                </blockquote>

                                {/* SECTION 02 */}
                                <div className="pt-4 space-y-2">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                                        <span className="text-[#4F46E5]">02.</span>
                                        <span>Consistent Visual Hierarchy</span>
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        Typographic rhythm and disciplined spatial constraints give software its voice. When your design scales proportional margins, your users instinctively understand how concepts relate before reading a single syllable. To guarantee stability across platforms:
                                    </p>
                                </div>

                                {/* LIST CARD */}
                                <div className="my-6 sm:my-8 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F8FAFC] border border-slate-100 space-y-4">
                                    <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase">
                                        KEY ARCHITECTURAL TAKEAWAYS
                                    </h3>

                                    <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-[#4F46E5] text-base sm:text-lg shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Strict 4px/8px Spatial Scale:</strong> Anchor vertical margins to mathematical rhythms to prevent visual dissonance between varied modules.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-[#4F46E5] text-base sm:text-lg shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Semantic Color Restraint:</strong> Reserve saturated hues exclusively for interactive calls-to-action and critical operational notifications.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-[#4F46E5] text-base sm:text-lg shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Frictionless Reading Width:</strong> Cap text blocks between 60 and 75 characters per line (typically 680px to 780px) to prevent lateral eye-strain.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <FiCheckCircle className="text-[#4F46E5] text-base sm:text-lg shrink-0 mt-0.5" />
                                            <p>
                                                <strong className="font-bold text-slate-900">Decisive Surface Tiers:</strong> Rely on subtle tonality shifts rather than dense borders to demarcate content containers.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CHART / METRICS CARD */}
                                <div className="my-6 sm:my-8 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#EEF2FF]/60 border border-indigo-100/80 space-y-4 sm:space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
                                        <span className="text-slate-800">Cognitive Load Index (Lower is Better)</span>
                                        <span className="text-[#4F46E5] uppercase tracking-wider">Benchmark 2026</span>
                                    </div>

                                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100/80">
                                        <div className="relative pt-6 pb-2">
                                            <div className="border-b border-dashed border-slate-200 w-full absolute top-0" />
                                            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end h-28">
                                                <div className="space-y-2 text-center">
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 block truncate">Legacy Heavy (68 pt)</span>
                                                    <div className="bg-slate-200 h-20 rounded-lg sm:rounded-xl w-full" />
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 block truncate">Iterative Mod (48 pt)</span>
                                                    <div className="bg-emerald-400 h-14 rounded-lg sm:rounded-xl w-full" />
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 block truncate">Calm Frame (22 pt)</span>
                                                    <div className="bg-[#4F46E5] h-8 rounded-lg sm:rounded-xl w-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed italic">
                                        Comparative telemetry collected across 14,000 recorded user onboarding sequences shows a 67% decline in task hesitation when navigational noise is removed.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* TAGS */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <FiTag size={14} />
                                    <span>Indexed Tags & Topics</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-indigo-50/70 hover:bg-indigo-100 text-[#4F46E5] text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                {/* BOTTOM FLOATING/STICKY FOOTER ACTIONS */}
                <div className="mt-6  bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                            <FiEyeOff size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">Previewing draft as an end-reader</p>
                            <p className="text-[11px] text-slate-400 font-medium">Ready to push live to the global publication index?</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                            onClick={handleEdit}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
                        >
                            <FiEdit3 size={14} />
                            <span>Edit Blog</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsConfirmOpen(true)}
                            className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                            <FiTrash2 size={14} />
                        </button>

                        {/* Confirmation Modal */}
                        {isConfirmOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-slate-900">Move to Trash?</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Are you sure you want to move this draft to trash?
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsConfirmOpen(false)}
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmTrash}
                                            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                                        >
                                            Move to Trash
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Toast Notification */}
                        {showToast && (
                            <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 z-50">
                                <div className="flex items-center gap-2.5">
                                    <FiCheckCircle size={18} className="text-emerald-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-700">
                                        {toastMessage}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowToast(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handlePublish}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 cursor-pointer"
                        >
                            <FiSend size={14} />
                            <span>Publish</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}