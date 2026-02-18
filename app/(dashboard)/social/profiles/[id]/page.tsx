"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Calendar, Trash2 } from "lucide-react";
import SocialProfileForm from "@/app/components/SocialProfileForm";

interface Profile {
    id: string;
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
    client: { id: string; name: string; company: string | null };
    contentPlans: {
        id: string;
        month: number;
        year: number;
        status: string;
        scheduleType: string;
        _count: { posts: number };
    }[];
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function ProfileDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showNewPlan, setShowNewPlan] = useState(false);
    const [planForm, setPlanForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        scheduleType: "MWF",
    });

    const fetchProfile = () => {
        fetch(`/api/social/profiles/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setProfile(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const handleCreatePlan = async () => {
        setGenerating(true);
        try {
            // Create the plan
            const planRes = await fetch("/api/social/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: id,
                    ...planForm,
                }),
            });

            if (!planRes.ok) throw new Error("Failed to create plan");
            const plan = await planRes.json();

            // Generate content
            const genRes = await fetch(
                `/api/social/plans/${plan.id}/generate`,
                { method: "POST" }
            );

            if (genRes.ok) {
                router.push(`/social/plans/${plan.id}`);
            } else {
                const err = await genRes.json();
                alert(`Generation failed: ${err.error}`);
                fetchProfile();
            }
        } catch (err) {
            alert("Failed to generate plan. Check console for details.");
            console.error(err);
        } finally {
            setGenerating(false);
            setShowNewPlan(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm("Delete this plan and all its posts?")) return;
        await fetch(`/api/social/plans/${planId}`, { method: "DELETE" });
        fetchProfile();
    };

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044199]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/social"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Social Media
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {profile.client.company || profile.client.name}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {profile.industry} · {profile.brandTone} tone ·{" "}
                            {profile.platforms.join(", ")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEdit(!showEdit)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                            {showEdit ? "Close Edit" : "✏️ Edit Profile"}
                        </button>
                        <button
                            onClick={() => setShowNewPlan(!showNewPlan)}
                            className="bg-[#044199] text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#033378] transition"
                        >
                            <Sparkles size={18} />
                            Generate Monthly Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile (collapsible) */}
            {showEdit && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
                    <SocialProfileForm
                        clientId={profile.clientId}
                        initialData={{
                            clientId: profile.clientId,
                            industry: profile.industry,
                            niche: profile.niche,
                            targetAudience: profile.targetAudience,
                            brandTone: profile.brandTone,
                            platforms: profile.platforms,
                            goals: profile.goals,
                            competitors: profile.competitors,
                            brandColors: profile.brandColors,
                            sampleContent: profile.sampleContent,
                        }}
                    />
                </div>
            )}

            {/* Generate Plan Dialog */}
            {showNewPlan && (
                <div className="bg-white rounded-xl border-2 border-[#044199]/20 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-[#044199]" />
                        Generate New Monthly Plan
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Month
                            </label>
                            <select
                                value={planForm.month}
                                onChange={(e) =>
                                    setPlanForm({ ...planForm, month: parseInt(e.target.value) })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={i} value={i + 1}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Year
                            </label>
                            <select
                                value={planForm.year}
                                onChange={(e) =>
                                    setPlanForm({ ...planForm, year: parseInt(e.target.value) })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                {[2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Schedule
                            </label>
                            <select
                                value={planForm.scheduleType}
                                onChange={(e) =>
                                    setPlanForm({ ...planForm, scheduleType: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="MWF">Mon / Wed / Fri</option>
                                <option value="TU_TH_SA">Tue / Thu / Sat</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleCreatePlan}
                        disabled={generating}
                        className="w-full bg-gradient-to-r from-[#044199] to-[#00c65e] text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition"
                    >
                        {generating ? (
                            <>
                                <span className="animate-spin">⏳</span> Generating with AI...
                                This may take 30-60 seconds
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} /> Generate Content Plan
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Plans List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Content Plans
                </h2>
                {profile.contentPlans.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">
                            No plans generated yet. Click &quot;Generate Monthly Plan&quot; to
                            create your first AI-powered content calendar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {profile.contentPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {MONTHS[plan.month - 1]} {plan.year}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {plan.scheduleType === "MWF"
                                                ? "Mon/Wed/Fri"
                                                : "Tue/Thu/Sat"}{" "}
                                            · {plan._count.posts} posts ·{" "}
                                            <span
                                                className={`font-medium ${plan.status === "generated"
                                                        ? "text-green-600"
                                                        : plan.status === "generating"
                                                            ? "text-yellow-600"
                                                            : plan.status === "error"
                                                                ? "text-red-600"
                                                                : "text-gray-500"
                                                    }`}
                                            >
                                                {plan.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/social/plans/${plan.id}`}
                                        className="px-4 py-2 bg-[#044199] text-white rounded-lg text-sm font-medium hover:bg-[#033378] transition"
                                    >
                                        View Calendar
                                    </Link>
                                    <button
                                        onClick={() => handleDeletePlan(plan.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
