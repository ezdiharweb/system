import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import PrintButton from "@/app/components/PrintButton";
import Image from "next/image";

async function getSettings() {
    let settings = await prisma.companySettings.findUnique({
        where: { id: "default" },
    });
    if (!settings) {
        settings = await prisma.companySettings.create({
            data: { id: "default" },
        });
    }
    return settings;
}

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [doc, company] = await Promise.all([
        prisma.document.findUnique({
            where: { id },
            include: { client: true, createdBy: true },
        }),
        getSettings(),
    ]);

    if (!doc) {
        notFound();
    }

    const isContract = doc.type === "CONTRACT";
    const isInvoice = doc.type === "INVOICE";
    const isProforma = doc.type === "PROFORMA";

    const typeLabel = isProforma
        ? "عرض سعر"
        : isContract
            ? "عقد خدمات"
            : "فاتورة ضريبية";

    const typeEnglish = isProforma
        ? "Proforma Invoice"
        : isContract
            ? "Service Agreement"
            : "Tax Invoice";

    return (
        <div style={{ fontFamily: "var(--font-cairo), 'Cairo', sans-serif" }}>
            {/* Top Bar — hidden from PDF */}
            <div className="no-print flex items-center justify-between mb-4">
                <div>
                    <Link
                        href="/documents"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        &larr; Back to Documents
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-1">
                        {doc.documentNumber}
                    </h1>
                </div>
                <PrintButton />
            </div>

            {/* ═══════════════ SINGLE A4 DOCUMENT ═══════════════ */}
            <div
                className="print-document bg-white shadow-xl rounded-2xl overflow-hidden"
                dir="rtl"
                style={{
                    fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
                    maxWidth: "210mm",
                    margin: "0 auto",
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #044199 0%, #022a63 100%)",
                        padding: "20px 28px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        direction: "rtl",
                    }}
                >
                    <div>
                        <div
                            className="inline-block px-4 py-1.5 rounded-md text-white font-bold text-base"
                            style={{ background: "rgba(255,255,255,0.18)" }}
                        >
                            {typeLabel}
                        </div>
                        <p className="text-blue-200 text-xs mt-1">{typeEnglish}</p>
                    </div>
                    <div>
                        {company.logoUrl ? (
                            <Image
                                src={company.logoUrl}
                                alt="Logo"
                                width={120}
                                height={48}
                                className="object-contain"
                                style={{ maxHeight: 48 }}
                            />
                        ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 6, background: "rgba(255,255,255,0.1)" }} />
                        )}
                    </div>
                </div>

                {/* ── Meta Strip ── */}
                <div
                    style={{
                        background: "#f0f5ff",
                        padding: "12px 28px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #e5e7eb",
                        direction: "rtl",
                    }}
                >
                    <div style={{ display: "flex", gap: "32px" }}>
                        <div>
                            <span style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: 2 }}>رقم المستند</span>
                            <span style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }} dir="ltr">{doc.documentNumber}</span>
                        </div>
                        <div>
                            <span style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: 2 }}>التاريخ</span>
                            <span style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }} dir="ltr">
                                {format(doc.createdAt, "dd/MM/yyyy")}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                        <span style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: 2 }}>الإجمالي</span>
                        <span style={{ fontWeight: 800, fontSize: "18px", color: "#044199" }} dir="ltr">
                            {Number(doc.amount).toLocaleString()} {doc.currency}
                        </span>
                    </div>
                </div>

                {/* ── Client Info ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        padding: "16px 28px",
                        borderBottom: "1px solid #f3f4f6",
                        direction: "rtl",
                    }}
                >
                    <div>
                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#044199", marginBottom: 4, letterSpacing: "0.05em" }}>
                            من
                        </h3>
                        <p style={{ fontWeight: 700, color: "#111827", fontSize: "14px", margin: "2px 0" }}>
                            {company.companyName || "Ezdiharweb"}
                        </p>
                        <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>
                            {company.legalName || "Clicksalesmedia LLC"}
                        </p>
                        <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0" }}>
                            {company.email || "info@ezdiharweb.com"}
                        </p>
                        {company.phone && (
                            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0" }} dir="ltr">{company.phone}</p>
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#044199", marginBottom: 4, letterSpacing: "0.05em" }}>
                            العميل
                        </h3>
                        <p style={{ fontWeight: 700, color: "#111827", fontSize: "14px", margin: "2px 0" }}>
                            {doc.client.company || doc.client.name}
                        </p>
                        <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>{doc.client.name}</p>
                        {doc.client.email && (
                            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0" }}>{doc.client.email}</p>
                        )}
                    </div>
                </div>

                {/* ── Package Title ── */}
                <div style={{ padding: "12px 28px 4px" }}>
                    <h2 className="text-base font-extrabold text-gray-900">
                        باقة استراتيجية النمو
                        <span className="text-xs text-gray-400 font-normal mr-2">
                            Growth Strategy Package
                        </span>
                    </h2>
                </div>

                {/* ── Compact Service Grid ── */}
                <div style={{ padding: "8px 28px 12px" }}>
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* Card 1 */}
                        <div className="rounded-lg border border-gray-100 p-3" style={{ borderRight: "3px solid #044199" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#044199", fontSize: "10px" }}>١</span>
                                <span className="font-bold text-gray-900 text-xs">الهوية الرقمية</span>
                            </div>
                            <div className="space-y-0.5 text-xs text-gray-600">
                                <p>✓ استراتيجية تسويقية شاملة</p>
                                <p>✓ تصميم الشعار والعلامة التجارية</p>
                                <p>✓ موقع إلكتروني فائق السرعة</p>
                                <p>✓ صفحة هبوط بيعية + استضافة مجانية</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="rounded-lg border border-gray-100 p-3" style={{ borderRight: "3px solid #00c65e" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#00c65e", fontSize: "10px" }}>٢</span>
                                <span className="font-bold text-gray-900 text-xs">التواصل الاجتماعي</span>
                            </div>
                            <div className="space-y-0.5 text-xs text-gray-600">
                                <p>✓ خطة محتوى شهرية (١٥ منتجاً)</p>
                                <p>✓ 6 منشورات جرافيك + 6 قصص</p>
                                <p>✓ 3 فيديوهات ريلز سينمائية</p>
                                <p>✓ إدارة كاملة للحسابات</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="rounded-lg border border-gray-100 p-3" style={{ borderRight: "3px solid #f59e0b" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#f59e0b", fontSize: "10px" }}>٣</span>
                                <span className="font-bold text-gray-900 text-xs">محركات البحث</span>
                            </div>
                            <div className="space-y-0.5 text-xs text-gray-600">
                                <p>✓ تحليل المنافسين و SEO</p>
                                <p>✓ إعداد Google Business</p>
                                <p>✓ الربط مع Search Console</p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="rounded-lg border border-gray-100 p-3" style={{ borderRight: "3px solid #ef4444" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#ef4444", fontSize: "10px" }}>٤</span>
                                <span className="font-bold text-gray-900 text-xs">الإعلانات المدفوعة</span>
                            </div>
                            <div className="space-y-0.5 text-xs text-gray-600">
                                <p>✓ سناب شات، إنستغرام، فيسبوك</p>
                                <p>✓ حملات Google Ads</p>
                                <p>✓ استهداف متقدم + محتوى محلي</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: AI */}
                    <div className="rounded-lg border border-gray-100 p-3 mt-2.5" style={{ borderRight: "3px solid #8b5cf6" }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#8b5cf6", fontSize: "10px" }}>٥</span>
                            <span className="font-bold text-gray-900 text-xs">الذكاء الاصطناعي والأتمتة</span>
                        </div>
                        <div className="flex gap-6 text-xs text-gray-600">
                            <p>✓ شات بوت ذكي 24/7</p>
                            <p>✓ تكامل واتساب</p>
                            <p>✓ تقارير أسبوعية للأداء</p>
                        </div>
                    </div>
                </div>

                {/* ── Pricing Table ── */}
                <div style={{ padding: "0 28px 6px" }}>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                        <table className="w-full" style={{ fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#044199" }}>
                                    <th className="p-2.5 text-right text-white font-bold">الوصف</th>
                                    <th className="p-2.5 text-center text-white font-bold w-20">الكمية</th>
                                    <th className="p-2.5 text-left text-white font-bold w-36">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-2.5">
                                        <span className="font-bold text-gray-900">باقة استراتيجية النمو الشهرية</span>
                                        <span className="text-gray-400 text-xs mr-2">Monthly</span>
                                    </td>
                                    <td className="p-2.5 text-center text-gray-600">1</td>
                                    <td className="p-2.5 text-left font-bold text-gray-900" dir="ltr">
                                        {Number(doc.amount).toLocaleString()} {doc.currency}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f0f5ff" }}>
                                    <td className="p-2.5 font-bold text-gray-600" colSpan={2}>الإجمالي / Total</td>
                                    <td className="p-2.5 text-left font-extrabold text-[#044199]" dir="ltr">
                                        {Number(doc.amount).toLocaleString()} {doc.currency}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        * غير شامل ضريبة القيمة المضافة إلا إذا ذكر خلاف ذلك
                        {company.taxNumber && (
                            <span className="mr-2">| الرقم الضريبي: {company.taxNumber}</span>
                        )}
                    </p>
                </div>

                {/* ── Contract Terms ── */}
                {isContract && (
                    <div style={{ padding: "0 28px 12px" }}>
                        <div className="rounded-lg border border-gray-200 p-4" style={{ background: "#fafafa" }}>
                            <h3 className="text-sm font-extrabold text-gray-900 mb-2">
                                الشروط والأحكام
                            </h3>
                            <div className="space-y-1 text-xs text-gray-600">
                                <p><strong>١.</strong> مدة العقد شهري ويتجدد تلقائياً ما لم يتم الإلغاء.</p>
                                <p><strong>٢.</strong> يتم سداد قيمة الباقة مقدماً بداية كل شهر.</p>
                                <p><strong>٣.</strong> يمكن الإلغاء في أي وقت قبل موعد التجديد.</p>
                                <p><strong>٤.</strong> جميع الأصول الرقمية مملوكة بالكامل للعميل.</p>
                                <p><strong>٥.</strong> لا نضمن مبيعات محددة حيث تعتمد على عوامل السوق.</p>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="mt-6 grid grid-cols-2 gap-12 px-2">
                            <div>
                                <p className="text-xs font-bold text-[#044199] mb-1">الطرف الأول</p>
                                <p className="text-xs text-gray-700">
                                    {company.companyName || "Ezdiharweb"} / {company.legalName || "Clicksalesmedia LLC"}
                                </p>
                                <div className="mt-8 border-b-2 border-gray-300"></div>
                                <p className="text-xs text-gray-400 mt-0.5">التوقيع والختم</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#044199] mb-1">الطرف الثاني</p>
                                <p className="text-xs text-gray-700">{doc.client.company || doc.client.name}</p>
                                <div className="mt-8 border-b-2 border-gray-300"></div>
                                <p className="text-xs text-gray-400 mt-0.5">التوقيع والختم</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Invoice Payment ── */}
                {isInvoice && (
                    <div style={{ padding: "0 28px 12px" }}>
                        <div className="rounded-lg border border-gray-200 p-4" style={{ background: "#fafafa" }}>
                            <h3 className="text-sm font-extrabold text-gray-900 mb-1">
                                تعليمات الدفع
                            </h3>
                            <p className="text-xs text-gray-600">يرجى التواصل للحصول على تفاصيل التحويل البنكي — الموعد النهائي: خلال 7 أيام</p>
                        </div>
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="document-footer" style={{ borderTop: "2px solid #044199" }}>
                    {/* Tax note */}
                    <div
                        style={{
                            padding: "8px 28px",
                            background: "#f8fafc",
                            textAlign: "center",
                            direction: "rtl",
                        }}
                    >
                        <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                            * غير شامل ضريبة القيمة المضافة إلا إذا ذُكر خلاف ذلك
                        </p>
                    </div>

                    {/* Main footer */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #044199 0%, #022a63 100%)",
                            padding: "16px 28px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            direction: "rtl",
                            gap: "16px",
                        }}
                    >
                        {/* Company info */}
                        <div style={{ flex: 1 }}>
                            <p style={{ color: "white", fontSize: "12px", fontWeight: 700, margin: "0 0 4px 0" }}>
                                {company.companyNameAr || company.companyName || "إزدهار ويب"}
                            </p>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                {company.legalName || "Clicksalesmedia LLC"}
                            </p>
                            {company.address && (
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", margin: "2px 0 0 0" }}>
                                    {company.address}
                                </p>
                            )}
                        </div>

                        {/* Contact */}
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", margin: "0 0 3px 0" }}>
                                {company.email || "info@ezdiharweb.com"}
                            </p>
                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", margin: "0 0 3px 0" }}>
                                {company.website || "www.ezdiharweb.com"}
                            </p>
                            {company.phone && (
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", margin: 0 }} dir="ltr">
                                    {company.phone}
                                </p>
                            )}
                        </div>

                        {/* Legal / Tax info */}
                        <div style={{ flex: 1, textAlign: "left" }}>
                            {company.taxNumber && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Tax No: </span>
                                    <span dir="ltr">{company.taxNumber}</span>
                                </p>
                            )}
                            {(company as unknown as Record<string, string>).licenceNumber && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Licence: </span>
                                    <span dir="ltr">{(company as unknown as Record<string, string>).licenceNumber}</span>
                                </p>
                            )}
                            {(company as unknown as Record<string, string>).trn && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>TRN: </span>
                                    <span dir="ltr">{(company as unknown as Record<string, string>).trn}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
