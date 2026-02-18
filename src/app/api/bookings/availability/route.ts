
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { startOfDay, endOfDay } from "date-fns";
import { AvailabilityResponseDTO, ApiErrorDTO } from "@/types";

const schema = z.object({
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  serviceId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    const validation = schema.safeParse({ date: dateParam, serviceId });

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { date: dateStr, serviceId: sId } = validation.data;
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date object" }, { status: 400 });
    }

    await connectDB();

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const bookings = await Booking.find({
      serviceId: sId,
      date: {
        $gte: dayStart,
        $lte: dayEnd
      },
      status: { $ne: 'CANCELLED' }
    }).select("slot").lean<{ slot: string }[]>();

    const bookedSlots = bookings.map((b) => b.slot);

    const response: AvailabilityResponseDTO = {
      bookedSlots
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Availability API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
