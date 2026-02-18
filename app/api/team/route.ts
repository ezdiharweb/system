import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            phone: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: { clients: true, documents: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    // Only SUPER_ADMIN and ADMIN can create users
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    try {
        const json = await request.json();

        // Validation
        if (!json.email || !json.password || !json.role) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: json.email },
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(json.password, 10);

        const user = await prisma.user.create({
            data: {
                name: json.name,
                email: json.email,
                password: hashedPassword,
                role: json.role,
                department: json.department || null,
                phone: json.phone || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
