import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { startOfDay, endOfDay, subDays } from "date-fns";

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
    // Aggregation pipeline for total sum
    const revenueResult = await Booking.aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 3. Membership Count
    // Group by membership tier
    const membershipStats = await User.aggregate([
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
    const membershipCounts = {
        NORMAL: 0,
        SILVER: 0,
        GOLD: 0,
        PLATINUM: 0
    };
    membershipStats.forEach((stat) => {
        const name = stat._id || 'NORMAL';
        if (name in membershipCounts) {
           membershipCounts[name as keyof typeof membershipCounts] = stat.count;
        }
    });


    // 4. Low Stock Products (Mocked for now as we don't track stock yet really)
    // We'll just return a static number or mock list
    const lowStockCount = 3; 

    // 5. Recent Enrollments (Last 7 days)
    const recentEnrollments = await User.countDocuments({
        createdAt: { $gte: subDays(new Date(), 7) }
    });

    // 6. Recent Activity (Latest 5 bookings)
    const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name phone")
        .populate("serviceId", "name")
        .lean();

    // 7. Revenue Chart Data (Last 7 days)
    // We want daily revenue for chart
    const last7DaysRevenue = await Booking.aggregate([
        { 
            $match: { 
                status: { $in: ['CONFIRMED', 'COMPLETED'] },
                date: { $gte: subDays(new Date(), 6) } // Last 7 days including today
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                revenue: { $sum: "$price" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
        metrics: {
            todaysAppointments,
            totalRevenue,
            membershipCounts,
            lowStockCount,
            recentEnrollments
        },
        recentActivity: recentBookings,
        revenueChart: last7DaysRevenue
    });

  } catch (error) {
    console.error("Admin Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
