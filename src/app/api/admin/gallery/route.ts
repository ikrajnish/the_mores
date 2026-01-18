import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Re-using public GET logic but authenticated for consistency in admin module
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const items = await Gallery.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ items });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { mediaUrl, type } = body;

        if (!mediaUrl || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const item = await Gallery.create({ mediaUrl, type });
        return NextResponse.json({ success: true, item });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
