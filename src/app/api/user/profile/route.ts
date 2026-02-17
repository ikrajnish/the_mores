import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    await connectDB();

    // Use ID from session for safety
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    if (error.code === 11000) {
        return NextResponse.json({ error: "Phone number already exists. This number is linked to another account." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
