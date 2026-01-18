import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        
        const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json({ success: true, product });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        const product = await Product.findByIdAndDelete(params.id);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
