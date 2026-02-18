"use client";

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

interface GanttChartProps {
    year: number;
    month: number;
    posts: Post[];
    onPostClick: (post: Post) => void;
}

const TYPE_COLORS: Record<string, string> = {
    FEED: "#3b82f6",
    STORY: "#ec4899",
    REEL: "#a855f7",
    AD: "#f97316",
};

const TYPE_LABELS: Record<string, string> = {
    FEED: "📝 Feed",
    STORY: "📱 Story",
    REEL: "🎬 Reel",
    AD: "📢 Ad",
};

const STATUS_BG: Record<string, string> = {
    DRAFT: "opacity-50",
    APPROVED: "opacity-80",
    SCHEDULED: "opacity-90",
    PUBLISHED: "opacity-100",
};

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function GanttChart({
    year,
    month,
    posts,
    onPostClick,
}: GanttChartProps) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Group posts by type
    const types: ("FEED" | "STORY" | "REEL" | "AD")[] = [
        "FEED",
        "STORY",
        "REEL",
        "AD",
    ];

    // Days that have posts for each type
    const postsByTypeAndDay: Record<string, Record<number, Post[]>> = {};
    types.forEach((type) => {
        postsByTypeAndDay[type] = {};
    });

    posts.forEach((post) => {
        const day = new Date(post.date).getDate();
        const type = post.postType;
        if (!postsByTypeAndDay[type]) postsByTypeAndDay[type] = {};
        if (!postsByTypeAndDay[type][day]) postsByTypeAndDay[type][day] = [];
        postsByTypeAndDay[type][day].push(post);
    });

    // Get day of week abbreviation
    const getDayLabel = (day: number) => {
        const date = new Date(year, month - 1, day);
        return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()];
    };

    const isWeekend = (day: number) => {
        const date = new Date(year, month - 1, day);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                📊 Gantt Chart — {MONTHS[month - 1]} {year}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-[#044199] text-white text-left px-3 py-2 text-xs font-semibold min-w-[100px] z-10">
                                Type
                            </th>
                            {dayNumbers.map((day) => (
                                <th
                                    key={day}
                                    className={`text-center px-0.5 py-1 text-[10px] font-medium min-w-[28px] ${isWeekend(day)
                                        ? "bg-gray-100 text-gray-400"
                                        : "bg-[#044199] text-white"
                                        }`}
                                >
                                    <div>{getDayLabel(day)}</div>
                                    <div className="font-bold">{day}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {types.map((type) => {
                            const color = TYPE_COLORS[type];
                            return (
                                <tr key={type} className="border-t border-gray-100">
                                    <td className="sticky left-0 bg-white px-3 py-3 text-sm font-semibold z-10 border-r border-gray-100">
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="w-3 h-3 rounded-sm inline-block"
                                                style={{ backgroundColor: color }}
                                            />
                                            {TYPE_LABELS[type]}
                                        </span>
                                    </td>
                                    {dayNumbers.map((day) => {
                                        const dayPosts = postsByTypeAndDay[type]?.[day] || [];
                                        return (
                                            <td
                                                key={day}
                                                className={`text-center p-0.5 ${isWeekend(day) ? "bg-gray-50" : ""
                                                    }`}
                                            >
                                                {dayPosts.map((post) => (
                                                    <button
                                                        key={post.id}
                                                        onClick={() => onPostClick(post)}
                                                        className={`w-6 h-6 rounded-md cursor-pointer hover:scale-125 transition-transform ${STATUS_BG[post.status]}`}
                                                        style={{ backgroundColor: color }}
                                                        title={`${TYPE_LABELS[type]} — ${post.status}`}
                                                    />
                                                ))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-3 justify-center text-xs text-gray-500">
                <span>Opacity: </span>
                <span className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded-sm bg-blue-500 opacity-50" /> Draft
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded-sm bg-blue-500 opacity-80" />{" "}
                    Approved
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded-sm bg-blue-500 opacity-90" />{" "}
                    Scheduled
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-4 h-3 rounded-sm bg-blue-500 opacity-100" />{" "}
                    Published
                </span>
            </div>
        </div>
    );
}
