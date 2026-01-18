import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Membership from "@/models/Membership";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    // Get all memberships
    const memberships = await Membership.find().lean();
    
    // Get counts for each
    const counts = await User.aggregate([
        { $group: { _id: "$membershipId", count: { $sum: 1 } } }
    ]);
    
    // Merge counts
    const result = memberships.map((m: any) => {
        const c = counts.find((x: any) => String(x._id) === String(m._id));
        return { ...m, userCount: c?.count || 0 };
    });

    return NextResponse.json({ memberships: result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { id, price, description, benefits } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const membership = await Membership.findByIdAndUpdate(id, {
            price,
            description,
            benefits: Array.isArray(benefits) ? benefits : []
        }, { new: true });

        return NextResponse.json({ success: true, membership });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
