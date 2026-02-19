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
                <div className="flex items-center gap-3">
                    <Link
                        href={`/documents/${doc.id}/edit`}
                        className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        ✏️ Edit
                    </Link>
                    <PrintButton />
                </div>
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
                            {isContract ? "الطرف الأول (مقدم الخدمة)" : "من"}
                        </h3>
                        <p style={{ fontWeight: 700, color: "#111827", fontSize: "14px", margin: "2px 0" }}>
                            {company.companyNameAr || company.companyName || "إزدهار ويب"}
                        </p>
                        <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>
                            {company.legalName || "Clicksalesmedia LLC"}
                        </p>
                        {company.representativeName && (
                            <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>
                                يمثلها: {company.representativeName}
                            </p>
                        )}
                        <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0" }}>
                            {company.email || "info@ezdiharweb.com"}
                        </p>
                        {company.phone && (
                            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0" }} dir="ltr">{company.phone}</p>
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#044199", marginBottom: 4, letterSpacing: "0.05em" }}>
                            {isContract ? "الطرف الثاني (العميل)" : "العميل"}
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

                {/* ═══ CONTRACT-SPECIFIC CONTENT ═══ */}
                {isContract && (
                    <div style={{ padding: "16px 28px" }}>
                        {/* Contract Title */}
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#044199", textAlign: "center", marginBottom: 12 }}>
                            عقد تقديم خدمات تسويق رقمي متكاملة (باقة استراتيجية النمو)
                        </h2>

                        {/* تمهيد */}
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.8 }}>
                                بناءً على رغبة الطرف الثاني في تطوير أعماله رقمياً، وافق الطرف الأول على تقديم &quot;باقة استراتيجية النمو&quot; وفقاً للشروط والأحكام الموضحة في هذا العقد.
                            </p>
                        </div>

                        {/* البند الأول */}
                        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderRight: "3px solid #044199" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#044199", marginBottom: 6 }}>
                                البند الأول: نطاق العمل (الخدمات المقدمة)
                            </h3>
                            <p style={{ fontSize: "11px", color: "#374151", lineHeight: 1.8, marginBottom: 6 }}>
                                يلتزم الطرف الأول بتقديم الخدمات التالية بشكل شهري طوال فترة سريان العقد:
                            </p>
                            <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.9 }}>
                                <p><strong>الهوية والعلامة التجارية:</strong> إعداد خطة تسويقية، تصميم الشعار والهوية (بطاقات وأوراق رسمية)، وكتابة وتصميم ملف الشركة (Profile).</p>
                                <p><strong>المواقع الإلكترونية:</strong> تصميم موقع إلكتروني وصفحة هبوط بيعية سريعة التجاوب، مع توفير استضافة مُدارة.</p>
                                <p><strong>إدارة وسائل التواصل الاجتماعي:</strong> إدارة الحسابات، النشر المجدول، وتقديم 15 منتجاً شهرياً (6 منشورات جرافيك، 6 قصص تفاعلية، 3 فيديوهات ريلز).</p>
                                <p><strong>تحسين محركات البحث (SEO):</strong> إعداد ملف جوجل التجاري (GMB) وتحسينه، وربط الموقع بأدوات مشرفي المواقع (Search Console).</p>
                                <p><strong>التسويق عبر الأداء:</strong> إدارة الحملات الإعلانية على (سناب شات، إنستغرام، فيسبوك، وجوجل) واستهداف الجمهور المناسب.</p>
                                <p><strong>ركن الابتكار والذكاء الاصطناعي:</strong> دمج &quot;شات بوت&quot; ذكي للرد على العملاء، أزرار الربط المباشر بواتساب، وتقديم تقارير أداء أسبوعية.</p>
                            </div>
                        </div>

                        {/* البند الثاني */}
                        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderRight: "3px solid #00c65e" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#00c65e", marginBottom: 6 }}>
                                البند الثاني: الالتزامات المالية
                            </h3>
                            <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.9 }}>
                                <p>تبلغ قيمة هذه الباقة <strong>{Number(doc.amount).toLocaleString()} {doc.currency}</strong> (غير شاملة ضريبة القيمة المضافة إن وجدت) تُدفع شهرياً ومقدماً في بداية كل دورة فوترة.</p>
                                <p style={{ marginTop: 4 }}><strong>ميزانية الإعلانات:</strong> الرسوم المذكورة أعلاه هي مقابل &quot;الإدارة الفنية والتنفيذية&quot; فقط. يلتزم الطرف الثاني بدفع ميزانية الحملات الإعلانية (Ad Spend) مباشرة للمنصات (جوجل، ميتا، سناب شات)، ولا يتحمل الطرف الأول أي مسؤولية مالية تخص تلك المنصات.</p>
                            </div>
                        </div>

                        {/* البند الثالث */}
                        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderRight: "3px solid #f59e0b" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#f59e0b", marginBottom: 6 }}>
                                البند الثالث: الشروط الاستثنائية وتحديد النطاق
                            </h3>
                            <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.9 }}>
                                <p><strong>أ. حدود التعديلات والتصميم:</strong> يتم تزويد العميل بنموذج أولي لكل تصميم. يحق للعميل طلب تعديلين اثنين فقط لكل تصميم. أي تعديلات إضافية تُحسب كخدمة إضافية منفصلة.</p>
                                <p><strong>ب. الاستضافة المجانية مدى الحياة:</strong> تعني أن الطرف الأول يوفر استضافة مجانية وخادماً مداراً لموقع العميل &quot;مدى حياة اشتراكه الفعال&quot; في هذه الباقة. في حال الإلغاء، يتم تسليم العميل ملفات الموقع.</p>
                                <p><strong>ج. المواقع والصفحات غير المحدودة:</strong> يقوم الطرف الأول ببناء وإطلاق الموقع مع إدخال عدد (10) منتجات/صفحات مبدئية. القدرة على إضافة صفحات لا محدودة تكون عبر لوحة تحكم العميل.</p>
                                <p><strong>د. نتائج من الشهر الأول:</strong> تضمن الوكالة تحقيق نتائج تشغيلية وتسويقية ملموسة. ولكن لا يضمن الطرف الأول نسبة مبيعات أو أرباح محددة.</p>
                                <p><strong>هـ. المحتوى المُقدم:</strong> يُعتبر تسليم الـ 15 منتجاً شهرياً مستوفياً فور نشرها واعتمادها من العميل، ولا تُرحل المنشورات غير المستخدمة إلى الشهر التالي.</p>
                            </div>
                        </div>

                        {/* البند الرابع */}
                        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderRight: "3px solid #ef4444" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444", marginBottom: 6 }}>
                                البند الرابع: مدة العقد والإلغاء
                            </h3>
                            <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.9 }}>
                                <p>يسري هذا العقد شهرياً (Month-to-Month) ويُجدد تلقائياً.</p>
                                <p>يحق للطرفين الإلغاء في أي وقت بدون عقود طويلة الأجل، بشرط إشعار الطرف الآخر كتابياً قبل (14) يوماً من تاريخ استحقاق الفاتورة التالية. في حال الإلغاء أثناء الدورة الشهرية النشطة، لا يتم استرداد المبلغ المدفوع عن الشهر الحالي، ويستمر تقديم الخدمة حتى نهاية الدورة.</p>
                            </div>
                        </div>

                        {/* البند الخامس */}
                        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderRight: "3px solid #8b5cf6" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#8b5cf6", marginBottom: 6 }}>
                                البند الخامس: أحكام عامة
                            </h3>
                            <p style={{ fontSize: "11px", color: "#374151", lineHeight: 1.9 }}>
                                تم قراءة هذا العقد والموافقة على كافة بنوده، وصار نافذاً من تاريخ توقيعه أدناه.
                            </p>
                        </div>

                        {/* ── Signatures ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", padding: "0 8px", marginBottom: 8 }}>
                            {/* الطرف الأول */}
                            <div style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                                <p style={{ fontSize: "12px", fontWeight: 800, color: "#044199", marginBottom: 8 }}>عن الطرف الأول (إزدهار ويب)</p>
                                <div style={{ fontSize: "11px", color: "#374151", lineHeight: 2 }}>
                                    <p>الاسم: {company.representativeName || "_______________"}</p>
                                </div>
                                {/* Stamp & Signature images */}
                                <div style={{ display: "flex", gap: "12px", marginTop: 8, minHeight: 60 }}>
                                    {company.stampUrl && (
                                        <img src={company.stampUrl} alt="Company Stamp" style={{ height: 60, objectFit: "contain" }} />
                                    )}
                                    {company.signatureUrl && (
                                        <img src={company.signatureUrl} alt="Signature" style={{ height: 60, objectFit: "contain" }} />
                                    )}
                                </div>
                                {!company.stampUrl && !company.signatureUrl && (
                                    <>
                                        <div style={{ marginTop: 24, borderBottom: "2px solid #d1d5db" }}></div>
                                        <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 2 }}>التوقيع والختم</p>
                                    </>
                                )}
                            </div>

                            {/* الطرف الثاني */}
                            <div style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                                <p style={{ fontSize: "12px", fontWeight: 800, color: "#044199", marginBottom: 8 }}>عن الطرف الثاني (العميل)</p>
                                <div style={{ fontSize: "11px", color: "#374151", lineHeight: 2 }}>
                                    <p>الاسم: {doc.client.company || doc.client.name}</p>
                                </div>
                                <div style={{ marginTop: 24, borderBottom: "2px solid #d1d5db" }}></div>
                                <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: 2 }}>التوقيع والختم</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ INVOICE / PROFORMA CONTENT ═══ */}
                {!isContract && (
                    <>
                        {/* Package Title */}
                        <div className="text-center" style={{ padding: "10px 28px 4px" }}>
                            <h2 className="text-base font-extrabold text-gray-900">
                                باقة استراتيجية النمو{" "}
                                <span className="text-gray-400 text-sm font-normal">
                                    Growth Strategy Package
                                </span>
                            </h2>
                        </div>

                        {/* Compact Service Grid */}
                        <div style={{ padding: "8px 28px 12px" }}>
                            <div className="grid grid-cols-2 gap-2.5">
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

                        {/* Pricing Table */}
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

                        {/* Invoice Payment */}
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
                    </>
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

                        <div style={{ flex: 1, textAlign: "left" }}>
                            {company.taxNumber && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Tax No: </span>
                                    <span dir="ltr">{company.taxNumber}</span>
                                </p>
                            )}
                            {company.licenceNumber && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Licence: </span>
                                    <span dir="ltr">{company.licenceNumber}</span>
                                </p>
                            )}
                            {company.trn && (
                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: "0 0 2px 0" }}>
                                    <span style={{ color: "rgba(255,255,255,0.4)" }}>TRN: </span>
                                    <span dir="ltr">{company.trn}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
