import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Membership from "@/models/Membership";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { identifier, membershipId } = body;

        if (!identifier || !membershipId) {
            return NextResponse.json({ error: "Phone/Email and Membership ID are required" }, { status: 400 });
        }

        // Find Membership to verify existence
        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return NextResponse.json({ error: "Invalid Membership ID" }, { status: 404 });
        }

        // Find User by Phone OR Email
        const user = await User.findOne({
            $or: [
                { phone: identifier },
                { email: identifier }
            ]
        });

        if (!user) {
            return NextResponse.json({ error: "User not found with that phone or email" }, { status: 404 });
        }

        // Update User
        user.membershipId = membership._id;
        await user.save();

        return NextResponse.json({ success: true, user: { name: user.name, phone: user.phone, membership: membership.name } });
    
      } catch (error) {
        console.error("Assign Membership Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
