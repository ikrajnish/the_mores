import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const service = await Service.findById(id).lean();
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Default to NORMAL pricing for unauthenticated or general display
    // If we want auth-specific pricing, we'd check session here.
    // For now, let's just return NORMAL price or maybe checking User session is better.
    // For simplicity in this `book` page flow, we'll fetch NORMAL price.
    // The actual booking creation (POST) verifies exact price for user.
    
    // NOTE: The `book/page.tsx` UI fetches this. It should ideally show the user's specific price.
    // I'll keep it simple for now and just fetch NORMAL price, or handle auth logic if I have time.
    // Let's just fetch NORMAL for consistent "base" price display.
    
    const normalMembership = await Membership.findOne({ name: "NORMAL" });
    let price = 0;
    if (normalMembership) {
        const pricing = await ServicePricing.findOne({
            serviceId: service._id,
            membershipId: normalMembership._id
        });
        if (pricing) price = pricing.price;
    }

    return NextResponse.json({
      ...service,
      price
    });
  } catch (error) {
    console.error("Fetch Service Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
