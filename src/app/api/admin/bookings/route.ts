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
        const { serviceId, serviceIds, date, slot, phone, email, name } = body;

        // Handle both single and multiple services
        const servicesToBook = serviceIds && Array.isArray(serviceIds) ? serviceIds : (serviceId ? [serviceId] : []);

        if (servicesToBook.length === 0 || !date || !slot) {
            return NextResponse.json({ error: "Missing required fields (Services, Date, Slot)" }, { status: 400 });
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
        
        // 2. Resolve Membership
        const normalMembership = await Membership.findOne({ name: "NORMAL" });
        if (!normalMembership) {
             return NextResponse.json({ error: "System Configuration Error: NORMAL membership not found" }, { status: 500 });
        }

        // Default to user's membership or NORMAL
        let effectiveMembershipId = user.membershipId || normalMembership._id;
        let membershipName = "NORMAL";

        // Check for Manual Override from Admin
        if (body.appliedMembershipId) {
             effectiveMembershipId = body.appliedMembershipId;
             const appliedMem = await Membership.findById(effectiveMembershipId);
             if (appliedMem) {
                 membershipName = appliedMem.name;
             } else {
                 // Invalid override ID, revert to standard logic
                 effectiveMembershipId = user.membershipId || normalMembership._id;
             }
        } 
        
        // If no manual override, resolve name from user's membership
        if (!body.appliedMembershipId && user.membershipId) {
             const m = await Membership.findById(user.membershipId);
             if (m) {
                 membershipName = m.name;
             } else {
                 effectiveMembershipId = normalMembership._id;
             }
        }

        // 3. Loop through services and create bookings
        const createdBookings = [];
        
        for (const sId of servicesToBook) {
            const service = await Service.findById(sId);
            if (!service) continue; // Skip invalid service IDs safely
            
            let pricing = await ServicePricing.findOne({
                serviceId: service._id,
                membershipId: effectiveMembershipId
            });

            // Fallback to NORMAL pricing if specific membership pricing is missing OR is 0
            if ((!pricing || pricing.price === 0) && effectiveMembershipId.toString() !== normalMembership._id.toString()) {
                console.warn(`Pricing 0 or missing for service ${service.name} and membership ${membershipName}. Falling back to NORMAL.`);
                const fallbackPricing = await ServicePricing.findOne({
                    serviceId: service._id,
                    membershipId: normalMembership._id
                });
                
                // Only override if fallback exists and has a price (> 0 ideally, or just exists)
                if (fallbackPricing) {
                    pricing = fallbackPricing;
                }
            }

            // 4. Create Booking
            const booking = await Booking.create({
                userId: user._id,
                serviceId: service._id,
                date: new Date(date),
                slot,
                pricePaid: pricing?.price || 0,
                membershipSnapshot: membershipName,
                status: "CONFIRMED"
            });
            createdBookings.push(booking);
        }

        return NextResponse.json({ success: true, bookings: createdBookings });
    
      } catch (error: any) {
        console.error("Create Walk-in Error:", error);
        if (error.code === 11000) {
             return NextResponse.json({ error: "User with this phone/email already exists but couldn't be retrieved properly. Try searching." }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
