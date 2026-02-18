import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const clientCount = await prisma.client.count();
    const documentCount = await prisma.document.count();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Clients */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-3xl font-bold text-primary">{clientCount}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                    </div>
                </div>

                {/* Card 2: Total Documents */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-3xl font-bold text-secondary">{documentCount}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Documents Generated</h3>
                    </div>
                </div>

                {/* Card 3: Pending Tasks (Mock) */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-3xl font-bold text-orange-500">0</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Pending Actions</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
