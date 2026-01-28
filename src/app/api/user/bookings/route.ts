import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Identify user by ID (safer than phone/email from session which might change)
    const user = await User.findById(session.user.id);
    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch bookings
    const bookings = await Booking.find({ userId: user._id })
      .populate("serviceId", "name image duration")
      .sort({ date: -1 })
      .lean();

    // Fetch NORMAL membership ID for price comparison
    const normalMembership = await Membership.findOne({ name: "NORMAL" }).lean();
    const normalMemId = normalMembership ? normalMembership._id : null;

    // Enrich bookings with original price
    // Note: This might cause N+1 query issue if list is huge, but fine for typical user history (10-50 items).
    // Optimization: Fetch all needed ServicePricing in one go if performance becomes an issue.
    const enrichedBookings = await Promise.all(bookings.map(async (b: any) => {
        let originalPrice = b.pricePaid; // Default to paid if not found/same
        
        if (normalMemId && b.serviceId) {
            const pricing = await ServicePricing.findOne({
                serviceId: b.serviceId._id,
                membershipId: normalMemId
            }).lean();
            if (pricing) {
                originalPrice = pricing.price;
            }
        }
        return { ...b, originalPrice };
    }));

    const now = new Date();
    
    // @ts-ignore
    const pending = enrichedBookings.filter(b => 
        (b.status === 'CONFIRMED' || b.status === 'PAYMENT_PENDING' || b.status === 'CREATED') && 
        new Date(b.date) >= now
    );

    // @ts-ignore
    const completed = enrichedBookings.filter(b => 
        b.status === 'COMPLETED' || 
        (b.status === 'CONFIRMED' && new Date(b.date) < now) ||
        b.status === 'CANCELLED'
    );

    return NextResponse.json({
      pending,
      completed
    });

  } catch (error) {
    console.error("Fetch User Bookings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // 1. Identify User
    const user = await User.findById(session.user.id);
    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Resolve Membership
    let membershipId = user.membershipId;
    let membershipName = "NORMAL";

    if (membershipId) {
      const membership = await Membership.findById(membershipId);
      // Check for expiration
      if (membership && user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date()) {
            membershipName = `${membership.name} (Expired)`;
            // Fallback to NORMAL
            const normal = await Membership.findOne({ name: "NORMAL" });
            membershipId = normal?._id || null;
      } else if (membership) {
            membershipName = membership.name;
      } else {
            // Invalid membership ID in user doc
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

    let pricing = await ServicePricing.findOne({
      serviceId: service._id,
      membershipId: membershipId,
    });

    // Fallback logic
    if ((!pricing || pricing.price === 0) && membershipName !== "NORMAL") {
        const normal = await Membership.findOne({ name: "NORMAL" });
        if (normal) {
             const normalPricing = await ServicePricing.findOne({
                serviceId: service._id,
                membershipId: normal._id
             });
             if (normalPricing && normalPricing.price > 0) {
                 pricing = normalPricing;
             }
        }
    }

    if (!pricing) {
        return NextResponse.json({ error: "Pricing not found" }, { status: 400 });
    }

    // 4. Create Booking
    const booking = await Booking.create({
      userId: user._id,
      serviceId: service._id,
      date: new Date(date),
      slot,
      pricePaid: pricing.price,
      membershipSnapshot: membershipName,
      status: "CONFIRMED" // Shows as valid in My Bookings immediately
    });

    return NextResponse.json({ success: true, bookingId: booking._id }, { status: 201 });

  } catch (error) {
    console.error("User Booking Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
