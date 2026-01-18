import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        
        // Allowed updates: status, date, slot
        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.date) updateData.date = new Date(body.date);
        if (body.slot) updateData.slot = body.slot;
        
        const booking = await Booking.findByIdAndUpdate(params.id, updateData, { new: true })
             .populate('userId', 'name phone')
             .populate('serviceId', 'name');

        if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

        // Logic for notifications could go here (e.g. if rescheduled/cancelled)
        
        return NextResponse.json({ success: true, booking });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
