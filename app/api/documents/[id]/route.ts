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

        // Build update object — only include provided fields
        const updateData: Record<string, unknown> = {};
        if (json.status !== undefined) updateData.status = json.status;
        if (json.amount !== undefined) updateData.amount = json.amount;
        if (json.currency !== undefined) updateData.currency = json.currency;
        if (json.notes !== undefined) updateData.notes = json.notes;
        if (json.contractTerms !== undefined) updateData.contractTerms = json.contractTerms;

        const document = await prisma.document.update({
            where: { id },
            data: updateData,
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
