import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP } from '@/lib/auth-otp';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. DUMMY CREDENTIALS LOGIC
    // If phone is one of the test numbers, we don't generate a random OTP.
    // We just ensure the DB record exists with the fixed hash for '123456' or similar, 
    // OR we simply skip DB update if we hardcode verification too.
    // Better approach: Let's treat them as real flows but force the OTP to be '123456'.
    let otpValue: string;
    
    if (phone === '9999999999' || phone === '8888888888') {
      otpValue = '123456';
    } else {
      otpValue = await generateOTP();
    }

    const hashedOtp = await hashOTP(otpValue);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP
    await OTP.findOneAndUpdate(
      { phone },
      { 
        otpHash: hashedOtp, 
        expiresAt,
        attempts: 0 
      },
      { upsert: true, new: true }
    );

    // In a real app, send SMS here.
    // console.log(`[DEV] OTP for ${phone}: ${otpValue}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      debugOtp: process.env.NODE_ENV === 'development' ? otpValue : undefined 
    });

  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
