"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Eye, Trash2 } from "lucide-react";
import { ROLE_INFO, type AppRole } from "@/lib/permissions";
import toast from "react-hot-toast";

interface TeamUser {
    id: string;
    name: string;
    email: string;
    role: AppRole;
    department: string | null;
    phone: string | null;
    createdAt: string;
    _count: { clients: number; documents: number };
}

const ROLE_FILTERS: { key: string; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "SUPER_ADMIN", label: "🛡️ Super Admin" },
    { key: "ADMIN", label: "⚙️ Admin" },
    { key: "SENIOR_ACCOUNT_MANAGER", label: "👔 Senior AM" },
    { key: "ACCOUNT_MANAGER", label: "👤 Account Manager" },
    { key: "CONTENT_CREATOR", label: "✏️ Content Creator" },
    { key: "FINANCE", label: "💰 Finance" },
];

export default function TeamPage() {
    const [users, setUsers] = useState<TeamUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("/api/team")
            .then((r) => r.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}? Their clients will be unassigned.`)) return;
        const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
        if (res.ok) {
            setUsers(users.filter((u) => u.id !== id));
            toast.success("Team member deleted");
        } else {
            toast.error("Failed to delete");
        }
    };

    const filtered =
        filter === "ALL" ? users : users.filter((u) => u.role === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044199]" />
            </div>
        );
    }

    // Stats
    const totalMembers = users.length;
    const roleCount: Record<string, number> = {};
    users.forEach((u) => {
        roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                    <p className="text-gray-500 text-sm">
                        {totalMembers} members across{" "}
                        {Object.keys(roleCount).length} roles
                    </p>
                </div>
                <Link
                    href="/team/new"
                    className="inline-flex items-center rounded-lg bg-[#044199] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#033378] transition"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Add Member
                </Link>
            </div>

            {/* Role Stats */}
            <div className="flex gap-2 flex-wrap">
                {ROLE_FILTERS.map((rf) => {
                    const count =
                        rf.key === "ALL"
                            ? totalMembers
                            : roleCount[rf.key] || 0;
                    return (
                        <button
                            key={rf.key}
                            onClick={() => setFilter(rf.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === rf.key
                                    ? "bg-[#044199] text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {rf.label}{" "}
                            <span className="ml-1 opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((user) => {
                    const roleInfo = ROLE_INFO[user.role];
                    return (
                        <div
                            key={user.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#044199] flex items-center justify-center text-white font-bold text-sm">
                                        {user.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) || "?"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">
                                            {user.name || "No Name"}
                                        </h3>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="mb-3">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${roleInfo.color}`}
                                >
                                    {roleInfo.icon} {roleInfo.label}
                                </span>
                                {user.department && (
                                    <span className="ml-2 text-xs text-gray-400">
                                        {user.department}
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 mb-3 text-xs">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Users size={12} />
                                    <span>
                                        <strong className="text-gray-700">
                                            {user._count.clients}
                                        </strong>{" "}
                                        clients
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    📄
                                    <span>
                                        <strong className="text-gray-700">
                                            {user._count.documents}
                                        </strong>{" "}
                                        docs
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <Link
                                    href={`/team/${user.id}`}
                                    className="flex-1 text-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                                >
                                    <Eye size={12} className="inline mr-1" />
                                    View
                                </Link>
                                <button
                                    onClick={() =>
                                        handleDelete(user.id, user.name || "this member")
                                    }
                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No team members found for this filter.
                    </div>
                )}
            </div>
        </div>
    );
}
