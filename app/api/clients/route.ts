import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { canViewAllClients } from "@/lib/permissions";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Role-based filtering: AM/Content Creator only see assigned clients
    const userRole = session.user.role || "ACCOUNT_MANAGER";
    const userId = session.user.id;
    const seeAll = canViewAllClients(userRole);

    const clients = await prisma.client.findMany({
        where: {
            ...(!seeAll ? { accountManagerId: userId } : {}),
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
                select: { name: true, email: true },
            },
            _count: {
                select: { documents: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await request.json();

        // Basic validation
        if (!json.name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const client = await prisma.client.create({
            data: {
                name: json.name,
                company: json.company || null,
                email: json.email || null,
                whatsapp: json.whatsapp || null,
                status: json.status || "LEAD",
                accountManagerId: json.accountManagerId || null,
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        console.error("Error creating client:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
