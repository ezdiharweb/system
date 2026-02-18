"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface Settings {
    companyName: string;
    companyNameAr: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    taxNumber: string;
    logoUrl: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        companyName: "",
        companyNameAr: "",
        legalName: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        taxNumber: "",
        logoUrl: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                setSettings(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load settings");
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error();
            toast.success("Settings saved successfully!");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("logo", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setSettings((prev) => ({ ...prev, logoUrl: data.url }));
            toast.success("Logo uploaded!");
        } catch {
            toast.error("Failed to upload logo");
        } finally {
            setUploading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
            <p className="text-sm text-gray-500">
                This information will appear on your invoices, contracts, and proformas.
            </p>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Logo Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Company Logo</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                            {settings.logoUrl ? (
                                <img
                                    src={settings.logoUrl}
                                    alt="Company Logo"
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <span className="text-3xl text-gray-300">🏢</span>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                            >
                                {uploading ? "Uploading..." : "Upload Logo"}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                onChange={handleLogoUpload}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                PNG, JPG, WebP, or SVG. Recommended: 200×200px
                            </p>
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Company Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name (English)
                            </label>
                            <input
                                type="text"
                                value={settings.companyName}
                                onChange={(e) =>
                                    setSettings({ ...settings, companyName: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ezdiharweb"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم الشركة (عربي)
                            </label>
                            <input
                                type="text"
                                dir="rtl"
                                value={settings.companyNameAr}
                                onChange={(e) =>
                                    setSettings({ ...settings, companyNameAr: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="إزدهار ويب"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Legal Name
                            </label>
                            <input
                                type="text"
                                value={settings.legalName}
                                onChange={(e) =>
                                    setSettings({ ...settings, legalName: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Clicksalesmedia LLC"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Contact Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) =>
                                    setSettings({ ...settings, email: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="info@ezdiharweb.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={(e) =>
                                    setSettings({ ...settings, phone: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="+971 XX XXX XXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="text"
                                value={settings.website}
                                onChange={(e) =>
                                    setSettings({ ...settings, website: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="www.ezdiharweb.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tax Number
                            </label>
                            <input
                                type="text"
                                value={settings.taxNumber}
                                onChange={(e) =>
                                    setSettings({ ...settings, taxNumber: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Tax registration number"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                value={settings.address}
                                onChange={(e) =>
                                    setSettings({ ...settings, address: e.target.value })
                                }
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Company address"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}
