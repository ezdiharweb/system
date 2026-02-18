import { NextRequest, NextResponse } from "next/server";
import { generateContentPlan } from "@/lib/content-generator";
import { prisma } from "@/lib/prisma";

// POST — trigger AI generation for a plan
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Mark plan as generating
    await prisma.contentPlan.update({
        where: { id },
        data: { status: "generating" },
    });

    try {
        const result = await generateContentPlan({ planId: id });

        if (result.success) {
            return NextResponse.json({
                success: true,
                postsCreated: result.postsCreated,
                message: `Generated ${result.postsCreated} posts successfully`,
            });
        } else {
            await prisma.contentPlan.update({
                where: { id },
                data: { status: "error" },
            });
            return NextResponse.json(
                { error: result.error || "Generation failed", postsCreated: 0 },
                { status: 500 }
            );
        }
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Generation error:", errMsg);
        await prisma.contentPlan.update({
            where: { id },
            data: { status: "error" },
        });
        return NextResponse.json(
            { error: errMsg },
            { status: 500 }
        );
    }
}
