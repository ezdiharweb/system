"use client";

import { useState } from "react";
import { X } from "lucide-react";

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

interface PostCardProps {
    post: Post;
    onClose: () => void;
    onUpdate: (updated: Post) => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    FEED: { label: "📝 Feed Post", color: "bg-blue-500" },
    STORY: { label: "📱 Story", color: "bg-pink-500" },
    REEL: { label: "🎬 Reel / Video", color: "bg-purple-500" },
    AD: { label: "📢 Paid Ad", color: "bg-orange-500" },
};

const STATUS_OPTIONS = ["DRAFT", "APPROVED", "SCHEDULED", "PUBLISHED"];

export default function PostCard({ post, onClose, onUpdate }: PostCardProps) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ ...post });
    const [saving, setSaving] = useState(false);

    const typeInfo = TYPE_LABELS[post.postType];
    const postDate = new Date(post.date);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/social/posts/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    captionAr: form.captionAr,
                    captionEn: form.captionEn,
                    hashtags: form.hashtags,
                    cta: form.cta,
                    status: form.status,
                    adHeadline: form.adHeadline,
                    adBody: form.adBody,
                    hookScript: form.hookScript,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setEditing(false);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        const res = await fetch(`/api/social/posts/${post.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            const updated = await res.json();
            onUpdate(updated);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div
                    className={`${typeInfo.color} text-white px-5 py-3 rounded-t-2xl flex justify-between items-center`}
                >
                    <div>
                        <p className="font-bold">{typeInfo.label}</p>
                        <p className="text-sm opacity-80">
                            {postDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                            })}{" "}
                            · {post.platform}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Status */}
                    <div className="flex gap-2">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${post.status === s
                                        ? "bg-[#044199] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {editing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Caption (Arabic)
                                </label>
                                <textarea
                                    value={form.captionAr}
                                    onChange={(e) =>
                                        setForm({ ...form, captionAr: e.target.value })
                                    }
                                    rows={3}
                                    dir="rtl"
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Caption (English)
                                </label>
                                <textarea
                                    value={form.captionEn}
                                    onChange={(e) =>
                                        setForm({ ...form, captionEn: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">
                                    Hashtags
                                </label>
                                <input
                                    value={form.hashtags}
                                    onChange={(e) =>
                                        setForm({ ...form, hashtags: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            {(post.postType === "AD") && (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">
                                            Ad Headline
                                        </label>
                                        <input
                                            value={form.adHeadline}
                                            onChange={(e) =>
                                                setForm({ ...form, adHeadline: e.target.value })
                                            }
                                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">
                                            Ad Body
                                        </label>
                                        <textarea
                                            value={form.adBody}
                                            onChange={(e) =>
                                                setForm({ ...form, adBody: e.target.value })
                                            }
                                            rows={2}
                                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                        />
                                    </div>
                                </>
                            )}
                            {post.postType === "REEL" && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">
                                        Hook & Script
                                    </label>
                                    <textarea
                                        value={form.hookScript}
                                        onChange={(e) =>
                                            setForm({ ...form, hookScript: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                                    />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-[#044199] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#033378] disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={() => {
                                        setForm({ ...post });
                                        setEditing(false);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <div className="space-y-3">
                            {post.captionAr && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">
                                        Arabic Caption
                                    </p>
                                    <p
                                        className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3"
                                        dir="rtl"
                                    >
                                        {post.captionAr}
                                    </p>
                                </div>
                            )}
                            {post.captionEn && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">
                                        English Caption
                                    </p>
                                    <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                                        {post.captionEn}
                                    </p>
                                </div>
                            )}
                            {post.hashtags && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">
                                        Hashtags
                                    </p>
                                    <p className="text-sm text-blue-600">{post.hashtags}</p>
                                </div>
                            )}
                            {post.cta && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">
                                        Call to Action
                                    </p>
                                    <p className="text-sm text-gray-800">{post.cta}</p>
                                </div>
                            )}
                            {post.postType === "AD" && post.adHeadline && (
                                <div className="border-t pt-3">
                                    <p className="text-xs font-semibold text-orange-600 mb-1">
                                        📢 Ad Details
                                    </p>
                                    <p className="font-bold text-gray-900">{post.adHeadline}</p>
                                    <p className="text-sm text-gray-700 mt-1">{post.adBody}</p>
                                </div>
                            )}
                            {post.postType === "REEL" && post.hookScript && (
                                <div className="border-t pt-3">
                                    <p className="text-xs font-semibold text-purple-600 mb-1">
                                        🎬 Hook & Script
                                    </p>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {post.hookScript}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => setEditing(true)}
                                className="w-full mt-2 border border-[#044199] text-[#044199] py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                            >
                                ✏️ Edit Post
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
