import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Transaction from "@/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { membershipId } = body;

    if (!membershipId) {
      return NextResponse.json({ error: "Membership ID required" }, { status: 400 });
    }

    await connectDB();

    const membership = await Membership.findById(membershipId);
    if (!membership) {
       return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Determine user (simulating session user for now, or finding by email/phone)
    // The auth logic seems to treat session.user.email as phone in some places, verifying...
    // In auth.ts payload is verifying JWT. Let's trust session.user.id if available or lookup.
    
    // Assuming session.user has useful info.
    // If not, we might need to rely on phone lookup if we trust the client (we shouldn't).
    // Let's rely on the session phone/email lookup.
    
    const user = await User.findOne({ phone: session.user.email }); // Aligning with previous assumption that email field holds phone
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // MOCK PAYMENT PROCESS HERE
    // In a real app, verify Razorpay signature here.
    
    // Calculate Expiry
    const days = membership.durationInDays || 365;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Update user
    user.membershipId = membershipId;
    user.membershipExpiresAt = expiryDate;
    await user.save();

    // Log Transaction
    await Transaction.create({
        type: 'MEMBERSHIP',
        amount: membership.price,
        description: `Membership Purchase: ${membership.name}`,
        userId: user._id,
        date: new Date()
    });

    return NextResponse.json({ success: true, message: `Upgraded to ${membership.name}` }, { status: 200 });

  } catch (error) {
    console.error("Membership Purchase API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
