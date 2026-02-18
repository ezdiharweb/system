"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

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

interface ContentCalendarProps {
    year: number;
    month: number;
    posts: Post[];
    onPostClick: (post: Post) => void;
    onAddPost?: (date: Date) => void;
}

const DAYS_AR = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
];
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> =
{
    FEED: { bg: "bg-blue-100", text: "text-blue-700", label: "📝 Feed" },
    STORY: { bg: "bg-pink-100", text: "text-pink-700", label: "📱 Story" },
    REEL: { bg: "bg-purple-100", text: "text-purple-700", label: "🎬 Reel" },
    AD: { bg: "bg-orange-100", text: "text-orange-700", label: "📢 Ad" },
};

const STATUS_ICONS: Record<string, string> = {
    DRAFT: "✏️",
    APPROVED: "✅",
    SCHEDULED: "📅",
    PUBLISHED: "🚀",
};

export default function ContentCalendar({
    year,
    month,
    posts,
    onPostClick,
    onAddPost,
}: ContentCalendarProps) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    // Group posts by day
    const postsByDay: Record<number, Post[]> = {};
    posts.forEach((post) => {
        const d = new Date(post.date).getDate();
        if (!postsByDay[d]) postsByDay[d] = [];
        postsByDay[d].push(post);
    });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {MONTHS[month - 1]} {year}
            </h2>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-xl overflow-hidden">
                {DAYS_AR.map((day) => (
                    <div
                        key={day}
                        className="bg-[#044199] text-white text-center py-2 text-sm font-semibold"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-xl overflow-hidden">
                {cells.map((day, idx) => (
                    <div
                        key={idx}
                        className={`min-h-[110px] p-1.5 relative group ${day ? "bg-white" : "bg-gray-50"
                            }`}
                    >
                        {day && (
                            <>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-400">
                                        {day}
                                    </span>
                                    {onAddPost && (
                                        <button
                                            onClick={() =>
                                                onAddPost(new Date(year, month - 1, day))
                                            }
                                            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-[#00c65e] text-white flex items-center justify-center transition-opacity cursor-pointer"
                                            title="Add post"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {(postsByDay[day] || []).map((post) => {
                                        const color = TYPE_COLORS[post.postType];
                                        return (
                                            <button
                                                key={post.id}
                                                onClick={() => onPostClick(post)}
                                                className={`w-full text-left px-1.5 py-1 rounded text-[11px] font-medium ${color.bg} ${color.text} hover:opacity-80 transition-opacity truncate cursor-pointer`}
                                            >
                                                {STATUS_ICONS[post.status]} {color.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 justify-center">
                {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${color.bg}`} />
                        <span className="text-xs text-gray-600">{color.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
