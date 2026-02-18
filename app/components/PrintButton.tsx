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

            // Temporarily force fixed width for A4 rendering
            const originalWidth = element.style.width;
            const originalMaxWidth = element.style.maxWidth;
            element.style.width = "794px";    // A4 at 96dpi
            element.style.maxWidth = "794px";

            const canvas = await html2canvas(element, {
                scale: 2.5,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 794,
                onclone: (clonedDoc: Document) => {
                    // RegExp to catch ALL modern CSS color functions html2canvas can't parse
                    const colorFnRegex = /\b(?:oklch|oklab|lab|lch|hwb|color)\([^)]*\)/g;

                    // 1. Extract CSS from external stylesheets, sanitize, and re-inject as inline
                    const extractedCSS: string[] = [];
                    clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
                        try {
                            // Find the matching stylesheet from the original document
                            const href = (link as HTMLLinkElement).href;
                            for (let i = 0; i < document.styleSheets.length; i++) {
                                const sheet = document.styleSheets[i];
                                if (sheet.href && (sheet.href === href || href.includes(sheet.href.split('/').pop() || '___'))) {
                                    try {
                                        const rules = sheet.cssRules || sheet.rules;
                                        for (let j = 0; j < rules.length; j++) {
                                            extractedCSS.push(rules[j].cssText);
                                        }
                                    } catch { /* cross-origin, skip */ }
                                    break;
                                }
                            }
                        } catch { /* skip */ }
                        link.remove();
                    });

                    // 2. Fix inline <style> tags
                    clonedDoc.querySelectorAll("style").forEach((style) => {
                        if (style.textContent) {
                            style.textContent = style.textContent.replace(colorFnRegex, "#666666");
                        }
                    });

                    // 3. Inject extracted + sanitized CSS
                    if (extractedCSS.length > 0) {
                        const extractedStyle = clonedDoc.createElement("style");
                        extractedStyle.textContent = extractedCSS.join("\n").replace(colorFnRegex, "#666666");
                        clonedDoc.head.appendChild(extractedStyle);
                    }

                    // 4. Force print-document to be exactly A4 width
                    const clonedEl = clonedDoc.querySelector(".print-document") as HTMLElement;
                    if (clonedEl) {
                        clonedEl.style.width = "794px";
                        clonedEl.style.maxWidth = "794px";
                        clonedEl.style.margin = "0";
                        clonedEl.style.boxShadow = "none";
                        clonedEl.style.borderRadius = "0";
                    }

                    // 5. Inject additional safe overrides
                    const safeStyle = clonedDoc.createElement("style");
                    safeStyle.textContent = `
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 0; }

                        .print-document {
                            font-family: 'Cairo', 'Noto Sans Arabic', sans-serif !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-document * {
                            font-family: 'Cairo', 'Noto Sans Arabic', sans-serif !important;
                        }

                        .no-print { display: none !important; }

                        [dir="rtl"] { direction: rtl; text-align: right; }
                        [dir="ltr"] { direction: ltr; text-align: left; }

                        .grid { display: grid !important; }
                        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                        .flex { display: flex !important; }

                        [style*="background"] { -webkit-print-color-adjust: exact; }
                    `;
                    clonedDoc.head.appendChild(safeStyle);
                },
            });

            // Restore original styles
            element.style.width = originalWidth;
            element.style.maxWidth = originalMaxWidth;

            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            // Fixed A4 page: 210mm x 297mm
            const a4Width = 210;
            const a4Height = 297;

            // Calculate image dimensions to fit A4 width
            const imgWidth = a4Width;
            const imgHeight = (canvas.height / canvas.width) * a4Width;

            // Create proper A4 PDF
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // If content fits in one page
            if (imgHeight <= a4Height) {
                pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
            } else {
                // Multi-page: split content across A4 pages
                let remainingHeight = imgHeight;
                let position = 0;

                while (remainingHeight > 0) {
                    if (position > 0) {
                        pdf.addPage("a4", "portrait");
                    }
                    pdf.addImage(imgData, "JPEG", 0, -position, imgWidth, imgHeight);
                    remainingHeight -= a4Height;
                    position += a4Height;
                }
            }

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
