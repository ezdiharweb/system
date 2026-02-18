import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>;
}) {
    const params = await searchParams;
    const search = params.search;
    const status = params.status;

    const clients = await prisma.client.findMany({
        where: {
            ...(status ? { status: status as any } : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { company: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        include: {
            accountManager: {
                select: { name: true },
            },
            _count: {
                select: { documents: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                <Link
                    href="/clients/new"
                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-colors"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add Client
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <form className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            placeholder="Search clients..."
                        />
                    </div>
                    <select
                        name="status"
                        defaultValue={status}
                        className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="LEAD">Lead</option>
                    </select>
                    <button type="submit" className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200">
                        Filter
                    </button>
                </form>
            </div>

            {/* Client List */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Account Manager</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    <Link href={`/clients/${client.id}`} className="hover:underline text-primary">
                                        {client.name}
                                    </Link>
                                    <div className="text-gray-500 font-normal">{client.email}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.company}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${client.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            client.status === 'INACTIVE' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                        }`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.accountManager?.name || '-'}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <Link href={`/clients/${client.id}`} className="text-primary hover:text-blue-900">
                                        View<span className="sr-only">, {client.name}</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-gray-500">
                                    No clients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
