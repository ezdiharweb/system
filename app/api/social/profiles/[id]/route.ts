import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — single profile
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const profile = await prisma.socialMediaProfile.findUnique({
        where: { id },
        include: {
            client: true,
            contentPlans: {
                include: { _count: { select: { posts: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!profile) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
}

// PUT — update profile
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.socialMediaProfile.update({
        where: { id },
        data: {
            industry: body.industry,
            niche: body.niche,
            targetAudience: body.targetAudience,
            brandTone: body.brandTone,
            platforms: body.platforms,
            goals: body.goals,
            competitors: body.competitors,
            brandColors: body.brandColors,
            sampleContent: body.sampleContent,
        },
        include: { client: true },
    });

    return NextResponse.json(updated);
}

// DELETE
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await prisma.socialMediaProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
