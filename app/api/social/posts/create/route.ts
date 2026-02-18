import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — create a new post manually
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, date, postType, platform, captionAr, captionEn, hashtags, cta } = body;

        if (!planId || !date) {
            return NextResponse.json(
                { error: "planId and date are required" },
                { status: 400 }
            );
        }

        const post = await prisma.contentPost.create({
            data: {
                planId,
                date: new Date(date),
                postType: postType || "FEED",
                platform: platform || "instagram",
                captionAr: captionAr || "",
                captionEn: captionEn || "",
                hashtags: hashtags || "",
                cta: cta || "",
                aiProvider: "manual",
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}
