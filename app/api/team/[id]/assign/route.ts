import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { canAssignClients } from "@/lib/permissions";

// POST — assign clients to this team member
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !canAssignClients(session.user.role)) {
        return new NextResponse("Unauthorized — only Senior AM, Admin, or Super Admin can assign clients", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { clientIds } = body; // string[]

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return NextResponse.json(
            { error: "clientIds array is required" },
            { status: 400 }
        );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, name: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Assign all provided clients to this user
    const result = await prisma.client.updateMany({
        where: { id: { in: clientIds } },
        data: { accountManagerId: id },
    });

    return NextResponse.json({
        success: true,
        assigned: result.count,
        message: `Assigned ${result.count} client(s) to ${user.name}`,
    });
}

// DELETE — remove client assignment from this team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !canAssignClients(session.user.role)) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
        return NextResponse.json(
            { error: "clientId query param is required" },
            { status: 400 }
        );
    }

    await prisma.client.update({
        where: { id: clientId },
        data: { accountManagerId: null },
    });

    return NextResponse.json({ success: true, message: "Client unassigned" });
}
