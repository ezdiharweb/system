"use client";

import { useSession } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                    Welcome back, {session?.user?.name || "User"}
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {session?.user?.role}
                </span>
            </div>
        </header>
    );
}
