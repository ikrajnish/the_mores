import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { phone } = await req.json();
        if (!phone || phone.length < 10) {
            return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
        }

        await connectDB();

        // Check availability
        const existing = await User.findOne({ phone, _id: { $ne: session.user.id } });
        if (existing) {
             return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
        }

        await User.findByIdAndUpdate(session.user.id, { 
            phone: phone 
        });

        // Re-issue session token with phone
        const { signJWT } = await import("@/lib/auth-jwt");
        const { cookies } = await import("next/headers");
        
        const newToken = await signJWT({
            ...session.user,
            phone: phone
        });

        const cookieStore = await cookies();
        cookieStore.set("session", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/"
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Complete Profile Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
