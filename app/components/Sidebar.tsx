"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, UserPlus, Settings, LogOut, CalendarDays } from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Social Media", href: "/social", icon: CalendarDays },
    { name: "Team", href: "/team", icon: UserPlus },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-[#044199] text-white">
            <div className="flex h-16 items-center justify-center border-b border-blue-800">
                <h1 className="text-xl font-bold">Ezdiharweb Admin</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-[#00c65e] text-white"
                                : "text-blue-100 hover:bg-blue-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-blue-800 p-4">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                    Sign out
                </button>
            </div>
        </div>
    );
}
