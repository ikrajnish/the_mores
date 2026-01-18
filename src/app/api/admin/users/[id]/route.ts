import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        await connectDB();
        
        const user = await User.findById(id).populate('membershipId').lean();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Optionally fetch their bookings too
        const bookings = await Booking.find({ userId: user._id }).sort({ date: -1 }).limit(20).lean();

        return NextResponse.json({ 
            user: JSON.parse(JSON.stringify(user)),
            bookings: JSON.parse(JSON.stringify(bookings))
        });
    } catch (error) {
       return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        await connectDB();

        const body = await req.json();
        // Support updating isBlocked, role, membershipId
        const updateData: any = {};
        if (typeof body.isBlocked !== 'undefined') updateData.isBlocked = body.isBlocked;
        if (body.role) updateData.role = body.role;
        if (body.membershipId) updateData.membershipId = body.membershipId;
        // Add other fields as needed

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        
        return NextResponse.json({ success: true, user });

    } catch (error) {
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        await connectDB();

        // Prevent deleting self?
        if (session.user.userId === id) {
             return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await User.findByIdAndDelete(id);
        // Clean up bookings? Or keep them? Usually keep them or soft delete. 
        // For compliance/cleanup, maybe delete bookings or anonymize.
        // For now, just deleting user.
        
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
}
