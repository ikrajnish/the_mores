import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Identify user
    const user = await User.findOne({ phone: session.user.email });
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
