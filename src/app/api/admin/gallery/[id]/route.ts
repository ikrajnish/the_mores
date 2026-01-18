import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        const item = await Gallery.findByIdAndDelete(params.id);
        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
