"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Client } from "@prisma/client";

interface ClientFormProps {
    client?: Client;
    users: Partial<User>[];
    isEdit?: boolean;
}

export default function ClientForm({ client, users, isEdit = false }: ClientFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: client?.name || "",
        company: client?.company || "",
        email: client?.email || "",
        whatsapp: client?.whatsapp || "",
        status: client?.status || "LEAD",
        accountManagerId: client?.accountManagerId || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/api/clients/${client?.id}` : "/api/clients";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to save client");
            }

            toast.success(isEdit ? "Client updated" : "Client created");
            router.push("/clients");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                        Client Name *
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
                        Company Name
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="company"
                            id="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Email
                    </label>
                    <div className="mt-2">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="whatsapp" className="block text-sm font-medium leading-6 text-gray-900">
                        WhatsApp Number
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                        Status
                    </label>
                    <div className="mt-2">
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        >
                            <option value="LEAD">Lead</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="accountManagerId" className="block text-sm font-medium leading-6 text-gray-900">
                        Account Manager
                    </label>
                    <div className="mt-2">
                        <select
                            id="accountManagerId"
                            name="accountManagerId"
                            value={formData.accountManagerId}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        >
                            <option value="">Select Manager</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id!}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-x-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-semibold leading-6 text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
                </button>
            </div>
        </form>
    );
}
