import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { startOfDay, subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();

        // 1. Calculate Totals (All Time)
        // Bookings (Completed or Confirmed)
        const bookingRevenue = await Booking.aggregate([
            { $match: { status: { $in: ['COMPLETED', 'CONFIRMED'] } } },
            { $group: { _id: null, total: { $sum: "$pricePaid" } } }
        ]);
        const totalServices = bookingRevenue[0]?.total || 0;

        // Transactions (Memberships)
        const membershipRevenue = await Transaction.aggregate([
            { $match: { type: 'MEMBERSHIP' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalMemberships = membershipRevenue[0]?.total || 0;

        // Transactions (Product Sales)
        const productRevenue = await Transaction.aggregate([
            { $match: { type: 'PRODUCT' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalProducts = productRevenue[0]?.total || 0;

        // Transactions (Expenses)
        const expensesTotal = await Transaction.aggregate([
            { $match: { type: 'EXPENSE' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expensesTotal[0]?.total || 0;

        const totalRevenue = totalServices + totalMemberships + totalProducts;
        const netProfit = totalRevenue - totalExpenses;

        // 2. Calculate Daily Data for Chart (Last 7 days)
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const start = startOfDay(date);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            // Daily Service Revenue
            const dailyService = await Booking.aggregate([
                { $match: { 
                    status: { $in: ['COMPLETED', 'CONFIRMED'] },
                    date: { $gte: start, $lte: end }
                } },
                { $group: { _id: null, total: { $sum: "$pricePaid" } } }
            ]);

            // Daily Membership Revenue
            const dailyMembership = await Transaction.aggregate([
                { $match: { 
                    type: 'MEMBERSHIP',
                    date: { $gte: start, $lte: end }
                } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            // Daily Product Revenue
            const dailyProduct = await Transaction.aggregate([
                { $match: { 
                    type: 'PRODUCT',
                    date: { $gte: start, $lte: end }
                } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            // Daily Expenses
             const dailyExpense = await Transaction.aggregate([
                { $match: { 
                    type: 'EXPENSE',
                    date: { $gte: start, $lte: end }
                } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            dailyData.push({
                name: format(date, 'EEE'), // Mon, Tue...
                services: dailyService[0]?.total || 0,
                memberships: dailyMembership[0]?.total || 0,
                products: dailyProduct[0]?.total || 0,
                expenses: dailyExpense[0]?.total || 0
            });
        }

        // 3. Recent Transactions
        // 3. Recent Transactions (Merge Bookings & Transactions)
        const recentTransDocs = await Transaction.find().sort({ date: -1 }).limit(10).lean();
        const recentBookingDocs = await Booking.find({ status: { $in: ['COMPLETED', 'CONFIRMED'] } })
            .sort({ date: -1 })
            .limit(10)
            .populate('serviceId')
            .lean();

        const mergedActivity = [
            ...recentTransDocs.map((t: any) => ({
                _id: t._id.toString(),
                description: t.description || (t.type === 'MEMBERSHIP' ? 'Membership Purchase' : 'Expense'),
                date: t.date,
                amount: t.amount,
                type: t.type // 'EXPENSE', 'MEMBERSHIP', 'PRODUCT'
            })),
            ...recentBookingDocs.map((b: any) => ({
                _id: b._id.toString(),
                description: `Service: ${b.serviceId?.name || 'Unknown Service'}`,
                date: b.date,
                amount: b.pricePaid,
                type: 'SERVICE'
            }))
        ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

        return NextResponse.json({
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                totalServices,
                totalMemberships,
                totalProducts
            },
            chartData: dailyData,
            recentTransactions: mergedActivity
        });
    
      } catch (error) {
        console.error("Finance API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
