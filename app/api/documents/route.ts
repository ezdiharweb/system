import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await request.json();
        const { clientId, type, amount, currency, notes } = json;

        if (!clientId || !type) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Generate document number
        const year = new Date().getFullYear();
        const count = await prisma.document.count({
            where: {
                type: type,
                createdAt: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                },
            },
        });

        const prefix = type === "PROFORMA" ? "PRO" : type === "CONTRACT" ? "CON" : "INV";
        const documentNumber = `${prefix}-${year}-${String(count + 1).padStart(3, "0")}`;

        const document = await prisma.document.create({
            data: {
                documentNumber,
                type,
                status: "DRAFT",
                amount: amount || 1190.00,
                currency: currency || "SAR",
                notes: notes || null,
                clientId,
                createdById: session.user.id,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error creating document:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const documents = await prisma.document.findMany({
        where: {
            ...(clientId ? { clientId } : {}),
        },
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

    return NextResponse.json(documents);
}
