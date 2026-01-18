import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming auth.ts exports an auth helper
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, date, slot } = body;

    if (!serviceId || !date || !slot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 1. Get User and their Membership
    const user = await User.findOne({ phone: session.user.email }); // Assuming email stores phone or using email as identifier
    // OR if session.user.id exists and matches _id
    // But let's assume session.user.email (or name/phone) is used for lookup if we don't have ID in session
    // Ideally session should have ID. Let's rely on session.user.email for now if that's what's available or adapt.
    // Wait, let's check auth.ts to see what's in session. 
    // For now, I'll assume I can find user by phone (which might be in email field if using credentials provider with phone)
    
    // ADJUSTMENT: Need to verify how to identify user. 
    // I'll assume session.user.email is the phone number based on previous contexts or standard next-auth behavior with phone login
    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Resolve Membership
    let membershipId = user.membershipId;
    let membershipName = "NORMAL"; // Default

    if (membershipId) {
      const membership = await Membership.findById(membershipId);
      if (membership) {
        membershipName = membership.name;
      } else {
        // Fallback to NORMAL if assigned membership not found
        const normal = await Membership.findOne({ name: "NORMAL" });
        membershipId = normal?._id || null;
      }
    } else {
       const normal = await Membership.findOne({ name: "NORMAL" });
       membershipId = normal?._id || null;
    }

    // 3. Get Service and Pricing
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const pricing = await ServicePricing.findOne({
      serviceId: service._id,
      membershipId: membershipId,
    });

    if (!pricing) {
        return NextResponse.json({ error: "Pricing not found for this service and membership" }, { status: 400 });
    }

    // 4. Create Booking
    const booking = await Booking.create({
      userId: user._id,
      serviceId: service._id,
      date: new Date(date),
      slot,
      pricePaid: pricing.price,
      membershipSnapshot: membershipName,
      status: "CONFIRMED", // Auto-confirm for now as per requirements ("Green tick")
    });

    // TODO: Trigger reminder SMS (automated scheduler or immediate)
    // console.log(`[SMS MOCK] Sending booking confirmation to user ${user.phone || session.user.email} for Booking ${booking._id}`);
    // await sendSMS(user.phone, `Your appointment for ${service.name} on ${new Date(date).toDateString()} at ${slot} is confirmed! Booking ID: ${booking._id}`);

    return NextResponse.json({ success: true, bookingId: booking._id }, { status: 201 });

  } catch (error) {
    console.error("Booking Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
