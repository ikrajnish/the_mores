import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!dateParam || !serviceId) {
      return NextResponse.json({ error: "Missing date or serviceId" }, { status: 400 });
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    await connectDB();

    // Query bookings for this service on this day
    // We check for bookings that match the service and are within the day range.
    // NOTE: If we want to check "any service" availability (e.g. staff availability), we'd need a more complex model (Staff/Resource).
    // The requirement says "Fetch availability for that service & date".
    // Assumption: Bookings are per-service. If multiple people can book the same service at the same time,
    // we would need capacity logic. 
    // FOR NOW: Assume 1 slot = 1 booking global or per service? 
    // Usually "Appointment Slot" implies specific resource.
    // Let's assume strict uniqueness: 1 slot = 1 booking for this service (or globally?).
    // "Fetch availability for THAT service". 
    // Let's query bookings for this service.
    
    // Additional logic: If the salon has limited staff, multiple services might compete for slots.
    // But sticking to the prompt: "availability for availability for that service".
    // I will check if a booking exists for this serviceId at a specific slot.

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const bookings = await Booking.find({
      serviceId: serviceId,
      date: {
        $gte: dayStart,
        $lte: dayEnd
      },
      status: { $ne: 'CANCELLED' } // Don't block cancelled slots
    }).select("slot").lean();

    const bookedSlots = bookings.map((b) => b.slot);

    // Defined slots (could be dynamic, but static for now matching frontend)
    const allSlots = [
      "10:00 AM", "11:00 AM", "12:00 PM", 
      "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
    ];

    return NextResponse.json({
      bookedSlots,
      allSlots
    });

  } catch (error) {
    console.error("Availability API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
