import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Membership from "@/models/Membership"; // Ensure registered

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const membership = searchParams.get('membership');

    let query: any = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role && role !== 'ALL') {
        query.role = role;
    }
    
    // For membership filtering, we might need to find membership IDs first or populate and filter (heavier)
    // Or simpler: receive membershipId from frontend filter
    if (membership && membership !== 'ALL') {
        if (membership === 'NORMAL') {
            query.membershipId = null; 
        } else {
            query.membershipId = membership;
        }
    }

    const users = await User.find(query)
        .populate('membershipId')
        .sort({ createdAt: -1 })
        .lean();

    // Serialize just in case
    return NextResponse.json({ users: JSON.parse(JSON.stringify(users)) });

  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
