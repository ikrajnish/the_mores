import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const { sourceUserId, targetUserId } = await req.json();

        if (!sourceUserId || !targetUserId) {
            return NextResponse.json({ error: "Source and Target User IDs are required" }, { status: 400 });
        }

        if (sourceUserId === targetUserId) {
             return NextResponse.json({ error: "Cannot merge the same user" }, { status: 400 });
        }

        const sourceUser = await User.findById(sourceUserId);
        const targetUser = await User.findById(targetUserId);

        if (!sourceUser || !targetUser) {
            return NextResponse.json({ error: "One or both users not found" }, { status: 404 });
        }

        // Restriction: Only merge CUSTOMER accounts as Source to prevent accidental Admin deletion
        if (sourceUser.role === 'ADMIN') {
            return NextResponse.json({ error: "Cannot merge an ADMIN account. Only CUSTOMER accounts can be merged." }, { status: 403 });
        }

        // 1. Move Bookings
        const bookingsResult = await Booking.updateMany(
            { userId: sourceUserId },
            { $set: { userId: targetUserId } }
        );

        // 2. Merge Membership (If target has none, give them source's)
        let membershipMsg = "Target membership kept.";
        if (sourceUser.membershipId && !targetUser.membershipId) {
             targetUser.membershipId = sourceUser.membershipId;
             targetUser.membershipExpiresAt = sourceUser.membershipExpiresAt;
             membershipMsg = "Source membership transferred to Target.";
        }

        // 3. Move/Update Phone (If target has no phone, give them source's)
        if (sourceUser.phone && !targetUser.phone) {
            targetUser.phone = sourceUser.phone;
        }

        // 4. Update Target
        await targetUser.save();

        // 5. Delete Source User
        await User.findByIdAndDelete(sourceUserId);

        return NextResponse.json({ 
            success: true, 
            message: `Merge Successful. ${bookingsResult.modifiedCount} bookings moved. ${membershipMsg} Source user deleted.` 
        });

    } catch (error: any) {
        console.error("Merge Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
