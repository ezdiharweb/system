"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Users, FileText, Edit } from "lucide-react";
import { ROLE_INFO, type AppRole } from "@/lib/permissions";
import TeamForm from "@/app/components/TeamForm";
import toast from "react-hot-toast";

interface Client {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    status: string;
    socialProfile: { id: string; platforms: string[] } | null;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: AppRole;
    department: string | null;
    phone: string | null;
    avatar: string | null;
    createdAt: string;
    clients: Client[];
    _count: { clients: number; documents: number };
}

export default function TeamMemberPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [member, setMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [assigning, setAssigning] = useState(false);

    const fetchMember = () => {
        fetch(`/api/team/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setMember(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMember();
    }, [id]);

    const openAssignDialog = async () => {
        // Fetch all clients to show in the assignment picker
        const res = await fetch("/api/clients");
        const clients = await res.json();
        setAllClients(clients);
        setSelectedClients([]);
        setShowAssign(true);
    };

    const handleAssign = async () => {
        if (selectedClients.length === 0) return;
        setAssigning(true);
        try {
            const res = await fetch(`/api/team/${id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientIds: selectedClients }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setShowAssign(false);
                fetchMember();
            } else {
                toast.error(data.error || "Failed to assign");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassign = async (clientId: string, clientName: string) => {
        if (!confirm(`Remove ${clientName} from ${member?.name}?`)) return;
        const res = await fetch(
            `/api/team/${id}/assign?clientId=${clientId}`,
            { method: "DELETE" }
        );
        if (res.ok) {
            toast.success("Client unassigned");
            fetchMember();
        }
    };

    if (loading || !member) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044199]" />
            </div>
        );
    }

    const roleInfo = ROLE_INFO[member.role];
    const assignedClientIds = member.clients.map((c) => c.id);
    const unassignedClients = allClients.filter(
        (c) => !assignedClientIds.includes(c.id)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/team"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Team
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#044199] flex items-center justify-center text-white font-bold text-xl">
                            {member.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "?"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {member.name}
                            </h1>
                            <p className="text-gray-500 text-sm">{member.email}</p>
                            {member.phone && (
                                <p className="text-gray-400 text-xs mt-0.5">
                                    📞 {member.phone}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEdit(!showEdit)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1.5"
                    >
                        <Edit size={14} />
                        {showEdit ? "Close" : "Edit"}
                    </button>
                </div>

                {/* Role & Department */}
                <div className="flex gap-3 mt-4">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${roleInfo.color}`}
                    >
                        {roleInfo.icon} {roleInfo.label}
                    </span>
                    {member.department && (
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            📁 {member.department}
                        </span>
                    )}
                </div>

                {/* Scope of Work */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">
                        Scope of Work
                    </h3>
                    <p className="text-sm text-gray-500">{roleInfo.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {getScopeItems(member.role).map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2 text-sm">
                        <Users size={16} className="text-blue-600" />
                        <span>
                            <strong className="text-blue-700">
                                {member._count.clients}
                            </strong>{" "}
                            <span className="text-blue-500">Assigned Clients</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-2 text-sm">
                        <FileText size={16} className="text-green-600" />
                        <span>
                            <strong className="text-green-700">
                                {member._count.documents}
                            </strong>{" "}
                            <span className="text-green-500">Documents</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            {showEdit && (
                <div className="max-w-3xl">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                        Edit Member
                    </h2>
                    <TeamForm
                        initialData={{
                            id: member.id,
                            name: member.name || "",
                            email: member.email,
                            role: member.role,
                            department: member.department || "",
                            phone: member.phone || "",
                        }}
                    />
                </div>
            )}

            {/* Assigned Clients */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Assigned Clients ({member.clients.length})
                    </h2>
                    <button
                        onClick={openAssignDialog}
                        className="px-4 py-2 bg-[#00c65e] text-white rounded-lg text-sm font-semibold hover:bg-[#00a84d] transition flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Assign Client
                    </button>
                </div>

                {member.clients.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Users size={32} className="mx-auto mb-2 opacity-40" />
                        <p>No clients assigned yet.</p>
                        <p className="text-xs">
                            Click "Assign Client" to assign clients to this member.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {member.clients.map((client) => (
                            <div
                                key={client.id}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
                            >
                                <div>
                                    <Link
                                        href={`/clients/${client.id}`}
                                        className="font-semibold text-sm text-gray-900 hover:text-[#044199]"
                                    >
                                        {client.company || client.name}
                                    </Link>
                                    <div className="flex gap-2 mt-0.5">
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded ${client.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : client.status === "LEAD"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {client.status}
                                        </span>
                                        {client.socialProfile && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                                                {client.socialProfile.platforms.join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        handleUnassign(
                                            client.id,
                                            client.company || client.name
                                        )
                                    }
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Unassign"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign Dialog */}
            {showAssign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="bg-[#044199] text-white px-5 py-3 rounded-t-2xl flex justify-between items-center">
                            <p className="font-bold">Assign Clients to {member.name}</p>
                            <button
                                onClick={() => setShowAssign(false)}
                                className="p-1 hover:bg-white/20 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            {unassignedClients.length === 0 ? (
                                <p className="text-center text-gray-400 py-4 text-sm">
                                    All clients are already assigned to this member.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {unassignedClients.map((client) => {
                                        const checked = selectedClients.includes(client.id);
                                        return (
                                            <label
                                                key={client.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${checked
                                                        ? "bg-blue-50 border border-blue-200"
                                                        : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => {
                                                        setSelectedClients(
                                                            checked
                                                                ? selectedClients.filter(
                                                                    (id) => id !== client.id
                                                                )
                                                                : [...selectedClients, client.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 text-[#044199] rounded"
                                                />
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">
                                                        {client.company || client.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {client.email || "No email"}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-3 border-t">
                            <button
                                onClick={handleAssign}
                                disabled={selectedClients.length === 0 || assigning}
                                className="w-full bg-[#044199] text-white py-2.5 rounded-lg font-semibold hover:bg-[#033378] disabled:opacity-50 transition text-sm"
                            >
                                {assigning
                                    ? "Assigning..."
                                    : `Assign ${selectedClients.length} Client(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getScopeItems(role: AppRole): string[] {
    switch (role) {
        case "SUPER_ADMIN":
            return [
                "All Clients",
                "All Teams",
                "All Invoices",
                "Social Media",
                "Settings",
                "System Config",
            ];
        case "ADMIN":
            return [
                "All Clients",
                "Team Management",
                "All Invoices",
                "Social Media",
                "Settings",
            ];
        case "SENIOR_ACCOUNT_MANAGER":
            return [
                "All Clients",
                "Assign Clients",
                "Social Media",
                "Calendar",
                "Kanban",
                "Reports",
            ];
        case "ACCOUNT_MANAGER":
            return [
                "Assigned Clients",
                "Social Media",
                "Calendar",
                "Kanban",
                "Content Plans",
            ];
        case "CONTENT_CREATOR":
            return [
                "Assigned Clients",
                "Create Posts",
                "Edit Posts",
                "Calendar View",
            ];
        case "FINANCE":
            return [
                "All Invoices",
                "Proformas",
                "Contracts",
                "Financial Reports",
            ];
        default:
            return [];
    }
}
