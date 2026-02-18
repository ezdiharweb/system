"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, BarChart3, Columns3, Plus } from "lucide-react";
import ContentCalendar from "@/app/components/ContentCalendar";
import GanttChart from "@/app/components/GanttChart";
import KanbanBoard from "@/app/components/KanbanBoard";
import PostCard from "@/app/components/PostCard";

interface Post {
    id: string;
    date: string;
    postType: "FEED" | "STORY" | "REEL" | "AD";
    platform: string;
    captionAr: string;
    captionEn: string;
    hashtags: string;
    cta: string;
    adHeadline: string;
    adBody: string;
    hookScript: string;
    status: "DRAFT" | "APPROVED" | "SCHEDULED" | "PUBLISHED";
}

interface Plan {
    id: string;
    month: number;
    year: number;
    scheduleType: string;
    status: string;
    profile: {
        id: string;
        client: { name: string; company: string | null };
    };
    posts: Post[];
}

type ViewMode = "calendar" | "gantt" | "kanban";

const VIEW_OPTIONS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "calendar", label: "Calendar", icon: <Calendar size={16} /> },
    { key: "gantt", label: "Gantt", icon: <BarChart3 size={16} /> },
    { key: "kanban", label: "Kanban", icon: <Columns3 size={16} /> },
];

export default function PlanCalendarView({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("calendar");
    const [showAddPost, setShowAddPost] = useState(false);
    const [addPostDate, setAddPostDate] = useState<string>("");
    const [addPostForm, setAddPostForm] = useState({
        postType: "FEED" as "FEED" | "STORY" | "REEL" | "AD",
        platform: "instagram",
        captionAr: "",
        captionEn: "",
        hashtags: "",
        cta: "",
    });
    const [genError, setGenError] = useState<string | null>(null);

    const fetchPlan = () => {
        fetch(`/api/social/plans/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setPlan(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPlan();
    }, [id]);

    const handleRegenerate = async () => {
        if (!confirm("This will replace all existing posts. Continue?")) return;
        setRegenerating(true);
        setGenError(null);
        try {
            const res = await fetch(`/api/social/plans/${id}/generate`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                fetchPlan();
            } else {
                setGenError(data.error || "Generation failed");
                fetchPlan();
            }
        } catch (err) {
            setGenError("Network error during generation");
        } finally {
            setRegenerating(false);
        }
    };

    const handlePostUpdate = (updated: Post) => {
        if (plan) {
            setPlan({
                ...plan,
                posts: plan.posts.map((p) => (p.id === updated.id ? updated : p)),
            });
            setSelectedPost(updated);
        }
    };

    const handleStatusChange = async (postId: string, newStatus: string) => {
        const res = await fetch(`/api/social/posts/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok && plan) {
            const updated = await res.json();
            setPlan({
                ...plan,
                posts: plan.posts.map((p) => (p.id === postId ? { ...p, status: updated.status } : p)),
            });
        }
    };

    const handleAddPostFromCalendar = (date: Date) => {
        setAddPostDate(date.toISOString().split("T")[0]);
        setShowAddPost(true);
    };

    const handleAddPostSubmit = async () => {
        if (!plan || !addPostDate) return;
        try {
            // Create post via direct API
            const res = await fetch(`/api/social/posts/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    date: new Date(addPostDate).toISOString(),
                    ...addPostForm,
                }),
            });
            if (res.ok) {
                setShowAddPost(false);
                setAddPostForm({
                    postType: "FEED",
                    platform: "instagram",
                    captionAr: "",
                    captionEn: "",
                    hashtags: "",
                    cta: "",
                });
                fetchPlan();
            }
        } catch (err) {
            console.error("Failed to add post:", err);
        }
    };

    if (loading || !plan) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044199]" />
            </div>
        );
    }

    const clientName = plan.profile.client.company || plan.profile.client.name;
    const totalPosts = plan.posts.length;
    const feedCount = plan.posts.filter((p) => p.postType === "FEED").length;
    const storyCount = plan.posts.filter((p) => p.postType === "STORY").length;
    const reelCount = plan.posts.filter((p) => p.postType === "REEL").length;
    const adCount = plan.posts.filter((p) => p.postType === "AD").length;
    const approvedCount = plan.posts.filter(
        (p) => p.status === "APPROVED" || p.status === "PUBLISHED"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href={`/social/profiles/${plan.profile.id}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to {clientName}
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
                        <p className="text-gray-500 text-sm">
                            Content Plan ·{" "}
                            {plan.scheduleType === "MWF" ? "Mon/Wed/Fri" : "Tue/Thu/Sat"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddPost(true)}
                            className="px-4 py-2 bg-[#00c65e] text-white rounded-lg text-sm font-medium hover:bg-[#00a84d] transition flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Add Post
                        </button>
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={regenerating ? "animate-spin" : ""}
                            />
                            {regenerating ? "Generating..." : "Regenerate"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {genError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    <strong>Generation Error:</strong> {genError}
                </div>
            )}

            {/* Stats Bar */}
            <div className="flex gap-3 flex-wrap">
                <div className="bg-white border rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-gray-900">{totalPosts}</span>{" "}
                    <span className="text-gray-500">Total</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-blue-700">{feedCount}</span>{" "}
                    <span className="text-blue-500">Feed</span>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-pink-700">{storyCount}</span>{" "}
                    <span className="text-pink-500">Stories</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-purple-700">{reelCount}</span>{" "}
                    <span className="text-purple-500">Reels</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-orange-700">{adCount}</span>{" "}
                    <span className="text-orange-500">Ads</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
                    <span className="font-bold text-green-700">{approvedCount}</span>{" "}
                    <span className="text-green-500">Approved</span>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {VIEW_OPTIONS.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => setViewMode(opt.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === opt.key
                                ? "bg-white text-[#044199] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Views */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                {viewMode === "calendar" && (
                    <ContentCalendar
                        year={plan.year}
                        month={plan.month}
                        posts={plan.posts}
                        onPostClick={(post) => setSelectedPost(post)}
                        onAddPost={handleAddPostFromCalendar}
                    />
                )}
                {viewMode === "gantt" && (
                    <GanttChart
                        year={plan.year}
                        month={plan.month}
                        posts={plan.posts}
                        onPostClick={(post) => setSelectedPost(post)}
                    />
                )}
                {viewMode === "kanban" && (
                    <KanbanBoard
                        posts={plan.posts}
                        onPostClick={(post) => setSelectedPost(post)}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostCard
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onUpdate={handlePostUpdate}
                />
            )}

            {/* Add Post Dialog */}
            {showAddPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="bg-[#00c65e] text-white px-5 py-3 rounded-t-2xl flex justify-between items-center">
                            <p className="font-bold">➕ Add New Post</p>
                            <button
                                onClick={() => setShowAddPost(false)}
                                className="p-1 hover:bg-white/20 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={addPostDate}
                                    onChange={(e) => setAddPostDate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">
                                        Type
                                    </label>
                                    <select
                                        value={addPostForm.postType}
                                        onChange={(e) =>
                                            setAddPostForm({
                                                ...addPostForm,
                                                postType: e.target.value as Post["postType"],
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                    >
                                        <option value="FEED">📝 Feed</option>
                                        <option value="STORY">📱 Story</option>
                                        <option value="REEL">🎬 Reel</option>
                                        <option value="AD">📢 Ad</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">
                                        Platform
                                    </label>
                                    <select
                                        value={addPostForm.platform}
                                        onChange={(e) =>
                                            setAddPostForm({
                                                ...addPostForm,
                                                platform: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                    >
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="snapchat">Snapchat</option>
                                        <option value="facebook">Facebook</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Caption (Arabic)
                                </label>
                                <textarea
                                    value={addPostForm.captionAr}
                                    onChange={(e) =>
                                        setAddPostForm({
                                            ...addPostForm,
                                            captionAr: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    dir="rtl"
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Caption (English)
                                </label>
                                <textarea
                                    value={addPostForm.captionEn}
                                    onChange={(e) =>
                                        setAddPostForm({
                                            ...addPostForm,
                                            captionEn: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Hashtags
                                </label>
                                <input
                                    value={addPostForm.hashtags}
                                    onChange={(e) =>
                                        setAddPostForm({
                                            ...addPostForm,
                                            hashtags: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <button
                                onClick={handleAddPostSubmit}
                                disabled={!addPostDate}
                                className="w-full bg-[#044199] text-white py-2.5 rounded-lg font-semibold hover:bg-[#033378] disabled:opacity-50 transition"
                            >
                                Add Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
