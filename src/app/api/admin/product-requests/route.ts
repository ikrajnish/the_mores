import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ProductRequest from "@/models/ProductRequest";
import Product from "@/models/Product"; // Ensure schema registered

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const requests = await ProductRequest.find()
        .populate('productId')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
    
    return NextResponse.json({ requests });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const { id, status } = await req.json();

        const request = await ProductRequest.findByIdAndUpdate(id, { status }, { new: true });
        
        return NextResponse.json({ success: true, request });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
