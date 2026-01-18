import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { name, duration, categoryId, image, shortDescription, pricing } = body;
        // pricing: [{ membershipId, price }]

        const service = await Service.findByIdAndUpdate(params.id, {
            name,
            duration,
            categoryId,
            image,
            shortDescription
        }, { new: true });

        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

        // Update Pricing
        if (Array.isArray(pricing)) {
            // Loop through and update/upsert
            for (const p of pricing) {
                await ServicePricing.findOneAndUpdate(
                    { serviceId: service._id, membershipId: p.membershipId },
                    { price: Number(p.price) },
                    { upsert: true, new: true }
                );
            }
        }

        return NextResponse.json({ success: true, service });
    
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        await Service.findByIdAndDelete(params.id);
        await ServicePricing.deleteMany({ serviceId: params.id });

        return NextResponse.json({ success: true });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
