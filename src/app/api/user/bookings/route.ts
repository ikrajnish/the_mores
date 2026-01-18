import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    console.log("API: Fetching user bookings...");
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

    // Categorize
    // Pending: Future dates or status CONFIRMED/PAYMENT_PENDING
    // Completed: Past dates or status COMPLETED
    // For simplicity, let's use Date comparison
    
    // Actually, let's just return all and let frontend categorize, 
    // OR return categorized. Returning categorized is nice.
    
    const now = new Date();
    
    const pending = bookings.filter(b => 
        (b.status === 'CONFIRMED' || b.status === 'PAYMENT_PENDING' || b.status === 'CREATED') && 
        new Date(b.date) >= now
    );

    const completed = bookings.filter(b => 
        b.status === 'COMPLETED' || 
        (b.status === 'CONFIRMED' && new Date(b.date) < now) ||
        b.status === 'CANCELLED' // Maybe separate cancelled? The requirement said "Pending and Completed". 
        // Let's put Cancelled in Completed or hide them? 
        // User request: "Pending and Completed"
        // I'll put past bookings in Completed.
    );

    // Note: status 'COMPLETED' might not be automatically set by system yet (no cron job).
    // so checking date < now is good fallback for "Completed".

    return NextResponse.json({
      pending,
      completed
    });

  } catch (error) {
    console.error("Fetch User Bookings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
