
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking, { IBooking } from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import { BookingDTO, ApiErrorDTO, ServiceDTO } from "@/types";

// Validation Schema
const bookingCreateSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")), // Accept ISO or YYYY-MM-DD
  slot: z.string().min(1, "Slot is required"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookings = await Booking.find({ userId: user._id })
      .populate("serviceId", "name image duration")
      .sort({ date: -1 })
      .lean<IBooking[]>();

    const normalMembership = await Membership.findOne({ name: "NORMAL" }).lean();
    const normalMemId = normalMembership ? normalMembership._id : null;

    // Enriched bookings with strict typing
    const enrichedBookings: BookingDTO[] = await Promise.all(bookings.map(async (b) => {
        let originalPrice = b.pricePaid;
        
        // Type guard for populated service
        const serviceIdRaw = b.serviceId as any; 
        const serviceIdStr = serviceIdRaw._id?.toString() || serviceIdRaw.toString();

        if (normalMemId && serviceIdRaw?._id) {
            const pricing = await ServicePricing.findOne({
                serviceId: serviceIdRaw._id,
                membershipId: normalMemId
            }).lean();
            if (pricing) {
                originalPrice = pricing.price;
            }
        }


        const serviceDTO: ServiceDTO | string = serviceIdRaw && typeof serviceIdRaw === 'object' && '_id' in serviceIdRaw
            ? {
                _id: serviceIdRaw._id.toString(),
                name: serviceIdRaw.name,
                duration: serviceIdRaw.duration,
                image: serviceIdRaw.image,
                price: undefined // Not in populated fields, but part of DTO
            }
            : serviceIdStr;

        return {
          _id: b._id.toString(),
          userId: b.userId.toString(),
          serviceId: serviceDTO,
          date: new Date(b.date).toISOString(),
          slot: b.slot,
          status: b.status as any, // Cast to BookingStatus enum
          pricePaid: b.pricePaid,
          membershipSnapshot: b.membershipSnapshot || undefined,
          originalPrice,
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()
        };
    }));

    const now = new Date();
    
    // Strict typing for filter
    const pending = enrichedBookings.filter(b => {
        const bDate = new Date(b.date);
        return (b.status === 'CONFIRMED' || b.status === 'PAYMENT_PENDING' || b.status === 'CREATED') && bDate >= now;
    });

    const completed = enrichedBookings.filter(b => {
        const bDate = new Date(b.date);
        return b.status === 'COMPLETED' || 
               (b.status === 'CONFIRMED' && bDate < now) ||
               b.status === 'CANCELLED';
    });

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

    const bodyRaw = await req.json();
    const validation = bookingCreateSchema.safeParse(bodyRaw);

    if (!validation.success) {
      const firstError = (validation.error as any).errors?.[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { serviceId, date, slot } = validation.data;

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Resolve Membership
    let membershipId = user.membershipId;
    let membershipName = "NORMAL";
    const normal = await Membership.findOne({ name: "NORMAL" });

    if (membershipId) {
      const membership = await Membership.findById(membershipId);
      if (membership && user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date()) {
            membershipName = `${membership.name} (Expired)`;
            membershipId = normal?._id || null;
      } else if (membership) {
            membershipName = membership.name;
      } else {
            membershipId = normal?._id || null;
      }
    } else {
       membershipId = normal?._id || null;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    let pricing = await ServicePricing.findOne({
      serviceId: service._id,
      membershipId: membershipId,
    });

    if ((!pricing || pricing.price === 0) && membershipName !== "NORMAL") {
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

    const booking = await Booking.create({
      userId: user._id,
      serviceId: service._id,
      date: new Date(date),
      slot,
      pricePaid: pricing.price,
      membershipSnapshot: membershipName,
      status: "CONFIRMED"
    });

    return NextResponse.json({ success: true, bookingId: booking._id }, { status: 201 });

  } catch (error) {
    console.error("User Booking Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
