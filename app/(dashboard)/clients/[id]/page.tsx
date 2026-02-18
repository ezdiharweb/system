import { prisma } from "@/lib/prisma";
import ClientForm from "@/app/components/ClientForm";
import Link from "next/link";
import { FileText } from "lucide-react";
import DocumentGenerator from "@/app/components/DocumentGenerator";

export default async function ClientPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            documents: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!client) {
        return <div>Client not found</div>;
    }

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Client: {client.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Edit Client Form */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Client Details</h2>
                    <ClientForm client={client} users={users} isEdit />
                </div>

                {/* Documents Section */}
                <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                        <DocumentGenerator clientId={client.id} />
                    </div>

                    {client.documents.length === 0 ? (
                        <p className="text-sm text-gray-500">No documents generated yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {client.documents.map((doc) => (
                                <li key={doc.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{doc.type} - {doc.documentNumber}</p>
                                            <p className="text-xs text-gray-500">{doc.status} • {doc.createdAt.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link href={`/documents/${doc.id}`} className="text-sm text-primary hover:text-blue-900">
                                        View
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
