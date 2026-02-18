import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// GET single team member with assigned clients
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            phone: true,
            avatar: true,
            createdAt: true,
            clients: {
                select: {
                    id: true,
                    name: true,
                    company: true,
                    email: true,
                    status: true,
                    socialProfile: {
                        select: {
                            id: true,
                            platforms: true,
                        },
                    },
                },
                orderBy: { name: "asc" },
            },
            _count: {
                select: { clients: true, documents: true },
            },
        },
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    try {
        const json = await request.json();
        const data: any = {};

        if (json.name !== undefined) data.name = json.name;
        if (json.email !== undefined) data.email = json.email;
        if (json.role !== undefined) data.role = json.role;
        if (json.department !== undefined) data.department = json.department || null;
        if (json.phone !== undefined) data.phone = json.phone || null;

        if (json.password) {
            data.password = await bcrypt.hash(json.password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "SUPER_ADMIN")) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    if (session.user.id === id) {
        return new NextResponse("Cannot delete yourself", { status: 400 });
    }

    try {
        // Unassign all clients first
        await prisma.client.updateMany({
            where: { accountManagerId: id },
            data: { accountManagerId: null },
        });

        await prisma.user.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
