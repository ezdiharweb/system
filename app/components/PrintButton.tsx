"use client";

import { useState } from "react";

export default function PrintButton() {
    const [loading, setLoading] = useState(false);

    async function handleExportPDF() {
        setLoading(true);
        try {
            const element = document.querySelector(".print-document") as HTMLElement;
            if (!element) {
                alert("Document not found");
                return;
            }

            const html2canvasModule = await import("html2canvas");
            const html2canvas = html2canvasModule.default;
            const { jsPDF } = await import("jspdf");

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc: Document) => {
                    // Build a single regex that catches ALL modern CSS color functions:
                    // oklch(), oklab(), lab(), lch(), hwb(), color()
                    const colorFnRegex = /\b(?:oklch|oklab|lab|lch|hwb|color)\([^)]*\)/g;

                    // 1. Strip from all <style> tags
                    clonedDoc.querySelectorAll("style").forEach((style) => {
                        if (style.textContent) {
                            style.textContent = style.textContent.replace(colorFnRegex, "#666666");
                        }
                    });

                    // 2. Remove all external stylesheets that might contain modern colors
                    //    and inline critical styles instead
                    clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
                        link.remove();
                    });

                    // 3. Inject safe CSS that covers what we need for the document
                    const safeStyle = clonedDoc.createElement("style");
                    safeStyle.textContent = `
            * { box-sizing: border-box; }
            body { margin: 0; font-family: 'Cairo', sans-serif; }
            .print-document * {
              border-color: #e5e7eb !important;
            }
          `;
                    clonedDoc.head.appendChild(safeStyle);
                },
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.98);

            // Fit PDF page exactly to content — no blank space
            const a4Width = 210;
            const contentAspect = canvas.height / canvas.width;
            const pdfHeight = a4Width * contentAspect;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [a4Width, pdfHeight],
            });

            pdf.addImage(imgData, "JPEG", 0, 0, a4Width, pdfHeight);

            const docTitle = document.querySelector("h1")?.textContent || "document";
            pdf.save(`${docTitle}.pdf`);
        } catch (err) {
            console.error("PDF export error:", err);
            alert("PDF export failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleExportPDF}
            disabled={loading}
            className="bg-[#044199] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity no-print cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span> Generating...
                </>
            ) : (
                <>📥 Export PDF</>
            )}
        </button>
    );
}
