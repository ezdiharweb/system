"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, Users, BarChart3 } from "lucide-react";

interface Profile {
    id: string;
    industry: string;
    brandTone: string;
    platforms: string[];
    client: {
        id: string;
        name: string;
        company: string | null;
    };
    contentPlans: {
        id: string;
        month: number;
        year: number;
        status: string;
    }[];
}

const PLATFORM_ICONS: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    twitter: "🐦",
    linkedin: "💼",
    snapchat: "👻",
    facebook: "📘",
};

export default function SocialDashboard() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/social/profiles")
            .then((r) => r.json())
            .then((data) => {
                setProfiles(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044199]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        AI-powered content planning for your clients
                    </p>
                </div>
                <Link
                    href="/social/profiles/new"
                    className="bg-[#044199] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#033378] transition"
                >
                    <Plus size={18} />
                    New Profile
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {profiles.length}
                            </p>
                            <p className="text-xs text-gray-500">Active Profiles</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Calendar size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {profiles.reduce((a, p) => a + p.contentPlans.length, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Plans Generated</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BarChart3 size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {profiles.reduce(
                                    (a, p) => a + p.platforms.length,
                                    0
                                )}
                            </p>
                            <p className="text-xs text-gray-500">Total Platforms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profiles Grid */}
            {profiles.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="text-5xl mb-4">📱</div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        No social media profiles yet
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 mb-6">
                        Create a profile for one of your existing clients to start
                        generating content
                    </p>
                    <Link
                        href="/social/profiles/new"
                        className="inline-flex items-center gap-2 bg-[#044199] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#033378] transition"
                    >
                        <Plus size={18} />
                        Create First Profile
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profiles.map((profile) => (
                        <Link
                            key={profile.id}
                            href={`/social/profiles/${profile.id}`}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#044199]/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-[#044199] transition">
                                        {profile.client.company || profile.client.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">{profile.industry}</p>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                                    {profile.brandTone}
                                </span>
                            </div>

                            {/* Platforms */}
                            <div className="flex gap-1 mb-3">
                                {profile.platforms.map((p) => (
                                    <span
                                        key={p}
                                        className="text-lg"
                                        title={p}
                                    >
                                        {PLATFORM_ICONS[p] || "🌐"}
                                    </span>
                                ))}
                            </div>

                            {/* Latest Plan */}
                            {profile.contentPlans.length > 0 ? (
                                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                    Latest plan:{" "}
                                    <span className="font-medium">
                                        {profile.contentPlans[0].month}/
                                        {profile.contentPlans[0].year}
                                    </span>{" "}
                                    ·{" "}
                                    <span
                                        className={`font-medium ${profile.contentPlans[0].status === "generated"
                                                ? "text-green-600"
                                                : "text-yellow-600"
                                            }`}
                                    >
                                        {profile.contentPlans[0].status}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400">
                                    No plans generated yet
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
