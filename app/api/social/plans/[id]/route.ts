import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — single plan with all posts
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const plan = await prisma.contentPlan.findUnique({
        where: { id },
        include: {
            profile: { include: { client: true } },
            posts: { orderBy: { date: "asc" } },
        },
    });

    if (!plan) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
}

// PUT — update plan
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.contentPlan.update({
        where: { id },
        data: {
            scheduleType: body.scheduleType,
            status: body.status,
        },
    });

    return NextResponse.json(updated);
}

// DELETE — delete plan and cascade posts
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await prisma.contentPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
