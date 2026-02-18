import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list plans (optionally filter by profileId)
export async function GET(req: NextRequest) {
    const profileId = req.nextUrl.searchParams.get("profileId");

    const plans = await prisma.contentPlan.findMany({
        where: profileId ? { profileId } : undefined,
        include: {
            profile: { include: { client: true } },
            _count: { select: { posts: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(plans);
}

// POST — create a new plan
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profileId, month, year, scheduleType } = body;

        if (!profileId || !month || !year) {
            return NextResponse.json(
                { error: "profileId, month, and year are required" },
                { status: 400 }
            );
        }

        const plan = await prisma.contentPlan.create({
            data: {
                profileId,
                month: parseInt(month),
                year: parseInt(year),
                scheduleType: scheduleType || "MWF",
                status: "draft",
            },
            include: {
                profile: { include: { client: true } },
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json(
            { error: "Failed to create plan" },
            { status: 500 }
        );
    }
}
