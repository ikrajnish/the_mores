import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const items = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Gallery API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
