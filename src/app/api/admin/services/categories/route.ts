import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        // Allow authenticated users to fetch categories? Or just admins?
        // Public booking needs categories too, but that uses a different public API likely.
        // This is admin route so strict on admin.
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const categories = await ServiceCategory.find().lean();
        return NextResponse.json({ categories });
    
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
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const category = await ServiceCategory.create({ name });

        return NextResponse.json({ success: true, category });
    
      } catch (error) {
        console.error("Create Category Error:", error);
        if ((error as any).code === 11000) {
             return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
