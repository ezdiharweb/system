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

    const document = await prisma.document.findUnique({
        where: { id },
        include: {
            client: true,
            createdBy: {
                select: { name: true, email: true },
            },
        },
    });

    if (!document) {
        return new NextResponse("Document not found", { status: 404 });
    }

    return NextResponse.json(document);
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
        const document = await prisma.document.update({
            where: { id },
            data: {
                status: json.status,
                amount: json.amount,
                notes: json.notes,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error updating document:", error);
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
        await prisma.document.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting document:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
