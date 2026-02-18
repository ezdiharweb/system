"use client";

import { useState } from "react";

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

interface KanbanBoardProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
    onStatusChange: (postId: string, newStatus: string) => void;
}

const COLUMNS: { key: string; label: string; color: string; icon: string }[] = [
    { key: "DRAFT", label: "Draft", color: "border-gray-300 bg-gray-50", icon: "✏️" },
    { key: "APPROVED", label: "Approved", color: "border-blue-300 bg-blue-50", icon: "✅" },
    { key: "SCHEDULED", label: "Scheduled", color: "border-yellow-300 bg-yellow-50", icon: "📅" },
    { key: "PUBLISHED", label: "Published", color: "border-green-300 bg-green-50", icon: "🚀" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    FEED: { bg: "bg-blue-100", text: "text-blue-700" },
    STORY: { bg: "bg-pink-100", text: "text-pink-700" },
    REEL: { bg: "bg-purple-100", text: "text-purple-700" },
    AD: { bg: "bg-orange-100", text: "text-orange-700" },
};

const TYPE_LABELS: Record<string, string> = {
    FEED: "📝 Feed",
    STORY: "📱 Story",
    REEL: "🎬 Reel",
    AD: "📢 Ad",
};

export default function KanbanBoard({
    posts,
    onPostClick,
    onStatusChange,
}: KanbanBoardProps) {
    const [draggedPost, setDraggedPost] = useState<string | null>(null);

    const handleDragStart = (postId: string) => {
        setDraggedPost(postId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (status: string) => {
        if (draggedPost) {
            onStatusChange(draggedPost, status);
            setDraggedPost(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Kanban Board
            </h2>
            <div className="grid grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                    const columnPosts = posts.filter((p) => p.status === col.key);
                    return (
                        <div
                            key={col.key}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(col.key)}
                            className={`rounded-xl border-2 ${col.color} min-h-[300px] p-3`}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                <h3 className="font-bold text-sm text-gray-700">
                                    {col.icon} {col.label}
                                </h3>
                                <span className="bg-white text-xs font-semibold px-2 py-0.5 rounded-full text-gray-600 shadow-sm">
                                    {columnPosts.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-2">
                                {columnPosts.map((post) => {
                                    const typeColor = TYPE_COLORS[post.postType];
                                    const postDate = new Date(post.date);
                                    return (
                                        <div
                                            key={post.id}
                                            draggable
                                            onDragStart={() => handleDragStart(post.id)}
                                            onClick={() => onPostClick(post)}
                                            className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100 hover:border-gray-300"
                                        >
                                            {/* Type Badge */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text}`}
                                                >
                                                    {TYPE_LABELS[post.postType]}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {postDate.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            {/* Content Preview */}
                                            <p
                                                className="text-xs text-gray-700 line-clamp-2 mb-1"
                                                dir={post.captionAr ? "rtl" : "ltr"}
                                            >
                                                {post.captionAr || post.captionEn || "No caption"}
                                            </p>

                                            {/* Platform */}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-gray-400 capitalize">
                                                    {post.platform}
                                                </span>
                                                {post.hashtags && (
                                                    <span className="text-[10px] text-blue-400 truncate max-w-[100px]">
                                                        {post.hashtags.split(" ").slice(0, 2).join(" ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {columnPosts.length === 0 && (
                                    <div className="text-center py-6 text-xs text-gray-400">
                                        Drag posts here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
