import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function DocumentsPage() {
    const documents = await prisma.document.findMany({
        include: {
            client: {
                select: { name: true, company: true },
            },
            createdBy: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Document #</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                        {doc.documentNumber}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${doc.type === "PROFORMA" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                                            doc.type === "CONTRACT" ? "bg-purple-50 text-purple-700 ring-purple-600/20" :
                                                "bg-green-50 text-green-700 ring-green-600/20"
                                        }`}>
                                        {doc.type}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {doc.client.company || doc.client.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                    {Number(doc.amount).toLocaleString()} {doc.currency}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${doc.status === "PAID" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                            doc.status === "SENT" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" :
                                                doc.status === "CANCELLED" ? "bg-red-50 text-red-700 ring-red-600/20" :
                                                    "bg-gray-50 text-gray-600 ring-gray-500/10"
                                        }`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {doc.createdAt.toLocaleDateString()}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <Link href={`/documents/${doc.id}`} className="text-[#044199] hover:text-blue-900">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-gray-500">
                                    No documents generated yet. Go to a client&apos;s page to generate a document.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
