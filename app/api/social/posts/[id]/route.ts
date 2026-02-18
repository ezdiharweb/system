import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT — update a single post (content or status)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.contentPost.update({
        where: { id },
        data: {
            ...(body.captionAr !== undefined && { captionAr: body.captionAr }),
            ...(body.captionEn !== undefined && { captionEn: body.captionEn }),
            ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
            ...(body.cta !== undefined && { cta: body.cta }),
            ...(body.adHeadline !== undefined && { adHeadline: body.adHeadline }),
            ...(body.adBody !== undefined && { adBody: body.adBody }),
            ...(body.hookScript !== undefined && { hookScript: body.hookScript }),
            ...(body.status !== undefined && { status: body.status }),
            ...(body.platform !== undefined && { platform: body.platform }),
        },
    });

    return NextResponse.json(updated);
}

// DELETE
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await prisma.contentPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
