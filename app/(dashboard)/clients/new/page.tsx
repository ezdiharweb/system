import { prisma } from "@/lib/prisma";
import ClientForm from "@/app/components/ClientForm";

export default async function NewClientPage() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
    });

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900">Add New Client</h1>
            <ClientForm users={users} />
        </div>
    );
}
