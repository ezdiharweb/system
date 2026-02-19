"use client";

import { useState } from "react";

export default function PrintButton() {
    const [loading, setLoading] = useState(false);

    function handleExportPDF() {
        setLoading(true);

        // Use the browser's native print dialog — it handles Arabic, RTL, 
        // fonts, and modern CSS perfectly, unlike html2canvas which rasterizes poorly
        setTimeout(() => {
            window.print();
            setLoading(false);
        }, 300);
    }

    return (
        <button
            onClick={handleExportPDF}
            disabled={loading}
            className="bg-[#044199] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity no-print cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span> Preparing...
                </>
            ) : (
                <>📥 Export PDF</>
            )}
        </button>
    );
}
