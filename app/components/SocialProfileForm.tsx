"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Client {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
}

interface SocialProfileFormProps {
    clientId?: string;
    initialData?: {
        clientId: string;
        industry: string;
        niche: string;
        targetAudience: string;
        brandTone: string;
        platforms: string[];
        goals: string;
        competitors: string;
        brandColors: string;
        sampleContent: string;
    };
}

const PLATFORM_OPTIONS = [
    "instagram",
    "tiktok",
    "twitter",
    "linkedin",
    "snapchat",
    "facebook",
];

const TONE_OPTIONS = [
    "professional",
    "playful",
    "luxury",
    "educational",
    "inspirational",
    "casual",
    "bold",
];

export default function SocialProfileForm({
    clientId,
    initialData,
}: SocialProfileFormProps) {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        clientId: clientId || initialData?.clientId || "",
        industry: initialData?.industry || "",
        niche: initialData?.niche || "",
        targetAudience: initialData?.targetAudience || "",
        brandTone: initialData?.brandTone || "professional",
        platforms: initialData?.platforms || ["instagram"],
        goals: initialData?.goals || "",
        competitors: initialData?.competitors || "",
        brandColors: initialData?.brandColors || "",
        sampleContent: initialData?.sampleContent || "",
    });

    useEffect(() => {
        if (!clientId) {
            fetch("/api/clients")
                .then((r) => r.json())
                .then((data) => setClients(data));
        }
    }, [clientId]);

    const togglePlatform = (platform: string) => {
        setForm((prev) => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter((p) => p !== platform)
                : [...prev.platforms, platform],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/social/profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const profile = await res.json();
                router.push(`/social/profiles/${profile.id}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* Client Selector */}
            {!clientId && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Select Client
                    </label>
                    <select
                        value={form.clientId}
                        onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                    >
                        <option value="">Choose a client...</option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.company || c.name} {c.email ? `(${c.email})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Industry & Niche */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Industry
                    </label>
                    <input
                        type="text"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        placeholder="e.g., E-commerce, Restaurant, Real Estate"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Niche
                    </label>
                    <input
                        type="text"
                        value={form.niche}
                        onChange={(e) => setForm({ ...form, niche: e.target.value })}
                        placeholder="e.g., Luxury fashion, Organic food"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                    />
                </div>
            </div>

            {/* Target Audience */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Target Audience
                </label>
                <textarea
                    value={form.targetAudience}
                    onChange={(e) =>
                        setForm({ ...form, targetAudience: e.target.value })
                    }
                    placeholder="Age, gender, location, interests — e.g., 25-40 females in Riyadh interested in luxury skincare"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                />
            </div>

            {/* Brand Tone */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Brand Tone
                </label>
                <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((tone) => (
                        <button
                            key={tone}
                            type="button"
                            onClick={() => setForm({ ...form, brandTone: tone })}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${form.brandTone === tone
                                    ? "bg-[#044199] text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>

            {/* Platforms */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => (
                        <button
                            key={platform}
                            type="button"
                            onClick={() => togglePlatform(platform)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${form.platforms.includes(platform)
                                    ? "bg-[#00c65e] text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {platform}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Goals
                </label>
                <textarea
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    placeholder="e.g., Increase brand awareness, drive sales, generate leads"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                />
            </div>

            {/* Competitors */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Competitor Accounts
                </label>
                <input
                    type="text"
                    value={form.competitors}
                    onChange={(e) => setForm({ ...form, competitors: e.target.value })}
                    placeholder="@competitor1, @competitor2"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                />
            </div>

            {/* Brand Colors */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Brand Colors
                </label>
                <input
                    type="text"
                    value={form.brandColors}
                    onChange={(e) => setForm({ ...form, brandColors: e.target.value })}
                    placeholder="e.g., #FF5733, #044199, Gold"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !form.clientId}
                className="w-full bg-[#044199] text-white py-3 rounded-lg font-semibold hover:bg-[#033378] disabled:opacity-50 transition-all"
            >
                {loading ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
            </button>
        </form>
    );
}
