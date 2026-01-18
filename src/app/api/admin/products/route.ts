import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Allow admin check (or public for list? Admin page implies admin access only, but public page uses /api/products usually)
    // Here we enforce admin because it might expose sensitive info or just to be safe for admin mgmt.
    // Actually, listing products is fine for public, but this is the Admin API route.
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ products });

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
        
        // Basic validation
        if (!body.name || body.price < 0) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const product = await Product.create(body);
        return NextResponse.json({ success: true, product });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
