import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let query: any = {};

    // Filter by date (precise day)
    if (date) {
        const queryDate = parseISO(date);
        query.date = {
            $gte: startOfDay(queryDate),
            $lte: endOfDay(queryDate)
        };
    }

    // Default sort
    const bookings = await Booking.find(query)
        .populate({
            path: 'userId',
            select: 'name phone email'
        })
        .populate('serviceId', 'name duration')
        .sort({ date: -1, slot: 1 });

    // Client-side search (lighter than complex aggregation for now if list isn't huge)
    // database search for populated fields is complex in simple find().
    let filteredBookings = bookings;
    if (search) {
        const lowerSearch = search.toLowerCase();
        filteredBookings = bookings.filter((b: any) => {
             const userName = b.userId?.name?.toLowerCase() || '';
             const userPhone = b.userId?.phone || '';
             const serviceName = b.serviceId?.name?.toLowerCase() || '';
             return userName.includes(lowerSearch) || userPhone.includes(lowerSearch) || serviceName.includes(lowerSearch);
        });
    }

    return NextResponse.json({ bookings: JSON.parse(JSON.stringify(filteredBookings)) });

  } catch (error) {
    console.error("Fetch Admin Bookings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { serviceId, date, slot, phone, name } = body;

        if (!serviceId || !date || !slot || !phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Find or Create User (Walk-in)
        let user = await User.findOne({ phone });
        if (!user) {
            // Create a temporary customer
            user = await User.create({
                phone,
                name: name || "Walk-in Guest",
                role: 'CUSTOMER',
                membershipId: null // No membership for walk-in usually, or manual assign?
            });
        }

        // 2. Resolve Membership (likely NORMAL for walk-in unless they have one)
        let membershipId = user.membershipId;
        let membershipName = "NORMAL";
        if (!membershipId) {
             const normal = await Membership.findOne({ name: "NORMAL" });
             membershipId = normal?._id || null;
        } else {
             const m = await Membership.findById(membershipId);
             if (m) membershipName = m.name;
        }

        // 3. Get Pricing
        const service = await Service.findById(serviceId);
        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
        
        const pricing = await ServicePricing.findOne({
            serviceId: service._id,
            membershipId: membershipId
        });

        // 4. Create Booking
        const booking = await Booking.create({
            userId: user._id,
            serviceId: service._id,
            date: new Date(date),
            slot,
            pricePaid: pricing?.price || 0, // Fallback
            membershipSnapshot: membershipName,
            status: "CONFIRMED"
        });

        return NextResponse.json({ success: true, booking });
    
      } catch (error) {
        console.error("Create Walk-in Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
