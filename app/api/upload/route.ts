import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Accept logo, stamp, or signature
        const file =
            (formData.get("logo") as File | null) ||
            (formData.get("stamp") as File | null) ||
            (formData.get("signature") as File | null);

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Determine prefix from field name
        let prefix = "file";
        if (formData.get("logo")) prefix = "logo";
        else if (formData.get("stamp")) prefix = "stamp";
        else if (formData.get("signature")) prefix = "signature";

        // Validate file type
        const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Use PNG, JPG, WebP, or SVG." },
                { status: 400 }
            );
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Generate filename
        const ext = file.name.split(".").pop() || "png";
        const fileName = `${prefix}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
