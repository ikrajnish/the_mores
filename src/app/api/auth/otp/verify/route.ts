import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";
import { verifyOTP } from "@/lib/auth-otp";
import { signJWT } from "@/lib/auth-jwt";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Find OTP
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      );
    }

    const isValid = await verifyOTP(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 2. Create or get user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      const role = phone === "9999999999" ? "ADMIN" : "CUSTOMER";

      user = await User.create({
        phone,
        role,
        membershipId: null,
      });
    }

    // 3. Sign JWT (minimal payload)
    const token = await signJWT({
      userId: user._id.toString(),
    });

    // 4. Set cookie
    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // 5. Cleanup OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        isNewUser,
      },
    });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
