
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking, { IBooking } from "@/models/Booking";
import Transaction from "@/models/Transaction";
import User, { IUser } from "@/models/User";
import Membership from "@/models/Membership";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { AnalyticsResponseDTO, BookingDTO } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Check if admin
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 1. Today's Appointments
    const todaysAppointments = await Booking.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: 'CANCELLED' }
    });

    // 2. Total Revenue (Confirmed/Completed bookings)
    // 2. Total Revenue (Confirmed/Completed bookings + Transactions)
    // Service Revenue
    const serviceRevenueResult = await Booking.aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: "$pricePaid" } } }
    ]);
    const serviceRevenue = serviceRevenueResult[0]?.total || 0;

    // Membership & Product Revenue (from Transactions)
    const transactionRevenueResult = await Transaction.aggregate([
        { $match: { type: { $in: ['MEMBERSHIP', 'PRODUCT'] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const transactionRevenue = transactionRevenueResult[0]?.total || 0;

    const totalRevenue = serviceRevenue + transactionRevenue;

    // 3. Membership Count
    // Group by membership tier
    const membershipStats = await User.aggregate<{ _id: string; count: number }>([
        { 
            $lookup: {
                from: "memberships",
                localField: "membershipId",
                foreignField: "_id",
                as: "membership"
            }
        },
        { $unwind: { path: "$membership", preserveNullAndEmptyArrays: true } },
        { 
            $group: { 
                _id: "$membership.name", 
                count: { $sum: 1 } 
            } 
        }
    ]);
    
    // Format membership stats
    const membershipCounts: { [key: string]: number; NORMAL: number; SILVER: number; GOLD: number; PLATINUM: number } = {
        NORMAL: 0,
        SILVER: 0,
        GOLD: 0,
        PLATINUM: 0
    };
    membershipStats.forEach((stat) => {
        const name = stat._id || 'NORMAL';
        if (Object.prototype.hasOwnProperty.call(membershipCounts, name)) {
           membershipCounts[name] = stat.count;
        } else {
           // Handle cases where exact match isn't found or strictly fallback
           membershipCounts.NORMAL += stat.count;
        }
    });

    // 4. Low Stock Products (Mocked for now as we don't track stock yet really)
    const lowStockCount = 3; 

    // 5. Recent Enrollments (Last 7 days)
    const recentEnrollments = await User.countDocuments({
        createdAt: { $gte: subDays(new Date(), 7) }
    });

    // 6. Recent Activity (Latest 5 bookings)
    const recentBookingsRaw = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate<{ userId: IUser }>("userId", "name phone")
        .populate("serviceId", "name")
        .lean<IBooking[]>();

    const recentBookings: BookingDTO[] = recentBookingsRaw.map(b => {
        const userObj = b.userId as any;
        const serviceObj = b.serviceId as any;

        return {
            _id: b._id.toString(),
            userId: userObj ? {
                id: userObj._id?.toString() || 'unknown',
                name: userObj.name || 'Guest',
                email: userObj.email || '',
                phone: userObj.phone || '',
                role: 'CUSTOMER'
            } : {
                id: 'deleted',
                name: 'Deleted User',
                email: '',
                phone: '',
                role: 'CUSTOMER'
            } as any,
            serviceId: serviceObj ? {
                _id: serviceObj._id?.toString() || 'unknown',
                name: serviceObj.name || 'Unknown Service',
            } : {
                _id: 'deleted',
                name: 'Deleted Service'
            } as any,
            date: new Date(b.date).toISOString(),
            slot: b.slot,
            status: b.status as any,
            pricePaid: b.pricePaid,
            createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()
        };
    });


    // 7. Revenue Chart Data (Last 7 days)
    // We want daily revenue for chart
    const last7DaysRevenue = await Booking.aggregate<{ _id: string; revenue: number }>([
        { 
            $match: { 
                status: { $in: ['CONFIRMED', 'COMPLETED'] },
                date: { $gte: subDays(new Date(), 6) } // Last 7 days including today
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                revenue: { $sum: "$pricePaid" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const response: AnalyticsResponseDTO = {
        metrics: {
            todaysAppointments,
            totalRevenue,
            membershipCounts,
            lowStockCount,
            recentEnrollments,
            activeMembers: 0 // Placeholder
        },
        recentActivity: recentBookings,
        revenueChart: last7DaysRevenue
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Admin Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
