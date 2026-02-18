import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all social media profiles with client info
export async function GET() {
    const profiles = await prisma.socialMediaProfile.findMany({
        include: {
            client: true,
            contentPlans: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(profiles);
}

// POST — create a new social media profile
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            clientId,
            industry,
            niche,
            targetAudience,
            brandTone,
            platforms,
            goals,
            competitors,
            brandColors,
            sampleContent,
        } = body;

        if (!clientId) {
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Check if profile already exists
        const existing = await prisma.socialMediaProfile.findUnique({
            where: { clientId },
        });

        if (existing) {
            // Update existing
            const updated = await prisma.socialMediaProfile.update({
                where: { clientId },
                data: {
                    industry: industry || "",
                    niche: niche || "",
                    targetAudience: targetAudience || "",
                    brandTone: brandTone || "professional",
                    platforms: platforms || ["instagram"],
                    goals: goals || "",
                    competitors: competitors || "",
                    brandColors: brandColors || "",
                    sampleContent: sampleContent || "",
                },
                include: { client: true },
            });
            return NextResponse.json(updated);
        }

        const profile = await prisma.socialMediaProfile.create({
            data: {
                clientId,
                industry: industry || "",
                niche: niche || "",
                targetAudience: targetAudience || "",
                brandTone: brandTone || "professional",
                platforms: platforms || ["instagram"],
                goals: goals || "",
                competitors: competitors || "",
                brandColors: brandColors || "",
                sampleContent: sampleContent || "",
            },
            include: { client: true },
        });

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error("Error creating social profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}
