import { NextRequest, NextResponse } from "next/server";
import { signJWT } from "@/lib/auth-jwt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";

import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Data", details: validation.error.format() }, { status: 400 });
        }

        const { name, email, photo } = validation.data;

        await connectDB();

        let user = await User.findOne({ email });

        if (!user) {
            // Create new customer
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                image: photo || undefined,
                role: 'CUSTOMER' // Default role
            });
        }

        const token = await signJWT({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone
        });

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/"
        });

        return NextResponse.json({ 
            success: true, 
            user: { 
                id: user._id, 
                role: user.role, 
                name: user.name,
                phone: user.phone
            } 
        });

    } catch (error: any) {
        console.error("Login API Error:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error.message || "Unknown error" 
        }, { status: 500 });
    }
}
