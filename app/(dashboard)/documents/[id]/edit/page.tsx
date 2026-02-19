"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface DocumentData {
    id: string;
    documentNumber: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    notes: string | null;
    contractTerms: string | null;
}

export default function EditDocumentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doc, setDoc] = useState<DocumentData | null>(null);

    const [form, setForm] = useState({
        status: "DRAFT",
        amount: "",
        currency: "SAR",
        notes: "",
    });

    useEffect(() => {
        fetch(`/api/documents/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setDoc(data);
                setForm({
                    status: data.status,
                    amount: String(data.amount),
                    currency: data.currency,
                    notes: data.notes || "",
                });
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load document");
                setLoading(false);
            });
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: form.status,
                    amount: parseFloat(form.amount),
                    currency: form.currency,
                    notes: form.notes || null,
                }),
            });

            if (!res.ok) throw new Error();

            toast.success("Document updated!");
            router.push(`/documents/${id}`);
        } catch {
            toast.error("Failed to update document");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Document deleted");
            router.push("/documents");
        } catch {
            toast.error("Failed to delete document");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Document not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/documents/${id}`}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    &larr; Back to Document
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    Edit {doc.documentNumber}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                {/* Document info */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${doc.type === "PROFORMA" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                            doc.type === "CONTRACT" ? "bg-purple-50 text-purple-700 ring-purple-600/20" :
                                "bg-green-50 text-green-700 ring-green-600/20"
                        }`}>
                        {doc.type}
                    </span>
                    <span className="text-sm text-gray-500">{doc.documentNumber}</span>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#044199] bg-white"
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
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
                        Notes
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
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors cursor-pointer"
                    >
                        🗑 Delete Document
                    </button>
                    <div className="flex gap-3">
                        <Link
                            href={`/documents/${id}`}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#044199] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
