"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FilePlus } from "lucide-react";

interface DocumentGeneratorProps {
    clientId: string;
}

export default function DocumentGenerator({ clientId }: DocumentGeneratorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const generateDocument = async (type: "PROFORMA" | "CONTRACT" | "INVOICE") => {
        setLoading(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ clientId, type }),
            });

            if (!res.ok) {
                throw new Error("Failed to generate document");
            }

            const doc = await res.json();
            toast.success(`${type} generated successfully`);
            router.refresh(); // Refresh to show new document in list
            // Optionally redirect to view it immediately
            // router.push(`/documents/${doc.id}`);
        } catch (error) {
            toast.error("Error generating document");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => generateDocument("PROFORMA")}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
                <FilePlus className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                Proforma
            </button>
            <button
                onClick={() => generateDocument("CONTRACT")}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
                <FilePlus className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                Contract
            </button>
            <button
                onClick={() => generateDocument("INVOICE")}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
                <FilePlus className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                Invoice
            </button>
        </div>
    );
}
