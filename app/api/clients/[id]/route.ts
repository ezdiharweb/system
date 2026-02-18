import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: {
            id,
        },
        include: {
            accountManager: {
                select: { id: true, name: true, email: true },
            },
            documents: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!client) {
        return new NextResponse("Client not found", { status: 404 });
    }

    return NextResponse.json(client);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const json = await request.json();
        const client = await prisma.client.update({
            where: {
                id,
            },
            data: {
                name: json.name,
                company: json.company || null,
                email: json.email || null,
                whatsapp: json.whatsapp || null,
                status: json.status,
                accountManagerId: json.accountManagerId || null,
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        console.error("Error updating client:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        await prisma.client.delete({
            where: {
                id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting client:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
