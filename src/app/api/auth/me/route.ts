import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import "@/models/Membership";

export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("-password -__v").populate("membershipId");

  if (!user) {
     return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      membershipExpiresAt: user.membershipExpiresAt,
      benefitsUsage: user.benefitsUsage,
      membership: user.membershipId ? {
          name: (user.membershipId as any).name,
          id: (user.membershipId as any)._id,
          benefits: (user.membershipId as any).benefits
      } : null
    },
  });
}
