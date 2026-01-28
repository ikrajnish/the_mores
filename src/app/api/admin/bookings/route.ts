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
        const { serviceId, date, slot, phone, email, name } = body;

        if (!serviceId || !date || !slot) {
            return NextResponse.json({ error: "Missing required fields (Service, Date, Slot)" }, { status: 400 });
        }

        if (!phone && !email) {
            return NextResponse.json({ error: "Either Phone or Email is required" }, { status: 400 });
        }

        // 1. Find or Create User (Walk-in)
        let user: any = null;
        
        // Normalize Phone: If 10 digits, prepend +91
        let searchPhone = phone;
        if (phone && phone.trim().length === 10 && !phone.startsWith('+')) {
            searchPhone = `+91${phone.trim()}`;
        }

        // Try finding by Phone first
        if (searchPhone) {
             user = await User.findOne({ phone: searchPhone });
        }
        
        // If not found, try Email
        if (!user && email) {
             user = await User.findOne({ email });
        }

        if (!user) {
            // Create a new customer
            // Note: Phone is required in schema, so if we only have email, we might need a placeholder or update schema?
            // Schema: phone: { type: String, required: true, unique: true }
            // If user provides only EMAIL, we can't create if PHONE is required.
            // Assumption: For now, if phone is missing but email provided, we might need to ask for phone OR use email as placeholder?
            // Better: If schema requires phone, and user enters email only... we have a problem.
            // Let's check schema again. Yes, phone is required.
            // WORKAROUND: If phone missing but email present, use email as phone or error? 
            // Reasonable to assign a placeholder phone or error. 
            // Let's assume for Walk-in, we usually get phone. If email only, we error "Phone required for new user" or we make phone optional in schema (too risky now).
            // Let's just use the logic: If user exists by email, great. If new, we need phone.
            
            if (!phone) {
                return NextResponse.json({ error: "Phone number is required for new customers" }, { status: 400 });
            }

            user = await User.create({
                phone: searchPhone,
                email: email || undefined,
                name: name || "Walk-in Guest",
                role: 'CUSTOMER',
                membershipId: null
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
    
      } catch (error: any) {
        console.error("Create Walk-in Error:", error);
        if (error.code === 11000) {
             return NextResponse.json({ error: "User with this phone/email already exists but couldn't be retrieved properly. Try searching." }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
