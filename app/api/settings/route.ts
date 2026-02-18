import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — fetch company settings
export async function GET() {
    try {
        let settings = await prisma.companySettings.findUnique({
            where: { id: "default" },
        });

        // Create default if doesn't exist
        if (!settings) {
            settings = await prisma.companySettings.create({
                data: { id: "default" },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// PUT — update company settings
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        const settings = await prisma.companySettings.upsert({
            where: { id: "default" },
            update: {
                companyName: body.companyName || "",
                companyNameAr: body.companyNameAr || "",
                legalName: body.legalName || "",
                email: body.email || "",
                phone: body.phone || "",
                website: body.website || "",
                address: body.address || "",
                taxNumber: body.taxNumber || "",
                logoUrl: body.logoUrl ?? "",
            },
            create: {
                id: "default",
                companyName: body.companyName || "",
                companyNameAr: body.companyNameAr || "",
                legalName: body.legalName || "",
                email: body.email || "",
                phone: body.phone || "",
                website: body.website || "",
                address: body.address || "",
                taxNumber: body.taxNumber || "",
                logoUrl: body.logoUrl ?? "",
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Settings PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
