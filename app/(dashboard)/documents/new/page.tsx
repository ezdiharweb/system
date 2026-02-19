"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Client {
    id: string;
    name: string;
    company: string | null;
}

export default function NewDocumentPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        type: "PROFORMA" as "PROFORMA" | "INVOICE" | "CONTRACT",
        clientId: "",
        amount: "1190",
        currency: "SAR",
        notes: "",
    });

    useEffect(() => {
        fetch("/api/clients")
            .then((r) => r.json())
            .then((data) => {
                setClients(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load clients");
                setLoading(false);
            });
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.clientId) {
            toast.error("Please select a client");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: form.type,
                    clientId: form.clientId,
                    amount: parseFloat(form.amount) || 1190,
                    currency: form.currency,
                    notes: form.notes,
                }),
            });

            if (!res.ok) throw new Error();

            const doc = await res.json();
            toast.success("Document created!");
            router.push(`/documents/${doc.id}`);
        } catch {
            toast.error("Failed to create document");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href="/documents"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    &larr; Back to Documents
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">Create New Document</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                {/* Document Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {(["PROFORMA", "INVOICE", "CONTRACT"] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm({ ...form, type })}
                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${form.type === type
                                        ? type === "PROFORMA"
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : type === "CONTRACT"
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    }`}
                            >
                                {type === "PROFORMA" && "📋 عرض سعر"}
                                {type === "INVOICE" && "🧾 فاتورة"}
                                {type === "CONTRACT" && "📄 عقد خدمات"}
                                <span className="block text-xs mt-0.5 opacity-70">
                                    {type === "PROFORMA" && "Proforma"}
                                    {type === "INVOICE" && "Invoice"}
                                    {type === "CONTRACT" && "Contract"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Client Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client
                    </label>
                    <select
                        value={form.clientId}
                        onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199] bg-white"
                    >
                        <option value="">Select a client...</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.company ? `${client.company} — ${client.name}` : client.name}
                            </option>
                        ))}
                    </select>
                    {clients.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            No clients found. <Link href="/clients/new" className="underline">Create a client first</Link>
                        </p>
                    )}
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199]"
                            placeholder="1190"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                        </label>
                        <select
                            value={form.currency}
                            onChange={(e) => setForm({ ...form, currency: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199] bg-white"
                        >
                            <option value="SAR">SAR — Saudi Riyal</option>
                            <option value="AED">AED — UAE Dirham</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="QAR">QAR — Qatari Riyal</option>
                            <option value="KWD">KWD — Kuwaiti Dinar</option>
                            <option value="OMR">OMR — Omani Rial</option>
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199] resize-none"
                        placeholder="Additional notes..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Link
                        href="/documents"
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#044199] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? "Creating..." : "Create Document"}
                    </button>
                </div>
            </form>
        </div>
    );
}
