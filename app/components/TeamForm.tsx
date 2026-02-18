"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROLE_INFO, type AppRole } from "@/lib/permissions";

interface TeamFormProps {
    initialData?: {
        id: string;
        name: string;
        email: string;
        role: AppRole;
        department: string;
        phone: string;
    };
}

const ALL_ROLES: AppRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "SENIOR_ACCOUNT_MANAGER",
    "ACCOUNT_MANAGER",
    "CONTENT_CREATOR",
    "FINANCE",
];

const DEPARTMENTS = [
    "Management",
    "Marketing",
    "Creative",
    "Development",
    "Finance",
    "Operations",
    "Sales",
];

export default function TeamForm({ initialData }: TeamFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        password: "",
        role: (initialData?.role || "ACCOUNT_MANAGER") as AppRole,
        department: initialData?.department || "",
        phone: initialData?.phone || "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = { ...formData };
            if (isEdit && !payload.password) {
                delete payload.password;
            }

            const url = isEdit ? `/api/team/${initialData.id}` : "/api/team";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to save");
            }

            toast.success(
                isEdit ? "Team member updated" : "Team member created"
            );
            router.push("/team");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const roleInfo = ROLE_INFO[formData.role];

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
        >
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                        placeholder="e.g., Ahmed Al-Salem"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                        placeholder="ahmed@ezdiharweb.com"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Password {isEdit && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required={!isEdit}
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Phone
                    </label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                        placeholder="+971 50 123 4567"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label
                        htmlFor="department"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Department
                    </label>
                    <select
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[#044199] focus:border-transparent"
                    >
                        <option value="">— Select —</option>
                        {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Role Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Role & Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ALL_ROLES.map((role) => {
                        const info = ROLE_INFO[role];
                        const isSelected = formData.role === role;
                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, role })}
                                className={`text-left p-3 rounded-xl border-2 transition-all ${isSelected
                                        ? "border-[#044199] bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{info.icon}</span>
                                    <span className="font-bold text-sm text-gray-900">
                                        {info.label}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                    {info.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Role Preview */}
            <div
                className={`rounded-lg px-4 py-3 flex items-start gap-3 ${roleInfo.color} ring-1 ring-inset`}
            >
                <span className="text-2xl">{roleInfo.icon}</span>
                <div>
                    <p className="font-bold text-sm">{roleInfo.label}</p>
                    <p className="text-xs opacity-80">{roleInfo.description}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-x-4 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-[#044199] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#033378] disabled:opacity-50 transition"
                >
                    {loading
                        ? isEdit
                            ? "Saving..."
                            : "Creating..."
                        : isEdit
                            ? "Save Changes"
                            : "Create Team Member"}
                </button>
            </div>
        </form>
    );
}
